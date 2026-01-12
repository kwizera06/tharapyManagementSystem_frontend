import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, Phone, Briefcase, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

const Signup = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'client',
        phoneNumber: '',
        specialization: '',
        qualifications: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        const signupData = {
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
            role: [formData.role],
        };

        if (formData.role === 'client') {
            signupData.phoneNumber = formData.phoneNumber;
        } else if (formData.role === 'therapist') {
            signupData.specialization = formData.specialization;
            signupData.qualifications = formData.qualifications;
        }

        const result = await signup(signupData);

        if (result.success) {
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary-400/20 blur-3xl animate-blob"></div>
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-secondary-400/20 blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-primary-600/20 blur-3xl animate-blob animation-delay-4000"></div>
            </div>

            <div className="max-w-2xl w-full relative z-10 animate-fade-in">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-6 shadow-xl shadow-primary-500/20 transform rotate-3 hover:rotate-6 transition-transform duration-300">
                        <UserPlus className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Create Account</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">Join our community today</p>
                </div>

                <div className="glass-panel p-8 rounded-3xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50/50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-start gap-3 animate-slide-up">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <span className="text-sm font-medium">{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50/50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl flex items-start gap-3 animate-slide-up">
                                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <span className="text-sm font-medium">Account created successfully! Redirecting to login...</span>
                            </div>
                        )}

                        {/* Role Selection */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                                I am a
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'client' })}
                                    className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2 ${formData.role === 'client'
                                        ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/20 shadow-lg shadow-primary-500/10 scale-[1.02]'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-primary-200 dark:hover:border-primary-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
                                        }`}
                                >
                                    <User className={`w-8 h-8 ${formData.role === 'client' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}`} />
                                    <span className={`font-semibold ${formData.role === 'client' ? 'text-primary-900 dark:text-primary-100' : 'text-slate-500 dark:text-slate-400'}`}>Client</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'therapist' })}
                                    className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2 ${formData.role === 'therapist'
                                        ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/20 shadow-lg shadow-primary-500/10 scale-[1.02]'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-primary-200 dark:hover:border-primary-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
                                        }`}
                                >
                                    <Briefcase className={`w-8 h-8 ${formData.role === 'therapist' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}`} />
                                    <span className={`font-semibold ${formData.role === 'therapist' ? 'text-primary-900 dark:text-primary-100' : 'text-slate-500 dark:text-slate-400'}`}>Therapist</span>
                                </button>
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                                    Full Name
                                </label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="input-field pl-12"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="input-field pl-12"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Password */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                                    Password
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="input-field pl-12"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                                    Confirm Password
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="input-field pl-12"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Role-specific fields */}
                        {formData.role === 'client' && (
                            <div className="space-y-2 animate-fade-in">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                                    Phone Number
                                </label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        className="input-field pl-12"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                            </div>
                        )}

                        {formData.role === 'therapist' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                                        Specialization
                                    </label>
                                    <input
                                        type="text"
                                        name="specialization"
                                        value={formData.specialization}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="e.g., Cognitive Behavioral Therapy"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                                        Qualifications
                                    </label>
                                    <textarea
                                        name="qualifications"
                                        value={formData.qualifications}
                                        onChange={handleChange}
                                        className="input-field min-h-[100px]"
                                        rows="3"
                                        placeholder="e.g., PhD in Clinical Psychology, Licensed Therapist"
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || success}
                            className="btn-primary w-full flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                'Creating Account...'
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700/50 text-center">
                        <p className="text-slate-600 dark:text-slate-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
