import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { messageAPI, userAPI } from '../../services/api';
import { Send, MessageSquare, Phone } from 'lucide-react';
import VideoCall from '../common/VideoCall';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const Messages = () => {
    const { user } = useAuth();
    const [therapists, setTherapists] = useState([]);
    const [selectedTherapist, setSelectedTherapist] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [inCall, setInCall] = useState(false);
    const [incomingCall, setIncomingCall] = useState(false);
    const [isIncomingCallState, setIsIncomingCallState] = useState(false);
    const [callerId, setCallerId] = useState(null);
    const messagesEndRef = useRef(null);
    const stompClientRef = useRef();

    useEffect(() => {
        loadTherapists();

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
        if (selectedTherapist) {
            loadMessages();
            const interval = setInterval(loadMessages, 5000); // Refresh every 5s
            return () => clearInterval(interval);
        }
    }, [selectedTherapist]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadTherapists = async () => {
        try {
            const response = await userAPI.getUsersByRole('THERAPIST');
            setTherapists(response.data);
            if (response.data.length > 0 && !selectedTherapist) {
                setSelectedTherapist(response.data[0]);
            }
        } catch (error) {
            console.error('Failed to load therapists:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async () => {
        if (!selectedTherapist || !user) return;
        try {
            const response = await messageAPI.getConversation(user.id, selectedTherapist.id);
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
        if (!newMessage.trim() || !selectedTherapist) return;

        try {
            await messageAPI.send(user.id, selectedTherapist.id, newMessage);
            setNewMessage('');
            loadMessages();
        } catch (error) {
            console.error('Failed to send message:', error);
            alert('Failed to send message');
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

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (therapists.length === 0) {
        return (
            <div>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                    <p className="text-gray-600">Chat with your therapist</p>
                </div>
                <div className="card text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No therapists available</p>
                    <p className="text-sm text-gray-500 mt-2">
                        You need to be assigned a therapist to start messaging
                    </p>
                </div>
            </div>
        );
    }

    const handleMissedCall = async () => {
        if (!selectedTherapist) return;
        try {
            await messageAPI.send(user.id, selectedTherapist.id, 'Missed Video Call', 'MISSED_CALL');
            loadMessages();
        } catch (error) {
            console.error('Failed to send missed call notification:', error);
        }
    };

    return (
        <div>
            {inCall && selectedTherapist && (
                <VideoCall
                    partnerId={selectedTherapist.id}
                    partnerName={`Dr. ${selectedTherapist.fullName}`}
                    isIncomingCall={isIncomingCallState}
                    onEndCall={() => {
                        setInCall(false);
                        setIsIncomingCallState(false);
                    }}
                    onMissedCall={handleMissedCall}
                />
            )}

            {/* Incoming Call Modal */}
            {incomingCall && !inCall && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl text-center">
                        <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Incoming Call</h3>
                        <p className="mb-6 text-slate-600 dark:text-slate-300">Dr. {therapists.find(t => t.id === callerId)?.fullName || 'Therapist'} is calling...</p>
                        <div className="flex gap-4 justify-center">
                            <button onClick={acceptCall} className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600">
                                <Phone className="w-6 h-6" />
                            </button>
                            <button onClick={() => setIncomingCall(false)} className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600">
                                <Phone className="w-6 h-6 rotate-[135deg]" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Messages</h1>
                <p className="text-slate-600 dark:text-slate-400">Chat with your therapist</p>
            </div>

            <div className="card p-0 h-[600px] flex flex-col bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                {/* Therapist selector */}
                {therapists.length > 1 && (
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                        <select
                            value={selectedTherapist?.id || ''}
                            onChange={(e) => {
                                const therapist = therapists.find(t => t.id === parseInt(e.target.value));
                                setSelectedTherapist(therapist);
                            }}
                            className="input-field dark:bg-slate-700 dark:text-white dark:border-slate-600"
                        >
                            {therapists.map((therapist) => (
                                <option key={therapist.id} value={therapist.id}>
                                    Dr. {therapist.fullName}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Chat header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                            <span className="text-primary-700 dark:text-primary-400 font-semibold">
                                {selectedTherapist?.fullName?.charAt(0)}
                            </span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                Dr. {selectedTherapist?.fullName}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{selectedTherapist?.specialization}</p>
                        </div>
                    </div>
                    <button
                        onClick={startCall}
                        className="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-full transition-colors"
                        title="Start Video Call"
                    >
                        <Phone className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
                    {messages.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                            No messages yet. Start the conversation!
                        </div>
                    ) : (
                        messages.map((message) => {
                            const isOwnMessage = message.senderId === user.id;
                            const isMissedCall = message.type === 'MISSED_CALL';

                            return (
                                <div
                                    key={message.id}
                                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[70%] rounded-lg px-4 py-2 ${isOwnMessage
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600'
                                            } ${isMissedCall ? 'border-red-500 border-2' : ''}`}
                                    >
                                        {isMissedCall ? (
                                            <div className="flex items-center gap-2 text-red-500 dark:text-red-400 font-semibold">
                                                <Phone className="w-4 h-4 rotate-[135deg]" />
                                                <span>Missed Video Call</span>
                                            </div>
                                        ) : (
                                            <p className="text-sm">{message.content}</p>
                                        )}
                                        <p
                                            className={`text-xs mt-1 ${isOwnMessage ? 'text-primary-100' : 'text-slate-500 dark:text-slate-400'
                                                }`}
                                        >
                                            {new Date(message.timestamp).toLocaleDateString()} {new Date(message.timestamp).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="input-field flex-1 dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="btn-primary px-6 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-4 h-4" />
                            Send
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Messages;
