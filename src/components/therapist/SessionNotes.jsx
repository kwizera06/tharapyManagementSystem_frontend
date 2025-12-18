import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { sessionAPI, appointmentAPI } from '../../services/api';
import { FileText, Plus, Save } from 'lucide-react';

const SessionNotes = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        appointmentId: '',
        notes: '',
        summary: '',
        progressScore: 5,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        try {
            const response = await appointmentAPI.getTherapistAppointments(user.id);
            // Show all appointments
            setAppointments(response.data);
            console.log('Loaded appointments for session notes:', response.data);
        } catch (error) {
            console.error('Failed to load appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await sessionAPI.create(
                formData.appointmentId,
                formData.notes,
                formData.summary,
                formData.progressScore
            );
            setShowForm(false);
            setFormData({ appointmentId: '', notes: '', summary: '', progressScore: 5 });
            alert('Session notes saved successfully');
        } catch (error) {
            alert('Failed to save session notes');
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Session Notes</h1>
                    <p className="text-gray-600">Document your therapy sessions</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add Session Notes
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Create Session Notes</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Appointment ({appointments.length} available)
                                </label>
                                <select
                                    value={formData.appointmentId}
                                    onChange={(e) => setFormData({ ...formData, appointmentId: e.target.value })}
                                    className="input-field"
                                    required
                                >
                                    <option value="">Choose an appointment</option>
                                    {appointments.map((apt) => (
                                        <option key={apt.id} value={apt.id}>
                                            {apt.clientName} - {new Date(apt.appointmentTime).toLocaleDateString()}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Session Summary
                                </label>
                                <textarea
                                    value={formData.summary}
                                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                    className="input-field"
                                    rows="3"
                                    placeholder="Brief overview of the session..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Detailed Notes
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="input-field"
                                    rows="6"
                                    placeholder="Detailed session notes, observations, and recommendations..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Progress Score: {formData.progressScore}/10
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={formData.progressScore}
                                    onChange={(e) => setFormData({ ...formData, progressScore: parseInt(e.target.value) })}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>Needs Improvement</span>
                                    <span>Excellent Progress</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                                    <Save className="w-5 h-5" />
                                    Save Notes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="card text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Session notes will appear here</p>
                <p className="text-sm text-gray-500 mt-2">
                    Add notes after completing sessions with your clients
                </p>
            </div>
        </div>
    );
};

export default SessionNotes;
