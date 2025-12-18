import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const TwoFactorVerify = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const email = location.state?.email || '';

    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', content: '' });

        try {
            const response = await axios.post('http://localhost:8080/api/auth/verify-2fa', null, {
                params: { email, code }
            });

            // Store token and user data
            const { token, id, fullName, roles } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({ id, email, fullName, role: roles[0] }));

            // Update auth context
            login({ id, email, fullName, role: roles[0] }, token);

            // Redirect based on role
            const role = roles[0].replace('ROLE_', '').toLowerCase();
            navigate(`/${role}`);
        } catch (error) {
            setMessage({
                type: 'error',
                content: error.response?.data?.message || 'Invalid code. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        setLoading(true);
        setMessage({ type: '', content: '' });

        try {
            // Re-login to trigger new code
            await axios.post('http://localhost:8080/api/auth/signin', { email, password: '' });
            setMessage({
                type: 'success',
                content: 'A new code has been sent to your email'
            });
        } catch (error) {
            setMessage({
                type: 'error',
                content: 'Failed to resend code. Please try logging in again.'
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
                        <div className="mx-auto w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
                            <Shield className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                            Two-Factor Authentication
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Enter the 6-digit code sent to<br />
                            <span className="font-medium">{email}</span>
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
                                Verification Code
                            </label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md leading-5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-center text-2xl tracking-widest font-mono focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                placeholder="000000"
                                maxLength={6}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || code.length !== 6}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Verifying...' : 'Verify Code'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={handleResendCode}
                            disabled={loading}
                            className="inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 disabled:opacity-50"
                        >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Resend Code
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TwoFactorVerify;
