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
    const [selectedLanguage, setSelectedLanguage] = useState('auto');
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    // New Controls State
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [facingMode, setFacingMode] = useState('environment'); // 'user' or 'environment'
    const [isMuted, setIsMuted] = useState(false);

    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const messagesEndRef = useRef(null);
    const recognition = useRef(null);
    const audioRef = useRef(null);

    // Drawing State
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState('pen'); // 'pen' or 'eraser'
    const [penColor, setPenColor] = useState('#00FF00'); // Default Green

    const COLORS = [
        { color: '#00FF00', label: 'Green' }, // Good for highlighting
        { color: '#FF0000', label: 'Red' },   // Good for warnings/pests
        { color: '#FFFF00', label: 'Yellow' },
        { color: '#3B82F6', label: 'Blue' },
        { color: '#FFFFFF', label: 'White' },
    ];

    // Drawing Handlers
    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        // Handle scaling (since canvas internal size might differ from display size)
        // Ideally we should set canvas width/height to match clientWidth/Height on mount/resize
        // For now, simpler:
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        ctx.beginPath();
        ctx.moveTo(x * scaleX, y * scaleY);
        ctx.lineWidth = tool === 'eraser' ? 20 : 4;
        ctx.lineCap = 'round';
        if (tool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = penColor;
        }
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0);
        const clientY = e.clientY || (e.touches ? e.touches[0].clientY : 0);

        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        ctx.lineTo(x * scaleX, y * scaleY);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    // Ensure canvas size matches display on mount/resize
    useEffect(() => {
        if (canvasRef.current) {
            canvasRef.current.width = canvasRef.current.offsetWidth;
            canvasRef.current.height = canvasRef.current.offsetHeight;
        }
    }, [mode]); // Reset on mode change


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

        // --- 1. VOICE CONTROL: STOP COMMAND ---
        // --- 1. VOICE CONTROL: STOP COMMAND ---
        const stopKeywords = ['stop', 'ruko', 'nillu', 'aagandi', 'thamb', 'wait', 'cancel', 'exit'];
        const lowerText = text.toLowerCase().trim();
        // Only stop if the text is EXACTLY the keyword, or a very short phrase starting with it (e.g. "stop talking")
        const isStopCommand = stopKeywords.some(kw =>
            lowerText === kw ||
            (lowerText.startsWith(kw) && lowerText.split(' ').length <= 3)
        );

        if (text && isStopCommand) {
            stopSpeaking();
            setIsListening(false);
            setMessages(prev => [...prev, { id: Date.now() + Math.random(), sender: 'user', text: text }, { id: Date.now() + 1 + Math.random(), sender: 'ai', text: "Stopped." }]);
            return; // EXIT EARLY
        }
        // --------------------------------------
        // --------------------------------------

        if (!text.trim() && !selectedImage && !isCameraOn) return;

        const currentLang = selectedLanguage;
        const isVoiceMode = mode === 'live';
        let imageToSend = selectedImage;
        let previewUrl = selectedImage ? URL.createObjectURL(selectedImage) : null;

        setIsLoading(true);

        try {
            // 2. Capture Image + Drawing Compilation
            if (isVoiceMode && !imageToSend && isCameraOn && webcamRef.current) {
                // Method: Get video frame -> Draw to temp canvas -> Draw Overlay -> To Blob
                const video = webcamRef.current.video;
                const overlayCanvas = canvasRef.current;

                if (video && overlayCanvas) {
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = video.videoWidth;
                    tempCanvas.height = video.videoHeight;
                    const ctx = tempCanvas.getContext('2d');

                    // Draw Video Frame
                    ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

                    // Draw Overlay (Scale if necessary)
                    // Note: overlayCanvas size = display size. video size = resolution.
                    // drawImage scales automatically if we pass width/height
                    ctx.drawImage(overlayCanvas, 0, 0, tempCanvas.width, tempCanvas.height);

                    // Convert to Blob
                    const blob = await new Promise(resolve => tempCanvas.toBlob(resolve, 'image/jpeg', 0.8));
                    imageToSend = new File([blob], "annotated-capture.jpg", { type: "image/jpeg" });
                    previewUrl = URL.createObjectURL(blob);

                    // Clear drawing after sending? Optional. Let's keep it until reply comes or user clears.
                    // clearCanvas(); 
                }
            }

            // 2. Optimistic Update with the CAPTURED image
            const tempMsg = {
                id: Date.now() + Math.random(),
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
            setMessages(prev => [...prev, {
                id: Date.now() + 1 + Math.random(),
                sender: 'ai',
                text: aiText,
                boxes: response.boxes // Store boxes from backend
            }]);

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
                        <div className="relative w-full h-full">
                            {isCameraOn ? (
                                <>
                                    <Webcam
                                        audio={false}
                                        ref={webcamRef}
                                        screenshotFormat="image/jpeg"
                                        className="absolute inset-0 w-full h-full object-cover"
                                        videoConstraints={{ facingMode: facingMode }}
                                    />
                                    {/* Drawing Canvas Overlay */}
                                    <canvas
                                        ref={canvasRef}
                                        className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                        onTouchStart={startDrawing}
                                        onTouchMove={draw}
                                        onTouchEnd={stopDrawing}
                                    />
                                </>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-gray-500">
                                    <VideoOff size={48} />
                                    <p className="mt-2 text-sm">Camera Off</p>
                                </div>
                            )}
                        </div>

                        {/* Top Controls Overlay */}
                        <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                            <button onClick={switchCamera} className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70"><SwitchCamera size={20} /></button>
                            <button onClick={toggleCamera} className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70">{isCameraOn ? <Video size={20} /> : <VideoOff size={20} />}</button>
                            <button onClick={toggleMute} className={`p-2 rounded-full hover:bg-black/70 ${isMuted ? 'bg-red-500 text-white' : 'bg-black/50 text-white'}`}>{isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}</button>
                        </div>

                        {/* Drawing Toolbar (Left Side) */}
                        {isCameraOn && (
                            <div className="absolute top-1/2 left-4 -translate-y-1/2 flex flex-col gap-3 z-20 bg-black/40 p-2 rounded-full backdrop-blur-sm">
                                {COLORS.map((c) => (
                                    <button
                                        key={c.color}
                                        onClick={() => { setPenColor(c.color); setTool('pen'); }}
                                        className={`w-8 h-8 rounded-full border-2 ${penColor === c.color && tool === 'pen' ? 'border-white scale-110' : 'border-transparent'}`}
                                        style={{ backgroundColor: c.color }}
                                        title={c.label}
                                    />
                                ))}
                                <div className="h-px bg-white/20 my-1" />
                                <button
                                    onClick={() => setTool('eraser')}
                                    className={`p-2 rounded-full text-white transition-all ${tool === 'eraser' ? 'bg-white text-black' : 'hover:bg-white/20'}`}
                                    title="Eraser"
                                >
                                    <div className="w-4 h-4 border-2 border-current rounded-sm transform rotate-45" />
                                    {/* Simple Eraser Icon or import from lucide if available. Using CSS shape for now or Eraser icon if imported */}
                                </button>
                                <button
                                    onClick={clearCanvas}
                                    className="p-2 text-white hover:text-red-400 transition-colors"
                                    title="Clear All"
                                >
                                    <RefreshCw size={20} />
                                </button>
                            </div>
                        )}

                        {/* Bottom Action Bar */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 flex flex-col items-center gap-4">
                            {/* Latest AI Reply Overlay */}
                            {messages.length > 0 && messages[messages.length - 1].sender === 'ai' && (
                                <div className="bg-black/60 backdrop-blur-sm p-4 rounded-xl text-white text-center max-h-[60vh] overflow-y-auto w-full max-w-xl border border-white/20 flex flex-col items-center gap-3">
                                    {/* Show Analyzed Image with Boxes in Live Mode */}
                                    {messages[messages.length - 1].image && (
                                        <div className="relative w-full max-w-[200px] aspect-square rounded-lg overflow-hidden border border-white/30 shrink-0">
                                            <img src={messages[messages.length - 1].image} alt="Analyzed" className="w-full h-full object-cover" />
                                            {messages[messages.length - 1].boxes && messages[messages.length - 1].boxes.map((box, idx) => (
                                                <div
                                                    key={idx}
                                                    className="absolute border-2 border-red-500 bg-red-500/20"
                                                    style={{
                                                        top: `${box.ymin / 10}%`,
                                                        left: `${box.xmin / 10}%`,
                                                        height: `${(box.ymax - box.ymin) / 10}%`,
                                                        width: `${(box.xmax - box.xmin) / 10}%`
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}
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
                                <div className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${msg.sender === 'user' ? 'bg-green-600 text-white rounded-tr-none' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none relative'}`}>
                                    {msg.image && (
                                        <div className="relative mb-2">
                                            <img src={msg.image} alt="Upload" className="max-w-full h-auto max-h-64 object-cover rounded" />
                                            {msg.boxes && msg.boxes.map((box, idx) => (
                                                <div
                                                    key={`${msg.id}-box-${idx}`}
                                                    className="absolute border-2 border-red-500 bg-red-500/20 rounded-sm"
                                                    style={{
                                                        top: `${box.ymin / 10}%`,
                                                        left: `${box.xmin / 10}%`,
                                                        height: `${(box.ymax - box.ymin) / 10}%`,
                                                        width: `${(box.xmax - box.xmin) / 10}%`
                                                    }}
                                                >
                                                    <span className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-1 rounded">{box.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
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
