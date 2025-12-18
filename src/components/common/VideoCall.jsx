import { useState, useEffect, useRef } from 'react';
import SimplePeer from 'simple-peer';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { useAuth } from '../../context/AuthContext';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import * as process from 'process';

// Polyfill for simple-peer
window.process = process;

const VideoCall = ({ partnerId, partnerName, isIncomingCall, onEndCall, onMissedCall }) => {
    const { user } = useAuth();
    const [stream, setStream] = useState(null);
    const [receivingCall, setReceivingCall] = useState(isIncomingCall);
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [me, setMe] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    const [error, setError] = useState(null);

    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();
    const stompClientRef = useRef();

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((currentStream) => {
                setStream(currentStream);
                if (myVideo.current) {
                    myVideo.current.srcObject = currentStream;
                }
            })
            .catch((err) => {
                console.error("Error accessing media devices:", err);
                setError("Failed to access camera/microphone. Please ensure they are connected and not in use by another application.");
            });

        const socket = new SockJS('http://localhost:8080/ws');
        const stompClient = Stomp.over(socket);
        stompClient.debug = null; // Disable debug logs

        stompClient.connect({}, () => {
            stompClientRef.current = stompClient;

            stompClient.subscribe(`/topic/signal/${user.id}`, (message) => {
                const signal = JSON.parse(message.body);
                handleSignalMessage(signal);
            });

            if (!isIncomingCall) {
                callUser(partnerId);
            }
        });

        return () => {
            if (stompClientRef.current) stompClientRef.current.disconnect();
            if (stream) stream.getTracks().forEach(track => track.stop());
        };
    }, []);

    const callUser = (id) => {
        const peer = new SimplePeer({
            initiator: true,
            trickle: false,
            stream: stream,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:global.stun.twilio.com:3478' }
                ]
            }
        });

        peer.on('signal', (data) => {
            sendSignal('offer', JSON.stringify(data), id);
        });

        peer.on('stream', (currentStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = currentStream;
            }
        });

        connectionRef.current = peer;
    };

    const answerCall = (signalData) => {
        setCallAccepted(true);
        const peer = new SimplePeer({
            initiator: false,
            trickle: false,
            stream: stream,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:global.stun.twilio.com:3478' }
                ]
            }
        });

        peer.on('signal', (data) => {
            sendSignal('answer', JSON.stringify(data), partnerId);
        });

        peer.on('stream', (currentStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = currentStream;
            }
        });

        peer.signal(signalData);
        connectionRef.current = peer;
    };

    const handleSignalMessage = (message) => {
        if (message.type === 'offer') {
            setReceivingCall(true);
            // Auto-answer logic or wait for user interaction if implemented differently
            // For now, we assume the component is mounted when answering or calling
            // But if we are the receiver, we need to wait for 'Accept' click if not already handled
            // However, the prop isIncomingCall handles the initial state.
            // If we receive an offer while already mounted (rare in this simple implementation), we handle it.
        } else if (message.type === 'answer') {
            setCallAccepted(true);
            connectionRef.current.signal(message.sdp);
        } else if (message.type === 'end-call') {
            leaveCall();
        }
    };

    const sendSignal = (type, sdp, receiverId) => {
        if (stompClientRef.current) {
            stompClientRef.current.send("/app/signal", {}, JSON.stringify({
                type: type,
                sdp: sdp,
                senderId: user.id,
                receiverId: receiverId
            }));
        }
    };

    const leaveCall = () => {
        setCallEnded(true);
        if (connectionRef.current) {
            connectionRef.current.destroy();
        }
        sendSignal('end-call', null, partnerId);

        // If I am the caller and the call was not accepted, it's a missed call
        if (!isIncomingCall && !callAccepted) {
            onMissedCall && onMissedCall();
        }

        onEndCall();
    };

    const toggleMute = () => {
        if (stream) {
            stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0].enabled;
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (stream) {
            stream.getVideoTracks()[0].enabled = !stream.getVideoTracks()[0].enabled;
            setIsVideoOff(!isVideoOff);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden">
                {/* Remote Video */}
                {callAccepted && !callEnded ? (
                    <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white p-4 text-center">
                        {error ? (
                            <div className="text-red-500 mb-4">
                                <p className="font-bold text-xl mb-2">Camera Error</p>
                                <p>{error}</p>
                            </div>
                        ) : (
                            <p className="text-xl">{isIncomingCall && !callAccepted ? 'Incoming Call...' : 'Calling...'}</p>
                        )}
                    </div>
                )}

                {/* Local Video */}
                {stream && (
                    <div className="absolute bottom-4 right-4 w-48 aspect-video bg-gray-800 rounded-lg overflow-hidden border-2 border-white">
                        <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
                    </div>
                )}

                {/* Controls */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
                    <button onClick={toggleMute} className={`p-4 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'} text-white transition-colors`}>
                        {isMuted ? <MicOff /> : <Mic />}
                    </button>
                    <button onClick={toggleVideo} className={`p-4 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'} text-white transition-colors`}>
                        {isVideoOff ? <VideoOff /> : <Video />}
                    </button>
                    <button onClick={leaveCall} className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors">
                        <PhoneOff />
                    </button>
                    {isIncomingCall && !callAccepted && (
                        <button onClick={() => answerCall(JSON.parse(localStorage.getItem('incomingOffer')))} className="p-4 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors animate-pulse">
                            <Phone />
                        </button>
                    )}
                </div>

                <div className="absolute top-4 left-4 text-white bg-black bg-opacity-50 px-4 py-2 rounded-lg">
                    {partnerName}
                </div>
            </div>
        </div>
    );
};

export default VideoCall;
