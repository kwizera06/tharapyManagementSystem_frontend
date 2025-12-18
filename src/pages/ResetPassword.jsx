import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: 'error', content: 'Passwords do not match' });
            return;
        }

        if (formData.newPassword.length < 6) {
            setMessage({ type: 'error', content: 'Password must be at least 6 characters' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', content: '' });

        try {
            await axios.post('http://localhost:8080/api/auth/reset-password', null, {
                params: {
                    token,
                    newPassword: formData.newPassword
                }
            });
            setMessage({
                type: 'success',
                content: 'Password reset successfully! Redirecting to login...'
            });
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            setMessage({
                type: 'error',
                content: error.response?.data?.message || 'Failed to reset password. The link may be invalid or expired.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-slate-900 dark:to-slate-800 px-4">
            <div className="max-w-md w-full">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                            Reset Password
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Enter your new password below
                        </p>
                    </div>

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
                                New Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="password"
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md leading-5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Enter new password"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md leading-5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Confirm new password"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
