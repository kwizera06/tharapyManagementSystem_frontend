import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentAPI } from '../../services/api';
import { Calendar, Clock, Check, X } from 'lucide-react';
import { format } from 'date-fns';

const TherapistAppointments = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [processingId, setProcessingId] = useState(null);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        try {
            const response = await appointmentAPI.getTherapistAppointments(user.id);
            setAppointments(response.data);
        } catch (error) {
            console.error('Failed to load appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        setProcessingId(id);
        setMessage(null);
        try {
            await appointmentAPI.updateStatus(id, status);
            await loadAppointments();
            setMessage({ type: 'success', text: `Appointment ${status.toLowerCase()} successfully` });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: `Failed to ${status.toLowerCase()} appointment` });
        } finally {
            setProcessingId(null);
        }
    };

    const filteredAppointments = appointments.filter(apt => {
        if (filter === 'pending') return apt.status === 'PENDING';
        if (filter === 'approved') return apt.status === 'APPROVED';
        return true;
    });

    const getStatusColor = (status) => {
        const colors = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            APPROVED: 'bg-green-100 text-green-800',
            REJECTED: 'bg-red-100 text-red-800',
            COMPLETED: 'bg-blue-100 text-blue-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
                <p className="text-gray-600">Manage client appointments</p>
            </div>

            {message && (
                <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    All ({appointments.length})
                </button>
                <button
                    onClick={() => setFilter('pending')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'pending' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Pending ({appointments.filter(a => a.status === 'PENDING').length})
                </button>
                <button
                    onClick={() => setFilter('approved')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'approved' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Approved ({appointments.filter(a => a.status === 'APPROVED').length})
                </button>
            </div>

            <div className="space-y-4">
                {filteredAppointments.length === 0 ? (
                    <div className="card text-center py-12">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No appointments found</p>
                    </div>
                ) : (
                    filteredAppointments.map((apt) => (
                        <div key={apt.id} className="card hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {apt.clientName}
                                        </h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                                            {apt.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {format(new Date(apt.appointmentTime), 'MMM dd, yyyy')}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            {format(new Date(apt.appointmentTime), 'hh:mm a')}
                                        </div>
                                    </div>
                                </div>
                                {apt.status === 'PENDING' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleStatusUpdate(apt.id, 'APPROVED')}
                                            disabled={processingId === apt.id}
                                            className={`p-2 rounded-lg transition-colors ${processingId === apt.id
                                                ? 'bg-gray-100 text-gray-400'
                                                : 'text-green-600 hover:bg-green-50'}`}
                                            title="Approve"
                                        >
                                            {processingId === apt.id ? (
                                                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                                            ) : (
                                                <Check className="w-5 h-5" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(apt.id, 'REJECTED')}
                                            disabled={processingId === apt.id}
                                            className={`p-2 rounded-lg transition-colors ${processingId === apt.id
                                                ? 'bg-gray-100 text-gray-400'
                                                : 'text-red-600 hover:bg-red-50'}`}
                                            title="Reject"
                                        >
                                            {processingId === apt.id ? (
                                                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                                            ) : (
                                                <X className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TherapistAppointments;
