import { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';
import {
    Users, UserCheck, Activity, DollarSign,
    Home, LogOut, Bell, Menu, X, Settings, User
} from 'lucide-react';
import AdminOverview from '../components/admin/AdminOverview';
import UserManagement from '../components/admin/UserManagement';
import TherapistVerification from '../components/admin/TherapistVerification';
import SystemStats from '../components/admin/SystemStats';
import Profile from '../components/common/Profile';
import ThemeToggle from '../components/common/ThemeToggle';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const notifRef = useRef(null);

    const navigation = [
        { name: 'Overview', href: '/admin', icon: Home },
        { name: 'User Management', href: '/admin/users', icon: Users },
        { name: 'Therapist Verification', href: '/admin/verification', icon: UserCheck },
        { name: 'System Stats', href: '/admin/stats', icon: Activity },
        { name: 'Profile', href: '/admin/profile', icon: User },
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
                        <h1 className="text-xl font-bold text-primary-600">TMS Admin</h1>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href ||
                                (item.href !== '/admin' && location.pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-medium'
                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                        }`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                                <Settings className="w-5 h-5 text-primary-700" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                    {user?.fullName}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Administrator</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
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
                        <div className="flex items-center gap-4 ml-auto">
                            <ThemeToggle />
                            <div className="relative" ref={notifRef}>
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    <Bell className="w-5 h-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {showNotifications && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50">
                                        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                                            <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-4 text-center text-gray-500">
                                                    No notifications
                                                </div>
                                            ) : (
                                                notifications.map((notif) => (
                                                    <div
                                                        key={notif.id}
                                                        className={`p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer ${!notif.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                                            }`}
                                                        onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                                                    >
                                                        <p className="text-sm text-slate-900 dark:text-slate-100">{notif.message}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                            {new Date(notif.timestamp).toLocaleString()}
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
                        <Route index element={<AdminOverview />} />
                        <Route path="users" element={<UserManagement />} />
                        <Route path="verification" element={<TherapistVerification />} />
                        <Route path="stats" element={<SystemStats />} />
                        <Route path="profile" element={<Profile />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
