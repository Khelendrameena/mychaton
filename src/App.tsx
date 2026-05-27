import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Video, 
  MessageSquare, 
  SkipForward, 
  User, 
  Settings, 
  Shield, 
  Search, 
  Send, 
  Mic, 
  MicOff, 
  VideoOff, 
  Camera,
  Flag,
  X,
  Smile,
  Image as ImageIcon,
  LogOut,
  LayoutDashboard,
  Phone,
  Paperclip,
  MoreVertical,
  Check,
  ChevronRight,
  Sticker
} from 'lucide-react';
import { getSocket } from './services/socket';
import { cn } from './lib/utils';
import { Message, MatchInfo } from './types';
import { v4 as uuidv4 } from 'uuid';

// --- Components ---

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 1800);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-tg-bg via-tg-bg to-tg-tertiary"
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-24 h-24 bg-gradient-to-br from-tg-blue to-cyan-400 rounded-3xl flex items-center justify-center shadow-2xl shadow-tg-blue/30"
      >
        <MessageSquare className="w-12 h-12 text-tg-bg fill-current" />
      </motion.div>
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mt-8 text-4xl font-bold tracking-tight"
      >
        ChatOn
      </motion.h1>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: 100 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="mt-6 h-1 bg-gradient-to-r from-transparent via-tg-blue to-transparent rounded-full"
      />
    </motion.div>
  );
};

