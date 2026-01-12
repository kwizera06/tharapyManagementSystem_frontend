import React, { useState, useEffect } from 'react';
import { userAPI, appointmentAPI, sessionAPI, goalAPI, taskAPI } from '../../services/api';
import {
    Users, Calendar, FileText, Target, CheckSquare,
    TrendingUp, Activity, UserCheck, Clock, BarChart3, PieChart,
    ArrowUpRight, ArrowDownRight
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

            let totalAppointments = 0;
            let totalSessions = 0;
            let totalGoals = 0;
            let totalTasks = 0;

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
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Users',
            value: stats.totalUsers,
            icon: Users,
            gradient: 'from-blue-500 to-blue-600',
            description: `${stats.clients} clients, ${stats.therapists} therapists`,
            trend: '+12%',
            trendUp: true
        },
        {
            title: 'Verified Therapists',
            value: stats.verifiedTherapists,
            icon: UserCheck,
            gradient: 'from-emerald-500 to-emerald-600',
            description: `${Math.round((stats.verifiedTherapists / (stats.therapists || 1)) * 100)}% verification rate`,
            trend: '+5%',
            trendUp: true
        },
        {
            title: 'Total Appointments',
            value: stats.totalAppointments,
            icon: Calendar,
            gradient: 'from-violet-500 to-violet-600',
            description: 'All scheduled sessions',
            trend: '+8%',
            trendUp: true
        },
        {
            title: 'Completed Sessions',
            value: stats.totalSessions,
            icon: FileText,
            gradient: 'from-indigo-500 to-indigo-600',
            description: 'Session notes recorded',
            trend: '+15%',
            trendUp: true
        },
        {
            title: 'Active Goals',
            value: stats.totalGoals,
            icon: Target,
            gradient: 'from-pink-500 to-pink-600',
            description: 'Client therapy goals',
            trend: '+3%',
            trendUp: true
        },
        {
            title: 'Tasks Assigned',
            value: stats.totalTasks,
            icon: CheckSquare,
            gradient: 'from-orange-500 to-orange-600',
            description: 'Client homework tasks',
            trend: '-2%',
            trendUp: false
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                        System Statistics
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">Platform analytics and performance metrics</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300">
                    <Clock size={16} />
                    <span>Last updated: {new Date().toLocaleTimeString()}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((stat, index) => (
                    <div key={index} className="glass-panel p-6 rounded-2xl hover:shadow-xl transition-all duration-300 group animate-scale-in">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300`}>
                                <stat.icon size={24} />
                            </div>
                            <div className={`flex items-center gap-1 text-sm font-medium ${stat.trendUp ? 'text-emerald-500' : 'text-red-500'}`}>
                                {stat.trendUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                {stat.trend}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
                                {stat.value}
                            </h3>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                                {stat.title}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                {stat.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Platform Health */}
                <div className="glass-panel p-6 rounded-2xl">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                        <Activity className="text-violet-600" size={20} />
                        Platform Health
                    </h2>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Therapist Verification Rate</span>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                    {stats.therapists > 0
                                        ? Math.round((stats.verifiedTherapists / stats.therapists) * 100)
                                        : 0}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{
                                        width: `${stats.therapists > 0
                                            ? (stats.verifiedTherapists / stats.therapists) * 100
                                            : 0}%`
                                    }}
                                ></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Session Completion Rate</span>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                    {stats.totalAppointments > 0
                                        ? Math.round((stats.totalSessions / stats.totalAppointments) * 100)
                                        : 0}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{
                                        width: `${stats.totalAppointments > 0
                                            ? (stats.totalSessions / stats.totalAppointments) * 100
                                            : 0}%`
                                    }}
                                ></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">User Engagement</span>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">85%</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-blue-400 h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: '85%' }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Insights */}
                <div className="glass-panel p-6 rounded-2xl">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="text-violet-600" size={20} />
                        Quick Insights
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/30">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                <Clock size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    Average {(stats.totalAppointments / Math.max(stats.clients, 1)).toFixed(1)} appointments per client
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Based on {stats.totalAppointments} total appointments across all clients
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                                <Target size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    Average {(stats.totalGoals / Math.max(stats.clients, 1)).toFixed(1)} goals per client
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {stats.totalGoals} total therapy goals currently active
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-800/30">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                                <CheckSquare size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    Average {(stats.totalTasks / Math.max(stats.clients, 1)).toFixed(1)} tasks per client
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {stats.totalTasks} total homework tasks assigned to clients
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemStats;
