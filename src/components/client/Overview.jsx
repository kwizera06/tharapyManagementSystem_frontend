import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentAPI, sessionAPI, goalAPI, taskAPI, notificationAPI } from '../../services/api';
import { Calendar, Target, CheckSquare, FileText, TrendingUp } from 'lucide-react';

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
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome back, {user?.fullName}!
                </h1>
                <p className="text-gray-600">Here's an overview of your therapy journey</p>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={<Calendar className="w-6 h-6" />}
                    title="Appointments"
                    value={stats.appointments}
                    subtitle="Total scheduled"
                    color="blue"
                />
                <StatCard
                    icon={<Target className="w-6 h-6" />}
                    title="Active Goals"
                    value={stats.goals}
                    subtitle="In progress"
                    color="green"
                />
                <StatCard
                    icon={<CheckSquare className="w-6 h-6" />}
                    title="Pending Tasks"
                    value={stats.tasks}
                    subtitle="To complete"
                    color="purple"
                />
                <StatCard
                    icon={<FileText className="w-6 h-6" />}
                    title="Sessions"
                    value={stats.sessions}
                    subtitle="Completed"
                    color="orange"
                />
            </div>

            {/* Quick Actions */}
            <div className="card mb-8">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <ActionButton
                        icon={<Calendar />}
                        label="Book Appointment"
                        href="/client/appointments"
                    />
                    <ActionButton
                        icon={<CheckSquare />}
                        label="View Tasks"
                        href="/client/tasks"
                    />
                    <ActionButton
                        icon={<Target />}
                        label="Track Goals"
                        href="/client/goals"
                    />
                </div>
            </div>

            {/* Progress Overview */}
            <div className="card">
                <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-6 h-6 text-primary-600" />
                    <h2 className="text-xl font-semibold">Your Progress</h2>
                </div>
                <p className="text-gray-600 mb-4">
                    You've completed {stats.sessions} therapy sessions and are working on {stats.goals} active goals.
                    Keep up the great work!
                </p>
                <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                        className="bg-primary-600 h-full transition-all duration-500"
                        style={{ width: `${Math.min((stats.sessions / 10) * 100, 100)}%` }}
                    />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                    {stats.sessions} / 10 sessions milestone
                </p>
            </div>
        </div>
    );
};

const StatCard = ({ icon, title, value, subtitle, color }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600',
    };

    return (
        <div className="card">
            <div className={`inline-flex p-3 rounded-lg ${colors[color]} mb-4`}>
                {icon}
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
            <p className="text-sm font-medium text-gray-700">{title}</p>
            <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
    );
};

const ActionButton = ({ icon, label, href }) => (
    <a
        href={href}
        className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all group"
    >
        <div className="text-primary-600 group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <span className="font-medium text-gray-700">{label}</span>
    </a>
);

export default Overview;
