import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Mic, Send, Camera, Image as ImageIcon, Volume2, VolumeX, StopCircle, RefreshCw, Languages, Video, VideoOff, SwitchCamera, X } from 'lucide-react';
import aiService from '../services/aiService';

const LANGUAGES = [
    { label: "Auto Detect", value: "auto" },
    { label: "English (India)", value: "en-IN" },
    { label: "Hindi (हिंदी)", value: "hi-IN" },
    { label: "Telugu (తెలుగు)", value: "te-IN" },
    { label: "Tamil (தமிழ்)", value: "ta-IN" },
    { label: "Kannada (ಕನ್ನಡ)", value: "kn-IN" },
    { label: "Malayalam (മലയാളം)", value: "ml-IN" },
    { label: "Marathi (मराठी)", value: "mr-IN" },
    { label: "Bengali (বাংলা)", value: "bn-IN" },
    { label: "Gujarati (ગુજરાતી)", value: "gu-IN" },
    { label: "Punjabi (ਪੰਜਾਬੀ)", value: "pa-IN" },
    { label: "Odia (ଓଡ଼ିଆ)", value: "or-IN" }
];

const AIAgent = () => {
    const [mode, setMode] = useState('live');
    const [messages, setMessages] = useState([
        { id: 1, sender: 'ai', text: 'Namaste! I am AgriGenius. Select your language and speak to me.' }
    ]);
    const [inputText, setInputText] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('en-IN');
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    // New Controls State
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [facingMode, setFacingMode] = useState('environment'); // 'user' or 'environment'
    const [isMuted, setIsMuted] = useState(false);

    const webcamRef = useRef(null);
    const messagesEndRef = useRef(null);
    const recognition = useRef(null);
    const audioRef = useRef(null);

    // Fetch History on Mount
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await aiService.getHistory();
                if (history && history.length > 0) {
                    const formatted = history.map(msg => ({
                        id: msg._id,
                        sender: msg.sender,
                        text: msg.text,
                        image: msg.imageUrl
                    }));
                    setMessages(formatted);
                }
            } catch (error) {
                console.error("Failed to load history", error);
            }
        };
        fetchHistory();
    }, []);

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognition.current = new SpeechRecognition();
            recognition.current.continuous = false;
            recognition.current.interimResults = false;
            recognition.current.lang = 'en-IN';

            recognition.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInputText(transcript);
                handleSend(transcript);
            };

            recognition.current.onend = () => {
                setIsListening(false);
            };
        }
    }, [selectedLanguage]); // Re-init if lang changes significantly? No, just update prop

    const toggleListening = () => {
        if (!recognition.current) return;
        if (isSpeaking) stopSpeaking();

        if (isListening) {
            try {
                recognition.current.stop();
                setIsListening(false);
            } catch (e) { console.error(e); }
        } else {
            setInputText('');
            recognition.current.lang = selectedLanguage === 'auto' ? 'en-IN' : selectedLanguage;
            try {
                recognition.current.start();
                setIsListening(true);
            } catch (e) {
                if (e.name === 'InvalidStateError' || e.message.includes('already started')) {
                    setIsListening(true);
                }
            }
        }
    };

    const playAudioResponse = (base64Audio) => {
        if (!base64Audio || isMuted) return;

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        const audio = new Audio("data:audio/mp3;base64," + base64Audio);
        audioRef.current = audio;

        audio.onplay = () => setIsSpeaking(true);
        audio.onended = () => {
            setIsSpeaking(false);
            if (mode === 'live' && !isMuted) {
                setTimeout(() => toggleListening(), 1200); // 1.2s delay to prevent echo loop
            }
        };

        audio.play().catch(e => console.error("Audio Play Error:", e));
    };

    const stopSpeaking = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        window.speechSynthesis.cancel(); // Stop fallback TTS
        setIsSpeaking(false);
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (!isMuted && isSpeaking) stopSpeaking();
    };

    const toggleCamera = () => setIsCameraOn(!isCameraOn);

    const switchCamera = () => {
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    };

    const handleSend = async (textOverride = null) => {
        stopSpeaking();
        const text = textOverride || inputText;
        if (!text.trim() && !selectedImage && !isCameraOn) return;

        const currentLang = selectedLanguage;
        const isVoiceMode = mode === 'live';
        let imageToSend = selectedImage;
        let previewUrl = selectedImage ? URL.createObjectURL(selectedImage) : null;

        setIsLoading(true);

        try {
            // 1. Capture Image FIRST if in Live Mode
            if (isVoiceMode && !imageToSend && isCameraOn && webcamRef.current) {
                const imageSrc = webcamRef.current.getScreenshot();
                if (imageSrc) {
                    const res = await fetch(imageSrc);
                    const blob = await res.blob();
                    imageToSend = new File([blob], "webcam-capture.jpg", { type: "image/jpeg" });
                    previewUrl = URL.createObjectURL(blob);
                }
            }

            // 2. Optimistic Update with the CAPTURED image
            const tempMsg = {
                id: Date.now(),
                sender: 'user',
                text: text,
                image: previewUrl
            };
            setMessages(prev => [...prev, tempMsg]);
            setInputText('');
            setSelectedImage(null);

            let response;
            if (isVoiceMode) {
                // Unified Voice Route
                response = await aiService.getVoiceResponse(text, currentLang, imageToSend);
                if (response.audioBase64) playAudioResponse(response.audioBase64);
            } else {
                // Chat Mode
                if (imageToSend) {
                    response = await aiService.chatWithAgent(text, imageToSend, currentLang);
                } else {
                    response = await aiService.chatWithAgent(text, null, currentLang);
                }
            }

            const aiText = response.response || response.replyText;
            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: aiText }]);

        } catch (error) {
            console.error("AI Error:", error);
            const errorText = "Sorry, connection error.";
            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: errorText }]);
            if (isVoiceMode && !isMuted) {
                const u = new SpeechSynthesisUtterance(errorText);
                window.speechSynthesis.speak(u);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedImage(e.target.files[0]);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] lg:h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
            {/* Header / Controls */}
            <div className="flex flex-wrap items-center justify-between bg-white dark:bg-gray-800 shadow p-2 px-4 gap-2 z-10 shrink-0">
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-full p-1">
                    <button onClick={() => { stopSpeaking(); setMode('live'); }} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${mode === 'live' ? 'bg-green-600 text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>Live</button>
                    <button onClick={() => { stopSpeaking(); setMode('chat'); }} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${mode === 'chat' ? 'bg-green-600 text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>Chat</button>
                </div>
                <div className="flex items-center gap-2">
                    <Languages size={18} className="text-gray-500" />
                    <select value={selectedLanguage} onChange={(e) => { setSelectedLanguage(e.target.value); stopSpeaking(); }} className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-1.5">
                        {LANGUAGES.map(lang => (<option key={lang.value} value={lang.value}>{lang.label}</option>))}
                    </select>
                </div>
            </div>

            <div className="flex-1 relative overflow-hidden flex flex-col md:flex-row">
                {/* Live Mode Area */}
                {mode === 'live' && (
                    <div className="relative w-full h-full md:w-1/2 lg:w-2/3 bg-black flex flex-col">
                        {/* Camera Feed */}
                        {isCameraOn ? (
                            <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="absolute inset-0 w-full h-full object-cover" videoConstraints={{ facingMode: facingMode }} />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-gray-500">
                                <VideoOff size={48} />
                                <p className="mt-2 text-sm">Camera Off</p>
                            </div>
                        )}

                        {/* Top Controls Overlay */}
                        <div className="absolute top-4 right-4 flex flex-col gap-2">
                            <button onClick={switchCamera} className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70"><SwitchCamera size={20} /></button>
                            <button onClick={toggleCamera} className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70">{isCameraOn ? <Video size={20} /> : <VideoOff size={20} />}</button>
                            <button onClick={toggleMute} className={`p-2 rounded-full hover:bg-black/70 ${isMuted ? 'bg-red-500 text-white' : 'bg-black/50 text-white'}`}>{isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}</button>
                        </div>

                        {/* Bottom Action Bar */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 flex flex-col items-center gap-4">
                            {/* Latest AI Reply Overlay */}
                            {messages.length > 0 && messages[messages.length - 1].sender === 'ai' && (
                                <div className="bg-black/60 backdrop-blur-sm p-4 rounded-xl text-white text-center max-h-40 overflow-y-auto w-full max-w-xl border border-white/20">
                                    <p className="text-lg font-medium">{messages[messages.length - 1].text}</p>
                                </div>
                            )}
                            <div className="flex items-center gap-6">
                                <button onClick={toggleListening} className={`p-6 rounded-full shadow-lg transition-all scale-100 hover:scale-105 ${isListening ? 'bg-red-500 animate-pulse' : 'bg-green-600'}`}>
                                    {isListening ? <StopCircle size={32} color="white" /> : <Mic size={32} color="white" />}
                                </button>
                                {isSpeaking && (
                                    <button onClick={stopSpeaking} className="p-4 bg-gray-700/80 rounded-full text-white hover:bg-gray-600">
                                        <VolumeX size={24} />
                                    </button>
                                )}
                            </div>
                            <p className="text-white/80 text-sm font-medium">{isListening ? `Listening (${selectedLanguage})...` : isMuted ? "Muted" : "Tap Mic to Speak"}</p>
                        </div>
                    </div>
                )}

                {/* Chat History Panel (Always visible in Chat mode, Side panel in Live mode on large screens?) */}
                {/* User check: "Putted in chat... shown on right side if large screen... small screen after call" */}
                {/* Implementation: On md+, show chat panel on right (1/3 width). On sm, if Chat mode, show full. If Live mode, hide (using overlay for latest). */}

                <div className={`${mode === 'live' ? 'hidden md:flex w-full md:w-1/2 lg:w-1/3 border-l border-gray-200 dark:border-gray-700' : 'flex w-full'} flex-col bg-white dark:bg-gray-800`}>
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-200">
                        Conversation History
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${msg.sender === 'user' ? 'bg-green-600 text-white rounded-tr-none' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none'}`}>
                                    {msg.image && <img src={msg.image} alt="Upload" className="max-w-full h-32 object-cover rounded mb-2" />}
                                    <p className="text-sm">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area (Only active if not in Live mode or if we want hybrid?) */}
                    {mode === 'chat' && (
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                            <div className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-2">
                                <label className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full cursor-pointer text-gray-500">
                                    <ImageIcon size={20} />
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                </label>
                                <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Type a message..." className="flex-1 bg-transparent border-none focus:ring-0 text-sm" />
                                <button onClick={() => handleSend()} disabled={isLoading} className="p-2 bg-green-600 rounded-full text-white"><Send size={18} /></button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIAgent;
