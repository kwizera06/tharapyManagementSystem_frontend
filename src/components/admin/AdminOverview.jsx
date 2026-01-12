import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { Users, UserCheck, Activity, ArrowRight, Shield, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminOverview = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalClients: 0,
        totalTherapists: 0,
        verifiedTherapists: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            // Fetch users by role
            const [clientsRes, therapistsRes] = await Promise.all([
                userAPI.getUsersByRole('CLIENT'),
                userAPI.getUsersByRole('THERAPIST'),
            ]);

            const clients = clientsRes.data;
            const therapists = therapistsRes.data;
            const verifiedTherapists = therapists.filter(t => t.isVerified);

            setStats({
                totalUsers: clients.length + therapists.length + 1, // +1 for admin
                totalClients: clients.length,
                totalTherapists: therapists.length,
                verifiedTherapists: verifiedTherapists.length,
            });
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Total Users',
            value: stats.totalUsers,
            subtitle: 'All platform users',
            icon: Users,
            color: 'blue',
            delay: 0,
        },
        {
            title: 'Clients',
            value: stats.totalClients,
            subtitle: 'Registered clients',
            icon: Users,
            color: 'emerald',
            delay: 100,
        },
        {
            title: 'Therapists',
            value: stats.totalTherapists,
            subtitle: 'Total therapists',
            icon: UserCheck,
            color: 'violet',
            delay: 200,
        },
        {
            title: 'Verified Therapists',
            value: stats.verifiedTherapists,
            subtitle: `${stats.totalTherapists - stats.verifiedTherapists} pending`,
            icon: Shield,
            color: 'amber',
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
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 sm:p-12 text-white shadow-xl">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-primary-500/20 rounded-full blur-2xl"></div>

                <div className="relative z-10">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-3 font-['Outfit']">
                        System Overview
                    </h1>
                    <p className="text-slate-300 text-lg max-w-xl">
                        Monitor platform performance, user growth, and system health metrics.
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
                            icon={<Users className="w-6 h-6" />}
                            label="Manage Users"
                            desc="View and manage all users"
                            href="/admin/users"
                            color="bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                        />
                        <ActionButton
                            icon={<Shield className="w-6 h-6" />}
                            label="Verify Therapists"
                            desc="Review credentials"
                            href="/admin/verification"
                            color="bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/30"
                        />
                        <ActionButton
                            icon={<Activity className="w-6 h-6" />}
                            label="System Stats"
                            desc="View platform analytics"
                            href="/admin/stats"
                            color="bg-violet-50 text-violet-600 hover:bg-violet-100 dark:bg-violet-900/20 dark:text-violet-400 dark:hover:bg-violet-900/30"
                        />
                    </div>

                    {/* Pending Verifications Placeholder */}
                    <div className="glass-panel p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-slate-800 dark:text-white">Pending Verifications</h3>
                            <Link to="/admin/verification" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                                View All <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {stats.totalTherapists - stats.verifiedTherapists > 0 ? (
                                <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                                            {stats.totalTherapists - stats.verifiedTherapists} Therapists Awaiting Verification
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Review their documents and approve access.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                    <Shield className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                                    <p>No pending verifications</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* System Health/Growth */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary-500" />
                        Platform Growth
                    </h2>
                    <div className="glass-panel p-6 rounded-2xl h-full">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-white text-3xl font-bold shadow-lg mb-4">
                                {stats.totalUsers}
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Total Users</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Across all roles</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-600 dark:text-slate-400">Therapist Ratio</span>
                                    <span className="font-medium text-slate-900 dark:text-white">
                                        {stats.totalUsers > 0
                                            ? Math.round((stats.totalTherapists / stats.totalUsers) * 100)
                                            : 0}%
                                    </span>
                                </div>
                                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-violet-500 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${stats.totalUsers > 0 ? (stats.totalTherapists / stats.totalUsers) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">System Healthy</span>
                                    <br />
                                    All services are running normally.
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

export default AdminOverview;
