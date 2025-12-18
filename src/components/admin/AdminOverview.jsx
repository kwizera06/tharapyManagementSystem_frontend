import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { Users, UserCheck, Activity } from 'lucide-react';

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
        },
        {
            title: 'Clients',
            value: stats.totalClients,
            subtitle: 'Registered clients',
            icon: Users,
            color: 'green',
        },
        {
            title: 'Therapists',
            value: stats.totalTherapists,
            subtitle: 'Total therapists',
            icon: UserCheck,
            color: 'purple',
        },
        {
            title: 'Verified Therapists',
            value: stats.verifiedTherapists,
            subtitle: `${stats.totalTherapists - stats.verifiedTherapists} pending`,
            icon: UserCheck,
            color: 'orange',
        },
    ];

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">System Overview</h1>
                <p className="text-gray-600">Platform statistics and metrics</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            {/* Quick Actions */}
            <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <a
                        href="/admin/users"
                        className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                    >
                        <Users className="w-6 h-6 text-primary-600 mb-2" />
                        <h3 className="font-medium text-gray-900">Manage Users</h3>
                        <p className="text-sm text-gray-600">View and manage all users</p>
                    </a>
                    <a
                        href="/admin/therapists"
                        className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                    >
                        <UserCheck className="w-6 h-6 text-primary-600 mb-2" />
                        <h3 className="font-medium text-gray-900">Verify Therapists</h3>
                        <p className="text-sm text-gray-600">Review therapist credentials</p>
                    </a>
                    <a
                        href="/admin/reports"
                        className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                    >
                        <Activity className="w-6 h-6 text-primary-600 mb-2" />
                        <h3 className="font-medium text-gray-900">System Reports</h3>
                        <p className="text-sm text-gray-600">View platform analytics</p>
                    </a>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, title, value, subtitle, color }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600',
    };

    return (
        <div className="card">
            <div className={`inline-flex p-3 rounded-lg ${colors[color]} mb-4`}>
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
            <p className="text-sm font-medium text-gray-700">{title}</p>
            <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
    );
};

export default AdminOverview;
