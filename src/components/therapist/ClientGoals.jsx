import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { goalAPI, userAPI } from '../../services/api';
import { Target, Plus } from 'lucide-react';

const ClientGoals = () => {
    const { user } = useAuth();
    const [clients, setClients] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        clientId: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        targetDate: '',
    });

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            const response = await userAPI.getUsersByRole('CLIENT');
            setClients(response.data);
            console.log('Loaded clients for goals:', response.data);
        } catch (error) {
            console.error('Failed to load clients:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await goalAPI.create(
                formData.clientId,
                user.id,
                formData.description,
                formData.startDate,
                formData.targetDate
            );
            setShowForm(false);
            setFormData({ clientId: '', description: '', startDate: new Date().toISOString().split('T')[0], targetDate: '' });
            alert('Goal created successfully');
        } catch (error) {
            alert('Failed to create goal');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Client Goals</h1>
                    <p className="text-gray-600">Set and track therapy goals</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Create Goal
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold mb-4">Create New Goal</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Client ({clients.length} available)
                                </label>
                                <select
                                    value={formData.clientId}
                                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                    className="input-field"
                                    required
                                >
                                    <option value="">
                                        {clients.length === 0 ? 'No clients found - create a client account first' : 'Choose a client'}
                                    </option>
                                    {clients.map((client) => (
                                        <option key={client.id} value={client.id}>
                                            {client.fullName} ({client.email})
                                        </option>
                                    ))}
                                </select>
                                {clients.length === 0 && (
                                    <p className="text-sm text-amber-600 mt-2">
                                        ⚠️ No clients in the system. Please create a client account via the signup page first.
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Goal Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="input-field"
                                    rows="3"
                                    placeholder="Describe the therapy goal..."
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Target Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.targetDate}
                                        onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                                        className="input-field"
                                        min={formData.startDate}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button type="submit" className="btn-primary flex-1">
                                    Create Goal
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
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No goals created yet</p>
            </div>
        </div>
    );
};

export default ClientGoals;
