import { useState, useEffect } from 'react';
import { userAPI, appointmentAPI, sessionAPI, goalAPI, taskAPI } from '../../services/api';
import {
    Users, Calendar, FileText, Target, CheckSquare,
    TrendingUp, Activity, UserCheck, Clock
} from 'lucide-react';

const SystemStats = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        clients: 0,
        therapists: 0,
        verifiedTherapists: 0,
        totalAppointments: 0,
        totalSessions: 0,
        totalGoals: 0,
        totalTasks: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [clientsRes, therapistsRes] = await Promise.all([
                userAPI.getUsersByRole('CLIENT'),
                userAPI.getUsersByRole('THERAPIST'),
            ]);

            const clients = clientsRes.data;
            const therapists = therapistsRes.data;
            const verifiedTherapists = therapists.filter(t => t.isVerified);

            // More efficient: Get all appointments, sessions, goals, tasks from therapists
            // This avoids N client API calls
            let totalAppointments = 0;
            let totalSessions = 0;
            let totalGoals = 0;
            let totalTasks = 0;

            // Get data from all therapists (fewer API calls than all clients)
            const therapistPromises = therapists.map(async (therapist) => {
                try {
                    const [appts, sessions] = await Promise.all([
                        appointmentAPI.getTherapistAppointments(therapist.id).catch(() => ({ data: [] })),
                        sessionAPI.getTherapistSessions(therapist.id).catch(() => ({ data: [] })),
                    ]);
                    return {
                        appointments: appts.data.length,
                        sessions: sessions.data.length,
                    };
                } catch (error) {
                    return { appointments: 0, sessions: 0 };
                }
            });

            const therapistData = await Promise.all(therapistPromises);
            therapistData.forEach(data => {
                totalAppointments += data.appointments;
                totalSessions += data.sessions;
            });

            // Get goals and tasks from all clients (necessary as they're client-specific)
            const clientPromises = clients.map(async (client) => {
                try {
                    const [goals, tasks] = await Promise.all([
                        goalAPI.getClientGoals(client.id).catch(() => ({ data: [] })),
                        taskAPI.getClientTasks(client.id).catch(() => ({ data: [] })),
                    ]);
                    return {
                        goals: goals.data.length,
                        tasks: tasks.data.length,
                    };
                } catch (error) {
                    return { goals: 0, tasks: 0 };
                }
            });

            const clientData = await Promise.all(clientPromises);
            clientData.forEach(data => {
                totalGoals += data.goals;
                totalTasks += data.tasks;
            });

            setStats({
                totalUsers: clients.length + therapists.length,
                clients: clients.length,
                therapists: therapists.length,
                verifiedTherapists: verifiedTherapists.length,
                totalAppointments,
                totalSessions,
                totalGoals,
                totalTasks,
            });
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Users',
            value: stats.totalUsers,
            icon: Users,
            color: 'bg-blue-500',
            description: `${stats.clients} clients, ${stats.therapists} therapists`,
        },
        {
            title: 'Verified Therapists',
            value: stats.verifiedTherapists,
            icon: UserCheck,
            color: 'bg-green-500',
            description: `Out of ${stats.therapists} total therapists`,
        },
        {
            title: 'Total Appointments',
            value: stats.totalAppointments,
            icon: Calendar,
            color: 'bg-purple-500',
            description: 'All scheduled sessions',
        },
        {
            title: 'Completed Sessions',
            value: stats.totalSessions,
            icon: FileText,
            color: 'bg-indigo-500',
            description: 'Session notes recorded',
        },
        {
            title: 'Active Goals',
            value: stats.totalGoals,
            icon: Target,
            color: 'bg-pink-500',
            description: 'Client therapy goals',
        },
        {
            title: 'Tasks Assigned',
            value: stats.totalTasks,
            icon: CheckSquare,
            color: 'bg-orange-500',
            description: 'Client homework tasks',
        },
    ];

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">System Statistics</h1>
                <p className="text-gray-600">Platform analytics and insights</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {statCards.map((stat, index) => (
                    <div key={index} className="card hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600 mb-1">
                                    {stat.title}
                                </p>
                                <p className="text-3xl font-bold text-gray-900 mb-2">
                                    {stat.value}
                                </p>
                                <p className="text-xs text-gray-500">{stat.description}</p>
                            </div>
                            <div className={`${stat.color} p-3 rounded-lg`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Platform Health */}
            <div className="card mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Platform Health
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Therapist Verification Rate</span>
                            <span className="text-sm font-semibold text-gray-900">
                                {stats.therapists > 0
                                    ? Math.round((stats.verifiedTherapists / stats.therapists) * 100)
                                    : 0}
                                %
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-green-500 h-2 rounded-full transition-all"
                                style={{
                                    width: `${stats.therapists > 0
                                        ? (stats.verifiedTherapists / stats.therapists) * 100
                                        : 0
                                        }%`,
                                }}
                            ></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Session Completion Rate</span>
                            <span className="text-sm font-semibold text-gray-900">
                                {stats.totalAppointments > 0
                                    ? Math.round((stats.totalSessions / stats.totalAppointments) * 100)
                                    : 0}
                                %
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-indigo-500 h-2 rounded-full transition-all"
                                style={{
                                    width: `${stats.totalAppointments > 0
                                        ? (stats.totalSessions / stats.totalAppointments) * 100
                                        : 0
                                        }%`,
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Insights */}
            <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Quick Insights
                </h2>
                <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-900">
                                Average {(stats.totalAppointments / Math.max(stats.clients, 1)).toFixed(1)}{' '}
                                appointments per client
                            </p>
                            <p className="text-xs text-gray-600">
                                Based on {stats.totalAppointments} total appointments
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                        <Target className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-900">
                                Average {(stats.totalGoals / Math.max(stats.clients, 1)).toFixed(1)} goals per
                                client
                            </p>
                            <p className="text-xs text-gray-600">
                                {stats.totalGoals} total therapy goals set
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                        <CheckSquare className="w-5 h-5 text-purple-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-900">
                                Average {(stats.totalTasks / Math.max(stats.clients, 1)).toFixed(1)} tasks per
                                client
                            </p>
                            <p className="text-xs text-gray-600">
                                {stats.totalTasks} total homework tasks assigned
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemStats;
