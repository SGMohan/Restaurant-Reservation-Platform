import React, { useState, useEffect, useRef } from "react";
import { FiX, FiMinus, FiSend, FiMaximize2 } from "react-icons/fi";
import { io } from "socket.io-client";
import { Link } from "react-router-dom";
import axios from "axios";
import { useApp } from "../Context/AppContext";

// Configuration for Backend and Sockets
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const socket = io(BACKEND_URL, {
  withCredentials: true,
  autoConnect: false,
});

/**
 * Parses markdown-style links [text](url) in AI responses into clickable React Router Links.
 */
const renderMessageWithLinks = (content) => {
  if (!content) return "";
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }

    const [, text, url] = match;
    const isInternal = url.startsWith("/");

    parts.push(
      isInternal ? (
        <Link
          key={match.index}
          to={url}
          className="text-blue-600 underline font-semibold hover:text-blue-800 transition-colors"
        >
          {text}
        </Link>
      ) : (
        <a
          key={match.index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline font-semibold hover:text-blue-800 transition-colors"
        >
          {text}
        </a>
      )
    );

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts.length > 0 ? parts : content;
};

/**
 * AIAssistant Component
 * Features a real-time typewriter effect for assistant responses.
 */
const AIAssistant = () => {
  const { user } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  
  const [message, setMessage] = useState("");
  const [sessionId, setSessionId] = useState(localStorage.getItem("ai_session_id"));
  const [chatHistory, setChatHistory] = useState([]);
  const [isTypingEffectActive, setIsTypingEffectActive] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typedSet = useRef(new Set()); // Tracks IDs of messages already typed out

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isAiTyping, isOpen, isTypingEffectActive]);

  // Initial setup
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1000);
    socket.connect();
    socket.on("connect", () => console.log("Connected to AI Socket"));
    socket.on("ai_online", () => setIsOnline(true));
    socket.on("ai_typing", (data) => setIsAiTyping(data.typing));
    
    if (sessionId) {
      fetchHistory(sessionId);
    }

    return () => {
      socket.disconnect();
      clearTimeout(timer);
    };
  }, []);

  /**
   * Typewriter Effect
   * Gradually reveals the text of a message to simulate real-time generation.
   */
  const typeMessage = (msgId, fullContent) => {
    if (typedSet.current.has(msgId)) return;
    
    setIsTypingEffectActive(true);
    let currentIdx = 0;
    const speed = 25; // Speed in ms per character
    
    const interval = setInterval(() => {
      currentIdx++;
      setChatHistory(prev => prev.map(msg => 
        msg.id === msgId ? { ...msg, displayedContent: fullContent.slice(0, currentIdx) } : msg
      ));

      if (currentIdx >= fullContent.length) {
        clearInterval(interval);
        typedSet.current.add(msgId);
        setIsTypingEffectActive(false);
      }
    }, speed);
  };

  // Welcome message with typewriter effect
  useEffect(() => {
    if (isOpen && chatHistory.length === 0) {
      const welcomeId = "welcome-" + Date.now();
      const content = `Hi${user?.name ? ` ${user.name.split(" ")[0]}` : ""}! 👋 Welcome to DineArea. I can help you find restaurants, check your bookings, or guide you through our platform. What would you like to do?`;
      
      setChatHistory([{
        id: welcomeId,
        role: "assistant",
        content: content,
        displayedContent: "", // Starts empty
        timestamp: new Date()
      }]);
      
      setTimeout(() => typeMessage(welcomeId, content), 800);
    }
  }, [isOpen]);

  const fetchHistory = async (id) => {
    try {
      const res = await axios.get(`${BACKEND_URL}/chat/history/${id}`);
      if (res.data.success && res.data.data.length > 0) {
        // Mark existing history as already typed
        const history = res.data.data.map(msg => {
          typedSet.current.add(msg._id || msg.id);
          return { ...msg, displayedContent: msg.content };
        });
        setChatHistory(history);
      }
    } catch (err) {
      console.error("Failed to fetch chat history:", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || isTypingEffectActive) return;

    const userEntry = {
      role: "user",
      content: message,
      displayedContent: message,
      timestamp: new Date()
    };

    setChatHistory((prev) => [...prev, userEntry]);
    const currentMsg = message;
    setMessage("");
    
    socket.emit("user_typing", { sessionId });
    setIsAiTyping(true);

    try {
      const res = await axios.post(`${BACKEND_URL}/chat/send`, {
        message: currentMsg,
        sessionId: sessionId,
        userId: user?._id
      });

      if (res.data.success) {
        const newMsgId = "msg-" + Date.now();
        const aiEntry = {
          id: newMsgId,
          role: "assistant",
          content: res.data.data,
          displayedContent: "", // Start typing from scratch
          timestamp: new Date()
        };
        
        if (!sessionId) {
          setSessionId(res.data.sessionId);
          localStorage.setItem("ai_session_id", res.data.sessionId);
        }

        setChatHistory((prev) => [...prev, aiEntry]);
        typeMessage(newMsgId, res.data.data);
      }
    } catch (err) {
      console.error("Chat fail:", err);
      setChatHistory((prev) => [...prev, {
        role: "assistant",
        content: "Sorry, I had a hiccup. Please try again!",
        displayedContent: "Sorry, I had a hiccup. Please try again!",
        timestamp: new Date()
      }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      {/* --- Floating Button --- */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`
            group relative flex items-center justify-center w-16 h-16 bg-black rounded-full shadow-2xl 
            hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer
            ${isVisible ? "translate-x-0 opacity-100" : "translate-x-20 opacity-0"}
          `}
        >
          <div className="relative">
             <img 
               src="https://cdn-icons-png.flaticon.com/512/6134/6134346.png" 
               alt="AI" 
               className="w-12 h-12 object-contain" 
             />
             {isOnline && (
               <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-black"></span>
               </span>
             )}
          </div>
        </button>
      )}

      {/* --- Chat Window --- */}
      {isOpen && (
        <div 
          className={`
            flex flex-col bg-white rounded-[2.5rem] shadow-[0_30px_90px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]
            ${isMinimized ? "h-16 w-72" : "h-[600px] w-[360px] md:w-[420px]"}
            ${isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-75 opacity-0 translate-y-10"}
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-black px-5 py-3  text-white">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/6134/6134346.png" 
                  alt="AI Avatar" 
                  className="w-10 h-10" 
                />
                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-black ${isOnline ? "bg-green-500" : "bg-gray-400"}`}></span>
              </div>
              <div>
                <h3 className="font-bold text-sm">DineArea AI</h3>
                <p className="text-[10px] text-white/50">{isOnline ? "Your booking guide" : "Connecting..."}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                title={isMinimized ? "Maximize" : "Minimize"}
              >
                {isMinimized ? <FiMaximize2 size={16} /> : <FiMinus size={16} />}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          {!isMinimized && (
            <div className="flex-1 overflow-y-auto p-5 bg-slate-50 space-y-4 scroll-smooth">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div 
                    className={`
                      max-w-[85%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed shadow-sm
                      ${msg.role === "user" ? "bg-black text-white rounded-tr-none" : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"}
                    `}
                  >
                    <p className="whitespace-pre-wrap">
                      {msg.role === "assistant"
                        ? renderMessageWithLinks(msg.displayedContent)
                        : msg.displayedContent}
                    </p>
                    <span className="text-[9px] mt-1.5 block opacity-40 text-right">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              
              {/* AI Thinking Dots */}
              {isAiTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-.5s]"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input Area */}
          {!isMinimized && (
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex items-center gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask anything about reservations..."
                className="flex-1 bg-white border-2 border-black rounded-full px-5 py-3 text-sm outline-none transition-all placeholder:text-gray-400"
              />
              <button 
                type="submit" 
                disabled={!message.trim() || isAiTyping || isTypingEffectActive}
                className={`
                  p-3.5 rounded-full shadow-lg transition-all
                  ${message.trim() && !isAiTyping && !isTypingEffectActive ? "bg-black text-white hover:scale-105 active:scale-95" : "bg-gray-100 text-gray-400 cursor-not-allowed"}
                `}
              >
                <FiSend size={18} />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
