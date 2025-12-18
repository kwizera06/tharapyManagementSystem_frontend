import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentAPI } from '../../services/api';
import { Users, Calendar, CheckCircle, Clock, TrendingUp } from 'lucide-react';

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
        },
        {
            title: 'Total Appointments',
            value: stats.totalAppointments,
            subtitle: 'All time',
            icon: Calendar,
            color: 'purple',
        },
        {
            title: 'Pending Requests',
            value: stats.pendingAppointments,
            subtitle: 'Awaiting approval',
            icon: Clock,
            color: 'orange',
        },
        {
            title: 'Completed Sessions',
            value: stats.completedSessions,
            subtitle: 'Total completed',
            icon: CheckCircle,
            color: 'green',
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
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, Dr. {user?.fullName}!</h1>
                <p className="text-gray-600">Here's an overview of your practice</p>
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
                        href="/therapist/appointments"
                        className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                    >
                        <Calendar className="w-6 h-6 text-primary-600 mb-2" />
                        <h3 className="font-medium text-gray-900">View Appointments</h3>
                        <p className="text-sm text-gray-600">Manage your schedule</p>
                    </a>
                    <a
                        href="/therapist/clients"
                        className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                    >
                        <Users className="w-6 h-6 text-primary-600 mb-2" />
                        <h3 className="font-medium text-gray-900">My Clients</h3>
                        <p className="text-sm text-gray-600">View client list</p>
                    </a>
                    <a
                        href="/therapist/sessions"
                        className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                    >
                        <TrendingUp className="w-6 h-6 text-primary-600 mb-2" />
                        <h3 className="font-medium text-gray-900">Session Notes</h3>
                        <p className="text-sm text-gray-600">Document sessions</p>
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

export default TherapistOverview;
