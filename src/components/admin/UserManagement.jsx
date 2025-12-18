import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { Users, Filter, CheckCircle, XCircle, Trash2 } from 'lucide-react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

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
            alert('Failed to update user status');
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
                alert('User deleted successfully');
                loadUsers();
            } catch (error) {
                console.error('Failed to delete user:', error);
                alert('Failed to delete user: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const filteredUsers = users.filter(user => {
        if (filter === 'clients') return user.role === 'CLIENT';
        if (filter === 'therapists') return user.role === 'THERAPIST';
        if (filter === 'admins') return user.role === 'ADMIN';
        return true;
    });

    const getRoleBadgeColor = (role) => {
        const colors = {
            CLIENT: 'bg-blue-100 text-blue-800',
            THERAPIST: 'bg-purple-100 text-purple-800',
            ADMIN: 'bg-red-100 text-red-800',
        };
        return colors[role] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600">Manage all platform users</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    All ({users.length})
                </button>
                <button
                    onClick={() => setFilter('clients')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'clients' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Clients ({users.filter(u => u.role === 'CLIENT').length})
                </button>
                <button
                    onClick={() => setFilter('therapists')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'therapists' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Therapists ({users.filter(u => u.role === 'THERAPIST').length})
                </button>
                <button
                    onClick={() => setFilter('admins')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'admins' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Admins ({users.filter(u => u.role === 'ADMIN').length})
                </button>
            </div>

            {/* Users Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-sm ${user.enabled ? 'text-green-700' : 'text-red-700'}`}>
                                            {user.enabled ? 'Active' : 'Disabled'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggleStatus(user.id)}
                                                className={`p-2 rounded-lg transition-colors ${user.enabled
                                                    ? 'text-green-600 hover:bg-green-50'
                                                    : 'text-red-600 hover:bg-red-50'
                                                    }`}
                                                title={user.enabled ? 'Disable user' : 'Enable user'}
                                            >
                                                {user.enabled ? (
                                                    <CheckCircle className="w-5 h-5" />
                                                ) : (
                                                    <XCircle className="w-5 h-5" />
                                                )}
                                            </button>
                                            {user.role !== 'ADMIN' && (
                                                <button
                                                    onClick={() => handleDelete(user.id, user.fullName, user.role)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete user"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
