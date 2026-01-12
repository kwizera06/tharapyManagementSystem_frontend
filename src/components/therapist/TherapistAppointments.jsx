import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentAPI } from '../../services/api';
import { Calendar, Clock, Check, X, User, Search, Filter, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

const TherapistAppointments = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [processingId, setProcessingId] = useState(null);
    const [message, setMessage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

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
        const matchesFilter = filter === 'all' ||
            (filter === 'pending' && apt.status === 'PENDING') ||
            (filter === 'approved' && apt.status === 'APPROVED');

        const matchesSearch = apt.clientName.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    const getStatusStyle = (status) => {
        const styles = {
            PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
            APPROVED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
            REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
            COMPLETED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        };
        return styles[status] || 'bg-slate-100 text-slate-800';
    };

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
                    <p className="text-slate-600 dark:text-slate-400">Manage your schedule and requests</p>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 animate-fade-in ${message.type === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30'
                        : 'bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 glass-panel p-2 rounded-xl flex items-center gap-3 px-4">
                    <Search className="w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search clients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder-slate-400 w-full"
                    />
                </div>

                {/* Filters */}
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto">
                    {['all', 'pending', 'approved'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize whitespace-nowrap ${filter === f
                                    ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                        >
                            {f} ({
                                f === 'all' ? appointments.length :
                                    appointments.filter(a => a.status === f.toUpperCase()).length
                            })
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid gap-4">
                {filteredAppointments.length === 0 ? (
                    <div className="text-center py-16 glass-panel rounded-3xl">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No appointments found</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                            {searchTerm ? 'Try adjusting your search terms' : 'No appointments match the selected filter.'}
                        </p>
                    </div>
                ) : (
                    filteredAppointments.map((apt) => (
                        <div key={apt.id} className="glass-panel p-6 rounded-2xl hover:border-primary-500/30 transition-all group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-lg">
                                        {apt.clientName.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                            {apt.clientName}
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

                                <div className="flex items-center gap-4 self-end md:self-auto">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(apt.status)}`}>
                                        {apt.status}
                                    </span>

                                    {apt.status === 'PENDING' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleStatusUpdate(apt.id, 'APPROVED')}
                                                disabled={processingId === apt.id}
                                                className={`p-2 rounded-xl transition-all ${processingId === apt.id
                                                        ? 'bg-slate-100 text-slate-400'
                                                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:scale-110 active:scale-95 border border-emerald-200'
                                                    }`}
                                                title="Approve"
                                            >
                                                {processingId === apt.id ? (
                                                    <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                                                ) : (
                                                    <Check className="w-5 h-5" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(apt.id, 'REJECTED')}
                                                disabled={processingId === apt.id}
                                                className={`p-2 rounded-xl transition-all ${processingId === apt.id
                                                        ? 'bg-slate-100 text-slate-400'
                                                        : 'bg-red-50 text-red-600 hover:bg-red-100 hover:scale-110 active:scale-95 border border-red-200'
                                                    }`}
                                                title="Reject"
                                            >
                                                {processingId === apt.id ? (
                                                    <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                                                ) : (
                                                    <X className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TherapistAppointments;
