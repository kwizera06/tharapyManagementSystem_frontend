import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { messageAPI, userAPI } from '../../services/api';
import {
    Send, MessageSquare, Phone, Video, MoreVertical,
    Search, PhoneIncoming, PhoneMissed, Check, CheckCheck,
    User, Clock
} from 'lucide-react';
import VideoCall from '../common/VideoCall';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const TherapistMessages = () => {
    const { user } = useAuth();
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [inCall, setInCall] = useState(false);
    const [incomingCall, setIncomingCall] = useState(false);
    const [isIncomingCallState, setIsIncomingCallState] = useState(false);
    const [callerId, setCallerId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const messagesEndRef = useRef(null);
    const stompClientRef = useRef();

    useEffect(() => {
        loadClients();

        // Setup WebSocket for incoming calls
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
        const WS_URL = API_URL.replace('/api', '/ws');
        const socket = new SockJS(WS_URL);
        const stompClient = Stomp.over(socket);
        stompClient.debug = null;

        stompClient.connect({}, () => {
            stompClientRef.current = stompClient;
            stompClient.subscribe(`/topic/signal/${user.id}`, (message) => {
                const signal = JSON.parse(message.body);
                if (signal.type === 'offer') {
                    setIncomingCall(true);
                    setCallerId(signal.senderId);
                    localStorage.setItem('incomingOffer', JSON.stringify(signal.sdp));
                }
            });
        });

        return () => {
            if (stompClientRef.current) stompClientRef.current.disconnect();
        };
    }, []);

    useEffect(() => {
        if (selectedClient) {
            loadMessages();
            const interval = setInterval(loadMessages, 5000); // Refresh every 5s
            return () => clearInterval(interval);
        }
    }, [selectedClient]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadClients = async () => {
        try {
            const response = await userAPI.getUsersByRole('CLIENT');
            setClients(response.data);
            if (response.data.length > 0 && !selectedClient) {
                setSelectedClient(response.data[0]);
            }
        } catch (error) {
            console.error('Failed to load clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async () => {
        if (!selectedClient || !user) return;
        try {
            const response = await messageAPI.getConversation(user.id, selectedClient.id);
            setMessages(response.data);

            // Mark unread messages as read
            const unreadMessages = response.data.filter(
                msg => !msg.isRead && msg.receiverId === user.id
            );
            for (const msg of unreadMessages) {
                await messageAPI.markAsRead(msg.id);
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedClient) return;

        try {
            await messageAPI.send(user.id, selectedClient.id, newMessage);
            setNewMessage('');
            loadMessages();
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const startCall = () => {
        setInCall(true);
        setIsIncomingCallState(false);
    };

    const acceptCall = () => {
        setInCall(true);
        setIncomingCall(false);
        setIsIncomingCallState(true);
    };

    const handleMissedCall = async () => {
        if (!selectedClient) return;
        try {
            await messageAPI.send(user.id, selectedClient.id, 'Missed Video Call', 'MISSED_CALL');
            loadMessages();
        } catch (error) {
            console.error('Failed to send missed call notification:', error);
        }
    };

    const filteredClients = clients.filter(client =>
        client.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-100px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col gap-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    Messages
                </h2>
                <p className="text-gray-500 dark:text-gray-400">Chat and video call with your clients</p>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Clients Sidebar */}
                <div className="w-full md:w-80 glass-panel rounded-2xl flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search clients..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {filteredClients.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No clients found</p>
                            </div>
                        ) : (
                            filteredClients.map((client) => (
                                <button
                                    key={client.id}
                                    onClick={() => setSelectedClient(client)}
                                    className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all duration-200 ${selectedClient?.id === client.id
                                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-200'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedClient?.id === client.id
                                        ? 'bg-white/20 text-white'
                                        : 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'
                                        }`}>
                                        <span className="font-semibold">{client.fullName.charAt(0)}</span>
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h3 className="font-medium truncate">{client.fullName}</h3>
                                        <p className={`text-xs truncate ${selectedClient?.id === client.id ? 'text-violet-200' : 'text-gray-500'
                                            }`}>
                                            {client.email}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden relative">
                    {selectedClient ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                                        <span className="font-semibold text-lg">{selectedClient.fullName.charAt(0)}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 dark:text-white">{selectedClient.fullName}</h3>
                                        <div className="flex items-center gap-2 text-xs text-green-500">
                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                            Online
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={startCall}
                                        className="p-2 text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-full transition-colors"
                                        title="Start Video Call"
                                    >
                                        <Video size={20} />
                                    </button>
                                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                        <MoreVertical size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Messages List */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50 dark:bg-gray-900/50">
                                {messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                        <MessageSquare size={48} className="mb-4 opacity-50" />
                                        <p>No messages yet. Start the conversation!</p>
                                    </div>
                                ) : (
                                    messages.map((message) => {
                                        const isOwnMessage = message.senderId === user.id;
                                        const isMissedCall = message.type === 'MISSED_CALL';

                                        return (
                                            <div
                                                key={message.id}
                                                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} animate-fade-in`}
                                            >
                                                <div
                                                    className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${isOwnMessage
                                                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-br-none'
                                                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-100 dark:border-gray-700 rounded-bl-none'
                                                        } ${isMissedCall ? 'border-red-200 bg-red-50 dark:bg-red-900/20' : ''}`}
                                                >
                                                    {isMissedCall ? (
                                                        <div className="flex items-center gap-2 text-red-500 dark:text-red-400 font-semibold">
                                                            <PhoneMissed size={16} />
                                                            <span>Missed Video Call</span>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm leading-relaxed">{message.content}</p>
                                                    )}
                                                    <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isOwnMessage ? 'text-violet-200' : 'text-gray-400'
                                                        }`}>
                                                        <span>
                                                            {new Date(message.timestamp).toLocaleTimeString([], {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </span>
                                                        {isOwnMessage && (
                                                            message.isRead ? <CheckCheck size={12} /> : <Check size={12} />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="px-4 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                    >
                                        <Send size={20} />
                                        <span className="hidden md:inline">Send</span>
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 animate-pulse">
                                <MessageSquare size={40} className="text-gray-300 dark:text-gray-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300">Select a client</h3>
                            <p className="text-sm">Choose a client from the sidebar to start messaging</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Video Call Modal */}
            {inCall && selectedClient && (
                <div className="fixed inset-0 z-50 bg-black">
                    <VideoCall
                        partnerId={selectedClient.id}
                        partnerName={selectedClient.fullName}
                        isIncomingCall={isIncomingCallState}
                        onEndCall={() => {
                            setInCall(false);
                            setIsIncomingCallState(false);
                        }}
                        onMissedCall={handleMissedCall}
                    />
                </div>
            )}

            {/* Incoming Call Alert */}
            {incomingCall && !inCall && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full mx-4 animate-scale-in border border-gray-200 dark:border-gray-700">
                        <div className="w-24 h-24 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-6 animate-bounce">
                            <PhoneIncoming size={40} className="text-violet-600 dark:text-violet-400" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Incoming Call</h3>
                        <p className="mb-8 text-gray-600 dark:text-gray-300 text-lg">
                            {clients.find(c => c.id === callerId)?.fullName || 'Client'} is calling...
                        </p>
                        <div className="flex gap-6 justify-center">
                            <button
                                onClick={acceptCall}
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className="w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform">
                                    <Phone size={24} />
                                </div>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Accept</span>
                            </button>
                            <button
                                onClick={() => setIncomingCall(false)}
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/30 group-hover:scale-110 transition-transform">
                                    <Phone size={24} className="rotate-[135deg]" />
                                </div>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Decline</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TherapistMessages;