const AgeVerificationView = ({ onConfirm }: { onConfirm: () => void }) => (
  <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-tg-bg via-tg-secondary to-tg-tertiary">
    <motion.div 
      initial={{ scale: 0.85, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-md w-full tg-card text-center space-y-8 py-12"
    >
      <div className="w-20 h-20 bg-red-500/15 rounded-full flex items-center justify-center mx-auto">
        <Shield className="w-10 h-10 text-red-400" />
      </div>
      <div className="space-y-3">
        <h2 className="text-3xl font-bold">Age Verification</h2>
        <p className="text-tg-hint text-sm px-4 leading-relaxed">
          You must be at least 18 years old to use ChatOn. By continuing, you confirm that you are of legal age.
        </p>
      </div>
      <div className="pt-4 space-y-3">
        <button 
          onClick={onConfirm}
          className="tg-btn w-full"
        >
          I am 18 or older
        </button>
        <button className="w-full py-3 bg-tg-tertiary hover:bg-tg-tertiary/80 rounded-xl font-medium text-tg-hint transition-all border border-tg-border/50">
          Exit
        </button>
      </div>
    </motion.div>
  </div>
);

const ProfileSetupView = ({ onComplete }: { onComplete: (data: { name: string; gender: string }) => void }) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-tg-bg via-tg-secondary to-tg-tertiary">
      <motion.div 
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full tg-card space-y-8 py-12"
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Create Profile</h2>
          <p className="text-tg-hint text-sm">Tell us about yourself</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-tg-hint uppercase tracking-widest ml-1">Your Name</label>
            <input 
              type="text"
              placeholder="Enter your name"
              className="w-full bg-tg-tertiary border border-tg-border/50 rounded-xl px-4 py-3 outline-none focus:border-tg-blue focus:shadow-lg focus:shadow-tg-blue/20 transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-tg-hint uppercase tracking-widest ml-1">Gender</label>
            <div className="grid grid-cols-3 gap-3">
              {['Male', 'Female', 'Other'].map(g => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={cn(
                    "py-2.5 rounded-xl border font-medium transition-all text-sm",
                    gender === g ? "bg-tg-blue border-tg-blue text-tg-bg shadow-lg shadow-tg-blue/30" : "bg-tg-tertiary border-tg-border/50 text-tg-hint hover:border-tg-blue/30"
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          disabled={!name || !gender}
          onClick={() => onComplete({ name, gender })}
          className="tg-btn w-full text-base py-3 flex items-center justify-center gap-2"
        >
          Continue
          <ChevronRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
};

const Header = ({ onOpenSettings, onOpenAdmin }: { onOpenSettings: () => void; onOpenAdmin: () => void }) => (
  <header className="h-16 border-b border-tg-border/30 flex items-center justify-between px-6 sticky top-0 z-40 glass">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 bg-gradient-to-br from-tg-blue to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-tg-blue/20">
        <MessageSquare className="w-5 h-5 text-tg-bg fill-current" />
      </div>
      <span className="font-bold text-xl tracking-tight">ChatOn</span>
    </div>
    <div className="flex items-center gap-2">
      <button onClick={onOpenAdmin} className="p-2.5 hover:bg-tg-blue/10 rounded-full transition-colors text-tg-hint hover:text-tg-blue">
        <LayoutDashboard className="w-5 h-5" />
      </button>
      <button onClick={onOpenSettings} className="p-2.5 hover:bg-tg-blue/10 rounded-full transition-colors text-tg-hint hover:text-tg-blue">
        <Settings className="w-5 h-5" />
      </button>
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-tg-blue via-cyan-400 to-blue-500 flex items-center justify-center text-xs font-bold text-tg-bg shadow-lg shadow-tg-blue/20">
        JD
      </div>
    </div>
  </header>
);

const InterestTag = ({ label, onRemove }: { label: string; onRemove?: () => void; key?: string }) => (
  <motion.span 
    layout
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.8, opacity: 0 }}
    className="inline-flex items-center gap-2 px-3 py-1.5 bg-tg-blue/15 text-tg-blue rounded-full text-sm border border-tg-blue/30 hover:border-tg-blue/60 transition-all"
  >
    {label}
    {onRemove && (
      <button onClick={onRemove} className="hover:text-tg-blue/60 p-0.5 hover:bg-tg-blue/10 rounded-full transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    )}
  </motion.span>
);

const HomeView = ({ onStart }: { onStart: (interests: string[]) => void }) => {
  const [interests, setInterests] = useState<string[]>(['Tech', 'Music', 'Gaming']);
  const [newInterest, setNewInterest] = useState('');

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto pt-8 px-6 pb-8">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="tg-card text-center space-y-8 py-12"
      >
        <div className="space-y-3">
          <h2 className="text-4xl font-bold">Ready to connect?</h2>
          <p className="text-tg-hint text-lg">Join thousands of people online right now</p>
        </div>

        <div className="space-y-4 text-left">
          <label className="text-sm font-semibold text-tg-hint ml-1 uppercase tracking-wider">Your Interests</label>
          <div className="flex flex-wrap gap-2 min-h-[50px] p-4 bg-tg-tertiary rounded-xl border border-tg-border/50 focus-within:border-tg-blue/50 transition-all">
            <AnimatePresence mode="popLayout">
              {interests.map(tag => (
                <InterestTag key={tag} label={tag} onRemove={() => setInterests(interests.filter(t => t !== tag))} />
              ))}
            </AnimatePresence>
            <input 
              type="text"
              placeholder="Add interest..."
              className="bg-transparent outline-none text-sm flex-1 min-w-[100px]"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addInterest()}
            />
          </div>
        </div>

        <button 
          onClick={() => onStart(interests)}
          className="tg-btn w-full text-lg py-3.5 flex items-center justify-center gap-2 group"
        >
          <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
          Start Chatting
        </button>

        <div className="grid grid-cols-3 gap-4">
          <motion.div 
            whileHover={{ y: -4 }}
            className="p-5 bg-tg-tertiary rounded-xl border border-tg-border/50 flex flex-col items-center gap-3"
          >
            <Shield className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-medium text-tg-hint">Safe & Secure</span>
          </motion.div>
          <motion.div 
            whileHover={{ y: -4 }}
            className="p-5 bg-tg-tertiary rounded-xl border border-tg-border/50 flex flex-col items-center gap-3"
          >
            <Search className="w-5 h-5 text-tg-blue" />
            <span className="text-xs font-medium text-tg-hint">Interest Match</span>
          </motion.div>
          <motion.div 
            whileHover={{ y: -4 }}
            className="p-5 bg-tg-tertiary rounded-xl border border-tg-border/50 flex flex-col items-center gap-3"
          >
            <User className="w-5 h-5 text-cyan-400" />
            <span className="text-xs font-medium text-tg-hint">10k+ Online</span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

const ChatView = ({ interests, onExit }: { interests: string[]; onExit: () => void }) => {
  const [status, setStatus] = useState<'searching' | 'connected' | 'disconnected'>('searching');
  const [match, setMatch] = useState<MatchInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const userId = useRef(uuidv4());

  const socket = getSocket();

  useEffect(() => {
    socket.emit('join_queue', { userId: userId.current, interests });

    socket.on('matched', (data: MatchInfo) => {
      setMatch(data);
      setStatus('connected');
    });

    socket.on('offer', async ({ offer }) => {
      setIsVideoCallActive(true);
      if (!peerConnection.current) await initWebRTC(match?.roomId || '', false);
      if (!peerConnection.current) return;
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      socket.emit('answer', { roomId: match?.roomId, answer });
    });

    socket.on('answer', async ({ answer }) => {
      if (!peerConnection.current) return;
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on('ice_candidate', async ({ candidate }) => {
      if (!peerConnection.current) return;
      await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.on('receive_message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('peer_typing', ({ isTyping }) => {
      setPeerTyping(isTyping);
    });

    socket.on('peer_skipped', () => {
      handleSkip(false);
    });

    socket.on('peer_disconnected', () => {
      handleSkip(false);
    });

    return () => {
      socket.off('matched');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice_candidate');
      socket.off('receive_message');
      socket.off('peer_typing');
      socket.off('peer_skipped');
      socket.off('peer_disconnected');
      stopStreams();
    };
  }, [match?.roomId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStream.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      return stream;
    } catch (err) {
      console.error("Error accessing media devices:", err);
      return null;
    }
  };

  const stopStreams = () => {
    localStream.current?.getTracks().forEach(track => track.stop());
    peerConnection.current?.close();
    peerConnection.current = null;
    setIsVideoCallActive(false);
  };

  const initWebRTC = async (roomId: string, isInitiator: boolean) => {
    const stream = await startLocalStream();
    if (!stream) return;

    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    stream.getTracks().forEach(track => {
      peerConnection.current?.addTrack(track, stream);
    });

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice_candidate', { roomId, candidate: event.candidate });
      }
    };

    peerConnection.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    if (isInitiator) {
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      socket.emit('offer', { roomId, offer });
    }
  };

  const startVideoCall = () => {
    if (!match) return;
    setIsVideoCallActive(true);
    initWebRTC(match.roomId, true);
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || !match) return;
    const msg: Message = {
      senderId: userId.current,
      message: inputText,
      timestamp: new Date().toISOString()
    };
    socket.emit('send_message', { roomId: match.roomId, ...msg });
    setMessages(prev => [...prev, msg]);
    setInputText('');
    socket.emit('typing', { roomId: match.roomId, isTyping: false });
  };

  const handleSkip = (emit = true) => {
    if (emit && match) socket.emit('skip', { roomId: match.roomId });
    
    setStatus('searching');
    setMatch(null);
    setMessages([]);
    setPeerTyping(false);
    stopStreams();
    
    socket.emit('join_queue', { userId: userId.current, interests });
  };

  const toggleMute = () => {
    if (localStream.current) {
      localStream.current.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream.current) {
      localStream.current.getVideoTracks().forEach(track => track.enabled = !track.enabled);
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-tg-bg">
      {/* Search Overlay */}
      {status === 'searching' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-tg-bg/95 backdrop-blur-xl"
        >
          <div className="relative">
            <div className="w-24 h-24 border-4 border-tg-blue border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="w-8 h-8 text-tg-blue animate-pulse" />
            </div>
          </div>
          <h3 className="mt-8 text-2xl font-bold">Finding someone...</h3>
          <p className="text-tg-hint text-sm mt-2">Matching based on your interests</p>
          <button onClick={onExit} className="mt-8 px-6 py-2 text-tg-blue font-semibold hover:bg-tg-blue/10 rounded-full transition-colors">Cancel</button>
        </motion.div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
        
        {/* Video Overlay (Telegram style floating or side) */}
        <AnimatePresence>
          {isVideoCallActive && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 md:relative md:w-[50%] bg-black z-20 flex flex-col"
            >
              <div className="flex-1 relative">
                <video 
                  ref={remoteVideoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
                
                {/* Local Video Overlay */}
                <div className="absolute bottom-4 right-4 w-32 md:w-40 aspect-video bg-tg-secondary rounded-xl overflow-hidden shadow-2xl border border-white/10">
                  <video 
                    ref={localVideoRef} 
                    autoPlay 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover mirror"
                  />
                  {isVideoOff && (
                    <div className="absolute inset-0 bg-tg-secondary flex items-center justify-center">
                      <VideoOff className="w-6 h-6 text-tg-hint" />
                    </div>
                  )}
                </div>

                {/* Video Controls */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
                  <button 
                    onClick={toggleMute}
                    className={cn(
                      "p-3 rounded-full transition-all shadow-lg",
                      isMuted ? "bg-red-500 text-white" : "bg-white/10 backdrop-blur-md text-white hover:bg-white/20"
                    )}
                  >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={toggleVideo}
                    className={cn(
                      "p-3 rounded-full transition-all shadow-lg",
                      isVideoOff ? "bg-red-500 text-white" : "bg-white/10 backdrop-blur-md text-white hover:bg-white/20"
                    )}
                  >
                    {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={stopStreams}
                    className="p-3 bg-red-500 text-white rounded-full transition-all shadow-lg active:scale-90"
                  >
                    <Phone className="w-5 h-5 rotate-[135deg]" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Section */}
        <div className="flex-1 bg-tg-bg flex flex-col relative">
          {/* Chat Header */}
          <div className="p-5 border-b border-tg-border/30 flex items-center justify-between glass z-10">
            <div className="flex items-center gap-3">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-tg-blue/30 to-cyan-400/20 flex items-center justify-center border border-tg-blue/30"
              >
                <User className="w-5 h-5 text-tg-blue" />
              </motion.div>
              <div>
                <h4 className="font-semibold text-sm">Stranger</h4>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[11px] text-emerald-400 uppercase font-bold tracking-widest"
                >
                  ● Online
                </motion.p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={startVideoCall}
                className="p-2.5 hover:bg-tg-blue/15 rounded-full text-tg-blue transition-all hover:text-cyan-400"
                title="Start video call"
              >
                <Video className="w-5 h-5" />
              </button>
              <button className="p-2.5 hover:bg-tg-blue/15 rounded-full text-tg-blue transition-all hover:text-cyan-400" title="Call">
                <Phone className="w-5 h-5" />
              </button>
              <button onClick={() => handleSkip()} className="p-2.5 hover:bg-red-500/10 rounded-full text-tg-hint transition-all hover:text-red-400" title="Skip">
                <SkipForward className="w-5 h-5" />
              </button>
              <button className="p-2.5 hover:bg-tg-blue/15 rounded-full text-tg-hint transition-all hover:text-tg-blue" title="More options">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <AnimatePresence initial={false} mode="popLayout">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  layout
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "max-w-[75%] md:max-w-[60%] px-4 py-2.5 rounded-2xl text-sm shadow-lg relative",
                    msg.senderId === userId.current 
                      ? "bg-gradient-to-r from-tg-blue to-cyan-400 text-tg-bg ml-auto rounded-tr-none font-medium shadow-tg-blue/30" 
                      : "bg-tg-tertiary text-tg-text mr-auto rounded-tl-none border border-tg-border/50"
                  )}
                >
                  {msg.message}
                  <div className="flex items-center justify-end gap-1 mt-1 text-xs opacity-70">
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.senderId === userId.current && <Check className="w-3 h-3" />}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {peerTyping && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-tg-tertiary text-tg-hint text-xs px-4 py-2.5 rounded-2xl w-fit border border-tg-border/50 flex items-center gap-2"
              >
                <div className="flex gap-1.5">
                  <motion.div 
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                    className="w-1.5 h-1.5 bg-tg-hint rounded-full"
                  />
                  <motion.div 
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                    className="w-1.5 h-1.5 bg-tg-hint rounded-full"
                  />
                  <motion.div 
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    className="w-1.5 h-1.5 bg-tg-hint rounded-full"
                  />
                </div>
                <span className="ml-1">typing</span>
              </motion.div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-5 bg-tg-bg border-t border-tg-border/30">
            <div className="flex items-end gap-3 bg-tg-tertiary rounded-2xl px-3 py-2 border border-tg-border/50 focus-within:border-tg-blue/50 transition-all shadow-lg">
              <button className="p-2.5 text-tg-hint hover:text-tg-blue transition-colors hover:bg-tg-blue/10 rounded-lg" title="Attach file">
                <Paperclip className="w-5 h-5" />
              </button>
              <textarea
                rows={1}
                placeholder="Type a message..."
                className="flex-1 bg-transparent outline-none py-2 text-sm resize-none max-h-32 placeholder-tg-hint/50"
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  socket.emit('typing', { roomId: match?.roomId, isTyping: e.target.value.length > 0 });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button className="p-2.5 text-tg-hint hover:text-tg-blue transition-colors hover:bg-tg-blue/10 rounded-lg" title="Emoji">
                <Sticker className="w-5 h-5" />
              </button>
              <motion.button 
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                whileHover={inputText.trim() ? { scale: 1.05 } : {}}
                whileTap={inputText.trim() ? { scale: 0.95 } : {}}
                className={cn(
                  "p-2.5 rounded-lg transition-all",
                  inputText.trim() ? "bg-gradient-to-r from-tg-blue to-cyan-400 text-tg-bg shadow-lg shadow-tg-blue/30" : "text-tg-hint"
                )}
                title={inputText.trim() ? "Send message" : "Send voice"}
              >
                {inputText.trim() ? <Send className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = ({ onClose }: { onClose: () => void }) => {
  const [stats, setStats] = useState({ users: 0, reports: 0, online: 0 });

  useEffect(() => {
    fetch('/api/stats').then(res => res.json()).then(setStats);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-tg-bg/80 backdrop-blur-lg flex items-center justify-center p-6"
    >
      <motion.div 
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-5xl bg-tg-secondary rounded-2xl overflow-hidden shadow-2xl border border-tg-border/50"
      >
        <div className="p-6 border-b border-tg-border/30 flex items-center justify-between bg-gradient-to-r from-tg-blue/10 to-cyan-400/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-tg-blue/20 rounded-lg">
              <LayoutDashboard className="w-5 h-5 text-tg-blue" />
            </div>
            <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          </div>
          <motion.button 
            whileHover={{ rotate: 90 }}
            onClick={onClose} 
            className="p-2 hover:bg-red-500/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </motion.button>
        </div>
        
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Total Users', value: stats.users, color: 'from-tg-blue to-cyan-400' },
            { label: 'Active Reports', value: stats.reports, color: 'from-red-500 to-orange-500' },
            { label: 'Online Now', value: stats.online, color: 'from-emerald-400 to-teal-500' }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -4 }}
              className="tg-card bg-gradient-to-br from-tg-tertiary to-tg-secondary space-y-3"
            >
              <p className="text-tg-hint text-xs uppercase font-bold tracking-wider">{stat.label}</p>
              <p className={`text-5xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="p-8 pt-0">
          <div className="tg-card bg-gradient-to-br from-tg-tertiary to-tg-secondary">
            <h3 className="font-bold mb-5 text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-400" />
              Recent Reports
            </h3>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <motion.div 
                  key={i}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-4 bg-tg-secondary rounded-xl border border-tg-border/50 hover:border-red-500/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                      <Shield className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Inappropriate behavior</p>
                      <p className="text-xs text-tg-hint">User ID: user_8273... • 2 mins ago</p>
                    </div>
                  </div>
                  <button className="text-xs font-semibold text-tg-blue hover:bg-tg-blue/10 px-3 py-1.5 rounded-lg transition-colors">
                    View
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [profile, setProfile] = useState<{ name: string; gender: string } | null>(null);
  const [view, setView] = useState<'home' | 'chat' | 'admin'>('home');
  const [interests, setInterests] = useState<string[]>([]);

  if (loading) return <SplashScreen onFinish={() => setLoading(false)} />;

  if (!isAgeVerified) return <AgeVerificationView onConfirm={() => setIsAgeVerified(true)} />;

  if (!profile) return <ProfileSetupView onComplete={setProfile} />;

  return (
    <div className="min-h-screen bg-tg-bg text-tg-text">
      <Header 
        onOpenSettings={() => {}} 
        onOpenAdmin={() => setView('admin')} 
      />
      
      <main>
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <HomeView onStart={(i) => {
                setInterests(i);
                setView('chat');
              }} />
            </motion.div>
          )}

          {view === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <ChatView 
                interests={interests} 
                onExit={() => setView('home')} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {view === 'admin' && <AdminDashboard onClose={() => setView('home')} />}
    </div>
  );
}
