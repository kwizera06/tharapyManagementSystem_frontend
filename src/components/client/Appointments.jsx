import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentAPI, userAPI } from '../../services/api';
import { Calendar, Clock, Plus } from 'lucide-react';
import { format } from 'date-fns';

const Appointments = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [therapists, setTherapists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showBooking, setShowBooking] = useState(false);
    const [bookingData, setBookingData] = useState({
        therapistId: '',
        date: '',
        time: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            console.log('📋 Loading appointments and therapists...');
            console.log('👤 Current user:', user);

            const [appts, therapistList] = await Promise.all([
                appointmentAPI.getClientAppointments(user.id),
                userAPI.getUsersByRole('THERAPIST'),
            ]);

            console.log('✅ Appointments response:', appts);
            console.log('✅ Therapists response:', therapistList);
            console.log('📦 Therapists data:', therapistList.data);
            console.log('📊 Number of therapists:', therapistList.data?.length || 0);

            setAppointments(appts.data);
            // Show all therapists (not just verified) for easier testing
            setTherapists(therapistList.data);
            console.log('✨ Loaded therapists:', therapistList.data);
        } catch (error) {
            console.error('❌ Failed to load appointments:', error);
            console.error('📛 Error response:', error.response);
            console.error('📛 Error data:', error.response?.data);
            console.error('📛 Error status:', error.response?.status);
        } finally {
            setLoading(false);
        }
    };

    const handleBookAppointment = async (e) => {
        e.preventDefault();
        try {
            const dateTime = `${bookingData.date}T${bookingData.time}:00`;
            await appointmentAPI.create(user.id, bookingData.therapistId, dateTime);
            setShowBooking(false);
            setBookingData({ therapistId: '', date: '', time: '' });
            loadData();
        } catch (error) {
            alert('Failed to book appointment');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            APPROVED: 'bg-green-100 text-green-800',
            REJECTED: 'bg-red-100 text-red-800',
            COMPLETED: 'bg-blue-100 text-blue-800',
            CANCELLED: 'bg-gray-100 text-gray-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
                    <p className="text-gray-600">Manage your therapy sessions</p>
                </div>
                <button
                    onClick={() => setShowBooking(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Book Appointment
                </button>
            </div>

            {/* Booking Modal */}
            {showBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold mb-4">Book New Appointment</h2>
                        <form onSubmit={handleBookAppointment} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Therapist ({therapists.length} available)
                                </label>
                                <select
                                    value={bookingData.therapistId}
                                    onChange={(e) => setBookingData({ ...bookingData, therapistId: e.target.value })}
                                    className="input-field"
                                    required
                                >
                                    <option value="">Choose a therapist</option>
                                    {therapists.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.fullName} {t.specialization ? `- ${t.specialization}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={bookingData.date}
                                    onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                                    className="input-field"
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Time
                                </label>
                                <input
                                    type="time"
                                    value={bookingData.time}
                                    onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div className="flex gap-3">
                                <button type="submit" className="btn-primary flex-1">
                                    Book Appointment
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowBooking(false)}
                                    className="btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Appointments List */}
            <div className="space-y-4">
                {appointments.length === 0 ? (
                    <div className="card text-center py-12">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No appointments yet</p>
                        <button
                            onClick={() => setShowBooking(true)}
                            className="btn-primary mt-4"
                        >
                            Book Your First Appointment
                        </button>
                    </div>
                ) : (
                    appointments.map((apt) => (
                        <div key={apt.id} className="card hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {apt.therapistName}
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
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Appointments;
