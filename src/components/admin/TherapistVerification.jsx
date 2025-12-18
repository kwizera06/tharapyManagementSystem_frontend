import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { UserCheck, Mail, Award, CheckCircle, Clock } from 'lucide-react';

const TherapistVerification = () => {
    const [therapists, setTherapists] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTherapists();
    }, []);

    const loadTherapists = async () => {
        try {
            const response = await userAPI.getUsersByRole('THERAPIST');
            setTherapists(response.data);
        } catch (error) {
            console.error('Failed to load therapists:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (therapistId) => {
        try {
            await userAPI.verifyTherapist(therapistId);
            // Reload therapists to update both lists
            loadTherapists();
            alert('Therapist verified successfully');
        } catch (error) {
            console.error('Failed to verify therapist:', error);
            alert('Failed to verify therapist');
        }
    };

    const pending = therapists.filter(t => !t.isVerified);
    const verified = therapists.filter(t => t.isVerified);

    if (loading) {
        return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Therapist Verification</h1>
                <p className="text-gray-600">Review and verify therapist credentials</p>
            </div>

            {/* Pending Verification */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    Pending Verification ({pending.length})
                </h2>
                <div className="space-y-4">
                    {pending.length === 0 ? (
                        <div className="card text-center py-8">
                            <p className="text-gray-600">No pending verifications</p>
                        </div>
                    ) : (
                        pending.map((therapist) => (
                            <div key={therapist.id} className="card hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                                                <span className="text-purple-700 font-semibold text-lg">
                                                    {therapist.fullName.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {therapist.fullName}
                                                </h3>
                                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {therapist.email}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">Specialization:</p>
                                                <p className="text-sm text-gray-600">{therapist.specialization || 'Not provided'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">Qualifications:</p>
                                                <p className="text-sm text-gray-600">{therapist.qualifications || 'Not provided'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleVerify(therapist.id)}
                                        className="btn-primary flex items-center gap-2"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Verify
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Verified Therapists */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Verified Therapists ({verified.length})
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {verified.map((therapist) => (
                        <div key={therapist.id} className="card">
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                    <Award className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                                        {therapist.fullName}
                                    </h3>
                                    <p className="text-sm text-gray-600 truncate mb-2">{therapist.email}</p>
                                    <p className="text-xs text-gray-500">{therapist.specialization}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TherapistVerification;
