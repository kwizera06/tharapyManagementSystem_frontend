import { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';
import {
    Users, UserCheck, Activity, DollarSign,
    Home, LogOut, Bell, Menu, X, Settings, User,
    ChevronRight, Search
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
        const interval = setInterval(loadNotifications, 30000);
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
            setNotifications(allNotifs.data.slice(0, 5));
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200 font-['Outfit']">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between h-20 px-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                                <span className="text-white font-bold text-xl">T</span>
                            </div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">TMS</h1>
                        </div>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                            <X className="w-6 h-6 text-slate-500" />
                        </button>
                    </div>

                    <div className="px-4 mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500/50 transition-all"
                            />
                        </div>
                    </div>

                    <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-hide">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href ||
                                (item.href !== '/admin' && location.pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`group flex items-center justify-between px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                                        {item.name}
                                    </div>
                                    {isActive && <ChevronRight className="w-4 h-4 text-primary-500" />}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="bg-slate-50 dark:bg-slate-700/30 rounded-2xl p-4 mb-2">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-lg shadow-sm">
                                    <Settings className="w-5 h-5 text-primary-700 dark:text-primary-300" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                        {user?.fullName}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Administrator</p>
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            <div className="lg:pl-72 flex flex-col min-h-screen">
                <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 transition-colors duration-200">
                    <div className="flex items-center justify-between h-20 px-4 sm:px-8">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                <Menu className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                            </button>
                            <h2 className="text-xl font-semibold text-slate-800 dark:text-white hidden sm:block">
                                {navigation.find(n => n.href === location.pathname)?.name || 'Dashboard'}
                            </h2>
                        </div>
                        <div className="flex items-center gap-4">
                            <ThemeToggle />
                            <div className="relative" ref={notifRef}>
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all relative group"
                                >
                                    <Bell className="w-6 h-6 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 ring-2 ring-white dark:ring-slate-900 rounded-full animate-pulse" />
                                    )}
                                </button>

                                {showNotifications && (
                                    <div className="absolute right-0 mt-4 w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 py-2 z-50 animate-fade-in origin-top-right">
                                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                            <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={() => notifications.forEach(n => !n.read && handleMarkAsRead(n.id))}
                                                    className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                                                >
                                                    Mark all read
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                            {notifications.length === 0 ? (
                                                <div className="px-6 py-8 text-center">
                                                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                        <Bell className="w-6 h-6 text-slate-400" />
                                                    </div>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">No new notifications</p>
                                                </div>
                                            ) : (
                                                notifications.map((notif) => (
                                                    <div
                                                        key={notif.id}
                                                        className={`px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-700/50 last:border-0 cursor-pointer ${!notif.isRead ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''
                                                            }`}
                                                        onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                                                    >
                                                        <div className="flex gap-3">
                                                            <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${!notif.isRead ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                                                            <div>
                                                                <p className={`text-sm ${!notif.isRead ? 'font-semibold text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>
                                                                    {notif.message}
                                                                </p>
                                                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-medium">
                                                                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            </div>
                                                        </div>
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

                <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full animate-fade-in">
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
