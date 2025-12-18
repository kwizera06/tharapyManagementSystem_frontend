import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        console.log('🚀 Form submitted, calling login...');
        const result = await login(email, password);
        console.log('📨 Login result:', result);

        // Check if 2FA is required
        if (result.requires2FA) {
            console.log('🔐 2FA required, redirecting to verification...');
            navigate('/verify-2fa', { state: { email: result.email } });
            setLoading(false);
            return;
        }

        if (result.success) {
            const user = JSON.parse(localStorage.getItem('user'));
            console.log('👤 User from localStorage:', user);
            console.log('🎭 User role:', user.role);

            // Redirect based on role
            if (user.role === 'CLIENT') {
                console.log('➡️ Navigating to /client');
                navigate('/client');
            } else if (user.role === 'THERAPIST') {
                console.log('➡️ Navigating to /therapist');
                navigate('/therapist');
            } else if (user.role === 'ADMIN') {
                console.log('➡️ Navigating to /admin');
                navigate('/admin');
            } else {
                console.warn('⚠️ Unknown role:', user.role);
            }
        } else {
            console.error('❌ Login failed:', result.error);
            setError(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 transition-colors duration-200">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4 shadow-lg">
                        <LogIn className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome Back</h1>
                    <p className="text-slate-600 dark:text-slate-400">Sign in to your Therapy Management account</p>
                </div>

                {/* Login Form */}
                <div className="card bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field pl-10 dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pl-10 dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div className="text-right mt-1">
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500"
                                >
                                    Forgot Password?
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Demo Credentials */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-xs text-blue-800 dark:text-blue-300 font-medium mb-2">Demo Credentials:</p>
                    <p className="text-xs text-blue-700 dark:text-blue-400">Client: client@example.com / password123</p>
                    <p className="text-xs text-blue-700 dark:text-blue-400">Therapist: therapist@example.com / password123</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
