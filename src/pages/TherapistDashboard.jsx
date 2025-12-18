import { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';
import {
    Users, Calendar, FileText, Target, CheckSquare,
    MessageSquare, Home, LogOut, Bell, Menu, X, Folder, DollarSign, User
} from 'lucide-react';
import TherapistOverview from '../components/therapist/TherapistOverview';
import Clients from '../components/therapist/Clients';
import TherapistAppointments from '../components/therapist/TherapistAppointments';
import SessionNotes from '../components/therapist/SessionNotes';
import ClientGoals from '../components/therapist/ClientGoals';
import ClientTasks from '../components/therapist/ClientTasks';
import TherapistResources from '../components/therapist/TherapistResources';
import TherapistPayments from '../components/therapist/TherapistPayments';
import TherapistMessages from '../components/therapist/TherapistMessages';
import Profile from '../components/common/Profile';
import ThemeToggle from '../components/common/ThemeToggle';

const TherapistDashboard = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const notifRef = useRef(null);

    const navigation = [
        { name: 'Overview', href: '/therapist', icon: Home },
        { name: 'Clients', href: '/therapist/clients', icon: Users },
        { name: 'Appointments', href: '/therapist/appointments', icon: Calendar },
        { name: 'Session Notes', href: '/therapist/sessions', icon: FileText },
        { name: 'Goals', href: '/therapist/goals', icon: Target },
        { name: 'Tasks', href: '/therapist/tasks', icon: CheckSquare },
        { name: 'Resources', href: '/therapist/resources', icon: Folder },
        { name: 'Payments', href: '/therapist/payments', icon: DollarSign },
        { name: 'Messages', href: '/therapist/messages', icon: MessageSquare },
        { name: 'Profile', href: '/therapist/profile', icon: User },
    ];

    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadNotifications = async () => {
        if (!user?.id) return;
        try {
            const [allNotifs, unread] = await Promise.all([
                notificationAPI.getUserNotifications(user.id),
                notificationAPI.getUnreadNotifications(user.id)
            ]);
            setNotifications(allNotifs.data.slice(0, 5)); // Show last 5
            setUnreadCount(unread.data.length);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationAPI.markAsRead(id);
            loadNotifications();
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 dark:border-slate-700">
                        <h1 className="text-xl font-bold text-primary-600">TMS Therapist</h1>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${isActive
                                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500'}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 px-4 py-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold">
                                {user?.fullName?.charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.fullName}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Therapist</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            <LogOut className="w-5 h-5 mr-3" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>

            <div className="lg:pl-64">
                <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 transition-colors duration-200">
                    <div className="flex items-center justify-between h-16 px-4 sm:px-6">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="flex-1"></div>
                        <div className="flex items-center gap-4">
                            <ThemeToggle />
                            <div className="relative" ref={notifRef}>
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="p-2 text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 relative"
                                >
                                    <Bell className="w-6 h-6" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-0 right-0 block w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-800" />
                                    )}
                                </button>

                                {showNotifications && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 py-1 z-50 border border-slate-200 dark:border-slate-700">
                                        <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={() => notifications.forEach(n => !n.read && handleMarkAsRead(n.id))}
                                                    className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                                                >
                                                    Mark all read
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                                                    No notifications
                                                </div>
                                            ) : (
                                                notifications.map((notif) => (
                                                    <div
                                                        key={notif.id}
                                                        className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-700/50 last:border-0 ${!notif.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                                                            }`}
                                                        onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                                                    >
                                                        <p className={`text-sm ${!notif.read ? 'font-semibold text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>
                                                            {notif.message}
                                                        </p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                            {new Date(notif.timestamp).toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-4 sm:p-6 lg:p-8">
                    <Routes>
                        <Route index element={<TherapistOverview />} />
                        <Route path="clients" element={<Clients />} />
                        <Route path="appointments" element={<TherapistAppointments />} />
                        <Route path="sessions" element={<SessionNotes />} />
                        <Route path="goals" element={<ClientGoals />} />
                        <Route path="tasks" element={<ClientTasks />} />
                        <Route path="resources" element={<TherapistResources />} />
                        <Route path="payments" element={<TherapistPayments />} />
                        <Route path="messages" element={<TherapistMessages />} />
                        <Route path="profile" element={<Profile />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default TherapistDashboard;
