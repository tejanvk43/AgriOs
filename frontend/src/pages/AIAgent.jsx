import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Mic, Send, Camera, Image as ImageIcon, Volume2, VolumeX, StopCircle, RefreshCw, Languages, Video, VideoOff, SwitchCamera, X } from 'lucide-react';
import aiService from '../services/aiService';
import weatherService from '../services/weatherService';
import axios from 'axios';

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
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('auto');
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [weatherContext, setWeatherContext] = useState(null);
    const [showWelcome, setShowWelcome] = useState(true);

    const SUGGESTED_QUESTIONS = [
        "🍅 Tomato Market Price?",
        "🌾 How to cure Rice Blast?",
        "🌧️ Weather update for today?",
        "🚜 Best fertilizer for Cotton?"
    ];

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


    // Fetch History and Weather on Mount
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

        const initWeather = async () => {
            try {
                // 1. Try to get registered land first
                const token = localStorage.getItem('token');
                let foundGeo = null;

                if (token) {
                    try {
                        const res = await axios.get('/api/land', {
                            headers: { Authorization: `Bearer ${token}` }
                        });

                        if (res.data && res.data.length > 0) {
                            const land = res.data[0];
                            const query = `${land.village}, ${land.mandal}, ${land.district}`;
                            const geo = await weatherService.getCoordinates(query);
                            if (geo.found) {
                                foundGeo = geo;
                            }
                        }
                    } catch (e) { console.warn("AI Weather: Failed to fetch lands"); }
                }

                // 2. Fallback to geolocation
                if (!foundGeo) {
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                            async (position) => {
                                const data = await weatherService.getDetailedWeather(position.coords.latitude, position.coords.longitude);
                                setWeatherContext(data);
                            },
                            (err) => console.warn("AI Weather: Location denied")
                        );
                    }
                } else {
                    const data = await weatherService.getDetailedWeather(foundGeo.lat, foundGeo.lon);
                    setWeatherContext(data);
                }

            } catch (err) {
                console.error("AI Weather Init Error:", err);
            }
        };

        fetchHistory();
        initWeather();
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
                setShowWelcome(false);
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
            setShowWelcome(false);

            let response;
            if (isVoiceMode) {
                // Unified Voice Route
                response = await aiService.getVoiceResponse(text, currentLang, imageToSend, weatherContext);
                if (response.audioBase64) playAudioResponse(response.audioBase64);
            } else {
                // Chat Mode
                if (imageToSend) {
                    response = await aiService.chatWithAgent(text, imageToSend, currentLang, weatherContext);
                } else {
                    response = await aiService.chatWithAgent(text, null, currentLang, weatherContext);
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
    }, [messages, isLoading]);

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden relative">
            {/* Header / Controls */}
            <div className="flex flex-wrap items-center justify-between bg-white dark:bg-gray-800 shadow p-3 px-4 gap-3 z-10 shrink-0">
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-full p-1.5 shadow-inner">
                    <button
                        onClick={() => { stopSpeaking(); setMode('live'); }}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${mode === 'live' ? 'bg-green-600 text-white shadow-md transform scale-105' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                    >
                        Live
                    </button>
                    <button
                        onClick={() => { stopSpeaking(); setMode('chat'); }}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${mode === 'chat' ? 'bg-green-600 text-white shadow-md transform scale-105' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                    >
                        Chat
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <Languages size={20} className="text-gray-500 hidden sm:block" />
                    <select
                        value={selectedLanguage}
                        onChange={(e) => { setSelectedLanguage(e.target.value); stopSpeaking(); }}
                        className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-xl focus:ring-green-500 focus:border-green-500 block p-2.5 min-w-[140px]"
                    >
                        {LANGUAGES.map(lang => (<option key={lang.value} value={lang.value}>{lang.label}</option>))}
                    </select>
                </div>
            </div>

            <div className="flex-1 relative overflow-hidden flex flex-col md:flex-row">
                {/* Live Mode Area */}
                {mode === 'live' && (
                    <div className="relative w-full h-full md:w-1/2 lg:w-2/3 bg-black flex flex-col items-center justify-center overflow-hidden bg-grid-white/[0.05]">
                        {/* Camera Feed */}
                        <div className="relative w-full h-full max-w-4xl aspect-[3/4] md:aspect-video lg:aspect-auto lg:h-full">
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
                                        className="absolute inset-0 w-full h-full cursor-crosshair touch-none z-10"
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
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-gray-500 p-8 text-center">
                                    <div className="p-6 bg-gray-800 rounded-full mb-4">
                                        <VideoOff size={48} className="opacity-50" />
                                    </div>
                                    <p className="text-lg font-medium">Camera is Off</p>
                                    <p className="text-sm opacity-60 mt-1">Enable camera for AI analysis or switch to Chat mode.</p>
                                </div>
                            )}

                            {/* Mobile-Optimized Top Controls */}
                            <div className="absolute top-4 right-4 flex flex-col gap-3 z-30">
                                <button onClick={switchCamera} className="p-3 bg-black/40 backdrop-blur-md border border-white/10 text-white rounded-full hover:bg-black/60 transition active:scale-95 shadow-lg"><SwitchCamera size={22} /></button>
                                <button onClick={toggleCamera} className="p-3 bg-black/40 backdrop-blur-md border border-white/10 text-white rounded-full hover:bg-black/60 transition active:scale-95 shadow-lg">{isCameraOn ? <Video size={22} /> : <VideoOff size={22} />}</button>
                                <button onClick={toggleMute} className={`p-3 rounded-full hover:bg-black/60 transition active:scale-95 shadow-lg border border-white/10 backdrop-blur-md ${isMuted ? 'bg-red-500 text-white' : 'bg-black/40 text-white'}`}>{isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}</button>
                            </div>

                            {/* Drawing Toolbar */}
                            {isCameraOn && (
                                <div className="absolute top-1/2 left-4 -translate-y-1/2 flex flex-col gap-3 z-30 bg-black/40 backdrop-blur-md p-2.5 rounded-full border border-white/10 shadow-xl">
                                    {COLORS.map((c) => (
                                        <button
                                            key={c.color}
                                            onClick={() => { setPenColor(c.color); setTool('pen'); }}
                                            className={`w-9 h-9 rounded-full border-2 transition-transform ${penColor === c.color && tool === 'pen' ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                                            style={{ backgroundColor: c.color }}
                                            title={c.label}
                                        />
                                    ))}
                                    <div className="h-px bg-white/20 my-1 mx-2" />
                                    <button
                                        onClick={() => setTool('eraser')}
                                        className={`p-2.5 rounded-full text-white transition-all ${tool === 'eraser' ? 'bg-white text-black shadow-lg scale-105' : 'hover:bg-white/20'}`}
                                        title="Eraser"
                                    >
                                        <div className="w-5 h-5 border-2 border-current rounded-sm transform rotate-45" />
                                    </button>
                                    <button
                                        onClick={clearCanvas}
                                        className="p-2.5 text-white hover:text-red-400 transition-colors active:scale-90"
                                        title="Clear All"
                                    >
                                        <RefreshCw size={22} />
                                    </button>
                                </div>
                            )}

                            {/* Bottom Action Bar */}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-20 pb-8 px-6 flex flex-col items-center gap-5 z-20">
                                {/* Latest AI Reply Overlay */}
                                {messages.length > 0 && messages[messages.length - 1].sender === 'ai' && (
                                    <div className="bg-black/60 backdrop-blur-md p-4 rounded-2xl text-white text-center max-h-[40vh] overflow-y-auto w-full max-w-lg border border-white/20 flex flex-col items-center gap-3 animate-slide-up shadow-2xl">
                                        <p className="text-lg md:text-xl font-medium leading-relaxed">{messages[messages.length - 1].text}</p>
                                    </div>
                                )}

                                <div className="flex items-center gap-8">
                                    <button
                                        onClick={toggleListening}
                                        className={`p-5 rounded-full shadow-2xl transition-all duration-300 transform ${isListening ? 'bg-red-500 scale-110 animate-pulse ring-4 ring-red-500/30' : 'bg-green-600 hover:scale-110 hover:bg-green-500 ring-4 ring-green-600/30'}`}
                                        title={isListening ? "Stop Listening" : "Start Listening"}
                                    >
                                        {isListening ? <StopCircle size={40} color="white" /> : <Mic size={40} color="white" />}
                                    </button>

                                    {isSpeaking && (
                                        <button onClick={stopSpeaking} className="p-4 bg-gray-700/80 backdrop-blur-sm rounded-full text-white hover:bg-gray-600 transition shadow-lg animate-bounce-in">
                                            <VolumeX size={24} />
                                        </button>
                                    )}
                                </div>
                                <p className="text-white/90 text-sm font-medium tracking-wide drop-shadow-md bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
                                    {isListening ? `Listening (${selectedLanguage})...` : isMuted ? "Muted" : "Tap Mic to Speak"}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Chat History Panel */}
                <div className={`${mode === 'live' ? 'hidden md:flex w-full md:w-1/2 lg:w-1/3 border-l border-gray-200 dark:border-gray-700' : 'flex w-full'} flex-col bg-white dark:bg-gray-800 h-full`}>
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-200 shadow-sm flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                        <span>Conversation History</span>
                        <span className="text-xs font-normal text-gray-500">{messages.length} messages</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">

                        {/* Welcome View */}
                        {messages.length === 0 && showWelcome && (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-fade-in p-6">
                                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-700">
                                    <span className="text-5xl">🌾</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Namaste! I am AgriGenius</h2>
                                    <p className="text-gray-600 dark:text-gray-400 mt-2">Your friendly farming companion. Ask me anything!</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
                                    {SUGGESTED_QUESTIONS.map((q, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSend(q)}
                                            className="px-4 py-3 bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl text-left text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm transition-all hover:scale-[1.02] flex items-center gap-2"
                                        >
                                            <span className="text-green-600">➜</span> {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in gap-3 group`}>
                                {/* Avatar AI */}
                                {msg.sender === 'ai' && (
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 border border-green-200 shadow-sm self-end mb-1">
                                        <span className="text-lg">🤖</span>
                                    </div>
                                )}

                                <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm relative ${msg.sender === 'user' ? 'bg-gradient-to-br from-green-600 to-green-700 text-white rounded-tr-none' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-600'}`}>
                                    {msg.image && (
                                        <div className="relative mb-3 group/img">
                                            <img src={msg.image} alt="Upload" className="max-w-full h-auto max-h-64 object-cover rounded-lg shadow-md transition-transform group-hover/img:scale-[1.02]" />
                                            {msg.boxes && msg.boxes.map((box, idx) => (
                                                <div
                                                    key={`${msg.id}-box-${idx}`}
                                                    className="absolute border-2 border-red-500 bg-red-500/10 rounded-sm"
                                                    style={{
                                                        top: `${box.ymin / 10}%`,
                                                        left: `${box.xmin / 10}%`,
                                                        height: `${(box.ymax - box.ymin) / 10}%`,
                                                        width: `${(box.xmax - box.xmin) / 10}%`
                                                    }}
                                                >
                                                    <span className="absolute -top-6 left-0 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded shadow-sm">{box.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                </div>

                                {/* Avatar User */}
                                {msg.sender === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 border border-blue-200 shadow-sm self-end mb-1">
                                        <span className="text-lg">👤</span>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {isLoading && (
                            <div className="flex justify-start animate-fade-in gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 border border-green-200 shadow-sm self-end mb-1">
                                    <span className="text-lg">🤖</span>
                                </div>
                                <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-tl-none p-4 border border-gray-100 dark:border-gray-600 shadow-sm flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input Area */}
                    {mode === 'chat' && (
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 z-20">
                            <div className="bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-3 transition-colors focus-within:ring-2 focus-within:ring-green-500/50 focus-within:border-green-500">
                                <label className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl cursor-pointer text-gray-500 transition-colors">
                                    <ImageIcon size={22} />
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                </label>
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-base py-2"
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={isLoading}
                                    className={`p-2.5 rounded-xl text-white transition-all transform ${isLoading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700 active:scale-95 shadow-md'}`}
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIAgent;
