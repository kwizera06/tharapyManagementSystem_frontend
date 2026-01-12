import React, { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import {
    Users, Filter, CheckCircle, XCircle, Trash2, Search,
    MoreVertical, Shield, User, UserCheck, Mail, AlertTriangle
} from 'lucide-react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await userAPI.getAllUsers();
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (userId) => {
        try {
            await userAPI.toggleUserStatus(userId);
            loadUsers();
        } catch (error) {
            console.error('Failed to toggle user status:', error);
        }
    };

    const handleDelete = async (userId, userName, userRole) => {
        if (userRole === 'ADMIN') {
            alert('Cannot delete admin users');
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete ${userName}?\n\nThis action cannot be undone and will remove all associated data.`
        );

        if (confirmed) {
            try {
                await userAPI.deleteUser(userId);
                loadUsers();
            } catch (error) {
                console.error('Failed to delete user:', error);
            }
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesFilter =
            filter === 'all' ? true :
                filter === 'clients' ? user.role === 'CLIENT' :
                    filter === 'therapists' ? user.role === 'THERAPIST' :
                        filter === 'admins' ? user.role === 'ADMIN' : true;

        const matchesSearch =
            user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    const getRoleBadgeColor = (role) => {
        const colors = {
            CLIENT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
            THERAPIST: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
            ADMIN: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
        };
        return colors[role] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'ADMIN': return <Shield size={14} />;
            case 'THERAPIST': return <UserCheck size={14} />;
            default: return <User size={14} />;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                        User Management
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">Manage user accounts, roles, and permissions</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 rounded-xl">
                    <Users size={20} />
                    <span className="font-semibold">{users.length} Total Users</span>
                </div>
            </div>

            {/* Controls */}
            <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    {[
                        { id: 'all', label: 'All Users', count: users.length },
                        { id: 'clients', label: 'Clients', count: users.filter(u => u.role === 'CLIENT').length },
                        { id: 'therapists', label: 'Therapists', count: users.filter(u => u.role === 'THERAPIST').length },
                        { id: 'admins', label: 'Admins', count: users.filter(u => u.role === 'ADMIN').length },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${filter === tab.id
                                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            {tab.label}
                            <span className={`px-1.5 py-0.5 rounded-md text-xs ${filter === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                                }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Users Table */}
            <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>No users found matching your criteria</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold">
                                                    {user.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{user.fullName}</p>
                                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                                        <Mail size={12} />
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                                                {getRoleIcon(user.role)}
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${user.enabled
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${user.enabled ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                {user.enabled ? 'Active' : 'Disabled'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date().toLocaleDateString()} {/* Placeholder for joined date if not available */}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleToggleStatus(user.id)}
                                                    className={`p-2 rounded-lg transition-colors ${user.enabled
                                                            ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                                                            : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                        }`}
                                                    title={user.enabled ? 'Disable Account' : 'Enable Account'}
                                                >
                                                    {user.enabled ? <XCircle size={18} /> : <CheckCircle size={18} />}
                                                </button>
                                                {user.role !== 'ADMIN' && (
                                                    <button
                                                        onClick={() => handleDelete(user.id, user.fullName, user.role)}
                                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        title="Delete Account"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
