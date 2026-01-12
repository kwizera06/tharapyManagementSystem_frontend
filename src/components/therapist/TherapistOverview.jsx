import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentAPI } from '../../services/api';
import { Users, Calendar, CheckCircle, Clock, TrendingUp, ArrowRight, Activity, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const TherapistOverview = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalClients: 0,
        totalAppointments: 0,
        pendingAppointments: 0,
        completedSessions: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            // Fetch appointments for this therapist
            const appointmentsRes = await appointmentAPI.getTherapistAppointments(user.id);
            const appointments = appointmentsRes.data;

            // Count unique clients from appointments (therapist's actual clients)
            const uniqueClientIds = new Set(appointments.map(apt => apt.clientId));
            const totalClients = uniqueClientIds.size;

            // Count appointments by status
            const pendingAppointments = appointments.filter(
                apt => apt.status === 'PENDING'
            ).length;

            const completedSessions = appointments.filter(
                apt => apt.status === 'COMPLETED'
            ).length;

            setStats({
                totalClients,
                totalAppointments: appointments.length,
                pendingAppointments,
                completedSessions,
            });
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'My Clients',
            value: stats.totalClients,
            subtitle: 'Unique clients',
            icon: Users,
            color: 'blue',
            delay: 0,
        },
        {
            title: 'Total Appointments',
            value: stats.totalAppointments,
            subtitle: 'All time',
            icon: Calendar,
            color: 'violet',
            delay: 100,
        },
        {
            title: 'Pending Requests',
            value: stats.pendingAppointments,
            subtitle: 'Awaiting approval',
            icon: Clock,
            color: 'amber',
            delay: 200,
        },
        {
            title: 'Completed Sessions',
            value: stats.completedSessions,
            subtitle: 'Total completed',
            icon: CheckCircle,
            color: 'emerald',
            delay: 300,
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-secondary-600 p-8 sm:p-12 text-white shadow-xl">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-black/10 rounded-full blur-2xl"></div>

                <div className="relative z-10">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-3 font-['Outfit']">
                        Welcome back, Dr. {user?.fullName?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-primary-100 text-lg max-w-xl">
                        Here's an overview of your practice. You have {stats.pendingAppointments} pending requests to review.
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Quick Actions */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary-500" />
                        Quick Actions
                    </h2>
                    <div className="grid sm:grid-cols-3 gap-4">
                        <ActionButton
                            icon={<Calendar className="w-6 h-6" />}
                            label="View Schedule"
                            desc="Manage appointments"
                            href="/therapist/appointments"
                            color="bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                        />
                        <ActionButton
                            icon={<Users className="w-6 h-6" />}
                            label="My Clients"
                            desc="View client list"
                            href="/therapist/clients"
                            color="bg-violet-50 text-violet-600 hover:bg-violet-100 dark:bg-violet-900/20 dark:text-violet-400 dark:hover:bg-violet-900/30"
                        />
                        <ActionButton
                            icon={<FileText className="w-6 h-6" />}
                            label="Session Notes"
                            desc="Document sessions"
                            href="/therapist/sessions"
                            color="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
                        />
                    </div>

                    {/* Recent Activity Placeholder */}
                    <div className="glass-panel p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-slate-800 dark:text-white">Recent Activity</h3>
                            <Link to="/therapist/appointments" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                                View All <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {[1, 2].map((_, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">Appointment Request</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">New request from a client</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Performance/Insights */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary-500" />
                        Practice Insights
                    </h2>
                    <div className="glass-panel p-6 rounded-2xl h-full">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-white text-3xl font-bold shadow-lg mb-4">
                                {stats.totalClients}
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Active Clients</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Currently under care</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-600 dark:text-slate-400">Session Completion Rate</span>
                                    <span className="font-medium text-slate-900 dark:text-white">
                                        {stats.totalAppointments > 0
                                            ? Math.round((stats.completedSessions / stats.totalAppointments) * 100)
                                            : 0}%
                                    </span>
                                </div>
                                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary-500 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${stats.totalAppointments > 0 ? (stats.completedSessions / stats.totalAppointments) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/20">
                                <p className="text-sm text-primary-800 dark:text-primary-200 italic">
                                    "Your dedication to your clients makes a real difference."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, title, value, subtitle, color, delay }) => {
    const colorStyles = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
        violet: 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400',
        amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
        orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
        green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    };

    return (
        <div
            className="glass-panel p-6 rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${colorStyles[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">{value}</h3>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{title}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>
        </div>
    );
};

const ActionButton = ({ icon, label, desc, href, color }) => (
    <Link
        to={href}
        className={`flex flex-col items-center text-center p-6 rounded-2xl transition-all duration-300 group ${color}`}
    >
        <div className="mb-3 transform group-hover:scale-110 transition-transform duration-300">
            {icon}
        </div>
        <span className="font-semibold mb-1">{label}</span>
        <span className="text-xs opacity-80">{desc}</span>
    </Link>
);

export default TherapistOverview;
