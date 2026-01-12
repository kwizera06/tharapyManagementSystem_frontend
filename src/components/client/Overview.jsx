import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentAPI, sessionAPI, goalAPI, taskAPI } from '../../services/api';
import { Calendar, Target, CheckSquare, FileText, TrendingUp, ArrowRight, Activity, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Overview = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        appointments: 0,
        goals: 0,
        tasks: 0,
        sessions: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [appointments, goals, tasks, sessions] = await Promise.all([
                appointmentAPI.getClientAppointments(user.id),
                goalAPI.getClientGoals(user.id),
                taskAPI.getClientTasks(user.id),
                sessionAPI.getClientSessions(user.id),
            ]);

            setStats({
                appointments: appointments.data.length,
                goals: goals.data.filter(g => g.status === 'IN_PROGRESS').length,
                tasks: tasks.data.filter(t => !t.completed).length,
                sessions: sessions.data.length,
            });
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setLoading(false);
        }
    };

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
                        Welcome back, {user?.fullName?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-primary-100 text-lg max-w-xl">
                        Your journey to wellness is important. Here's a snapshot of your progress and upcoming activities.
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<Calendar className="w-6 h-6" />}
                    title="Appointments"
                    value={stats.appointments}
                    subtitle="Scheduled"
                    color="blue"
                    delay={0}
                />
                <StatCard
                    icon={<Target className="w-6 h-6" />}
                    title="Active Goals"
                    value={stats.goals}
                    subtitle="In Progress"
                    color="emerald"
                    delay={100}
                />
                <StatCard
                    icon={<CheckSquare className="w-6 h-6" />}
                    title="Pending Tasks"
                    value={stats.tasks}
                    subtitle="To Complete"
                    color="violet"
                    delay={200}
                />
                <StatCard
                    icon={<FileText className="w-6 h-6" />}
                    title="Sessions"
                    value={stats.sessions}
                    subtitle="Completed"
                    color="amber"
                    delay={300}
                />
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
                            label="Book Session"
                            desc="Schedule a new appointment"
                            href="/client/appointments"
                            color="bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                        />
                        <ActionButton
                            icon={<CheckSquare className="w-6 h-6" />}
                            label="Update Tasks"
                            desc="Mark tasks as complete"
                            href="/client/tasks"
                            color="bg-violet-50 text-violet-600 hover:bg-violet-100 dark:bg-violet-900/20 dark:text-violet-400 dark:hover:bg-violet-900/30"
                        />
                        <ActionButton
                            icon={<Target className="w-6 h-6" />}
                            label="Track Goals"
                            desc="Update your progress"
                            href="/client/goals"
                            color="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
                        />
                    </div>

                    {/* Recent Activity Placeholder - Could be populated with real data later */}
                    <div className="glass-panel p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-slate-800 dark:text-white">Recent Activity</h3>
                            <Link to="/client/sessions" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
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
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">Session Completed</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Yesterday at 2:00 PM</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Progress Overview */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary-500" />
                        Your Journey
                    </h2>
                    <div className="glass-panel p-6 rounded-2xl h-full">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-white text-3xl font-bold shadow-lg mb-4">
                                {Math.min(Math.round((stats.sessions / 10) * 100), 100)}%
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Milestone Progress</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">10 Sessions Goal</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-600 dark:text-slate-400">Sessions Completed</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{stats.sessions}/10</span>
                                </div>
                                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary-500 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${Math.min((stats.sessions / 10) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/20">
                                <p className="text-sm text-primary-800 dark:text-primary-200 italic">
                                    "Consistency is key. You're doing great on your path to wellness!"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, title, value, subtitle, color, delay }) => {
    const colorStyles = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
        violet: 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400',
        amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
    };

    return (
        <div
            className="glass-panel p-6 rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${colorStyles[color]}`}>
                    {icon}
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${colorStyles[color]}`}>
                    +2.5%
                </span>
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

export default Overview;
