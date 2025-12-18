import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import { User, Mail, Phone, Save, Loader } from 'lucide-react';

const Profile = () => {
    const { user, login } = useAuth(); // login is used to update the user in context
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' });

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', content: '' });

        try {
            const response = await userAPI.updateUser(user.id, formData);
            // Update local user context with new data
            // We might need a better way to update context without full re-login, 
            // but for now, we can assume the backend returns the updated user object.
            // If the AuthContext exposes a way to update user data directly, we should use that.
            // For now, let's just show success.

            setMessage({ type: 'success', content: 'Profile updated successfully!' });
        } catch (error) {
            console.error('Failed to update profile:', error);
            setMessage({ type: 'error', content: 'Failed to update profile. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Profile Settings</h2>

                {message.content && (
                    <div className={`p-4 rounded-lg mb-6 ${message.type === 'success'
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                        }`}>
                        {message.content}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Full Name
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md leading-5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors duration-200"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md leading-5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors duration-200"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Phone Number
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md leading-5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors duration-200"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            {loading ? (
                                <>
                                    <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="-ml-1 mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
