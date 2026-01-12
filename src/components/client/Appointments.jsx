import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentAPI, userAPI } from '../../services/api';
import { Calendar, Clock, Plus, X, User, MapPin, CheckCircle, AlertCircle, Search } from 'lucide-react';
import { format } from 'date-fns';

const Appointments = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [therapists, setTherapists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showBooking, setShowBooking] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
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
            const [appts, therapistList] = await Promise.all([
                appointmentAPI.getClientAppointments(user.id),
                userAPI.getUsersByRole('THERAPIST'),
            ]);

            setAppointments(appts.data);
            setTherapists(therapistList.data);
        } catch (error) {
            console.error('Failed to load appointments:', error);
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

    const getStatusStyle = (status) => {
        const styles = {
            PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
            APPROVED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
            REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
            COMPLETED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
            CANCELLED: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
        };
        return styles[status] || 'bg-slate-100 text-slate-800';
    };

    const filteredAppointments = appointments.filter(apt =>
        apt.therapistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Appointments</h1>
                    <p className="text-slate-600 dark:text-slate-400">Manage your therapy sessions</p>
                </div>
                <button
                    onClick={() => setShowBooking(true)}
                    className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transform hover:-translate-y-0.5 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Book Session
                </button>
            </div>

            {/* Search and Filter */}
            <div className="glass-panel p-4 rounded-2xl flex items-center gap-3">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search by therapist or status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder-slate-400 w-full"
                />
            </div>

            {/* Appointments List */}
            <div className="grid gap-4">
                {filteredAppointments.length === 0 ? (
                    <div className="text-center py-16 glass-panel rounded-3xl">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No appointments found</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
                            {searchTerm ? 'Try adjusting your search terms' : 'Get started by booking your first session with one of our therapists.'}
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={() => setShowBooking(true)}
                                className="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300"
                            >
                                Book now &rarr;
                            </button>
                        )}
                    </div>
                ) : (
                    filteredAppointments.map((apt) => (
                        <div key={apt.id} className="glass-panel p-6 rounded-2xl hover:border-primary-500/30 transition-all group">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-lg">
                                        {apt.therapistName.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                            {apt.therapistName}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4" />
                                                {format(new Date(apt.appointmentTime), 'MMM dd, yyyy')}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-4 h-4" />
                                                {format(new Date(apt.appointmentTime), 'hh:mm a')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(apt.status)}`}>
                                    {apt.status}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Booking Modal */}
            {showBooking && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-scale-in">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Book Session</h2>
                            <button
                                onClick={() => setShowBooking(false)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={handleBookAppointment} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Select Therapist
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <select
                                        value={bookingData.therapistId}
                                        onChange={(e) => setBookingData({ ...bookingData, therapistId: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all appearance-none"
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
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Date
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="date"
                                            value={bookingData.date}
                                            onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                            min={new Date().toISOString().split('T')[0]}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Time
                                    </label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="time"
                                            value={bookingData.time}
                                            onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowBooking(false)}
                                    className="flex-1 px-4 py-3 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 btn-primary py-3 rounded-xl shadow-lg shadow-primary-500/25"
                                >
                                    Confirm Booking
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Appointments;
