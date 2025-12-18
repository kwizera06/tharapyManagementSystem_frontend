import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, Phone, Briefcase, AlertCircle, CheckCircle } from 'lucide-react';

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
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 transition-colors duration-200">
            <div className="max-w-2xl w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4 shadow-lg">
                        <UserPlus className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create Account</h1>
                    <p className="text-slate-600 dark:text-slate-400">Join our Therapy Management platform</p>
                </div>

                {/* Signup Form */}
                <div className="card bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <span className="text-sm">Account created successfully! Redirecting to login...</span>
                            </div>
                        )}

                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                I am a
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'client' })}
                                    className={`p-4 rounded-lg border-2 transition-all ${formData.role === 'client'
                                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-500'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                        }`}
                                >
                                    <User className={`w-6 h-6 mx-auto mb-2 ${formData.role === 'client' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}`} />
                                    <span className={`block text-sm font-medium ${formData.role === 'client' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>Client</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'therapist' })}
                                    className={`p-4 rounded-lg border-2 transition-all ${formData.role === 'therapist'
                                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-500'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                        }`}
                                >
                                    <Briefcase className={`w-6 h-6 mx-auto mb-2 ${formData.role === 'therapist' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}`} />
                                    <span className={`block text-sm font-medium ${formData.role === 'therapist' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>Therapist</span>
                                </button>
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="input-field pl-10 dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="input-field pl-10 dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Password */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="input-field pl-10 dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="input-field pl-10 dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Role-specific fields */}
                        {formData.role === 'client' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        className="input-field pl-10 dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                            </div>
                        )}

                        {formData.role === 'therapist' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Specialization
                                    </label>
                                    <input
                                        type="text"
                                        name="specialization"
                                        value={formData.specialization}
                                        onChange={handleChange}
                                        className="input-field dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400"
                                        placeholder="e.g., Cognitive Behavioral Therapy"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Qualifications
                                    </label>
                                    <textarea
                                        name="qualifications"
                                        value={formData.qualifications}
                                        onChange={handleChange}
                                        className="input-field dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400"
                                        rows="3"
                                        placeholder="e.g., PhD in Clinical Psychology, Licensed Therapist"
                                    />
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={loading || success}
                            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
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
