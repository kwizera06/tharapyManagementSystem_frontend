import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { taskAPI, userAPI } from '../../services/api';
import { CheckSquare, Plus } from 'lucide-react';

const ClientTasks = () => {
    const { user } = useAuth();
    const [clients, setClients] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        clientId: '',
        title: '',
        instructions: '',
        dueDate: '',
    });

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            const response = await userAPI.getUsersByRole('CLIENT');
            setClients(response.data);
            console.log('Loaded clients for tasks:', response.data);
        } catch (error) {
            console.error('Failed to load clients:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await taskAPI.create(
                formData.clientId,
                user.id,
                null,
                formData.title,
                formData.instructions,
                formData.dueDate
            );
            setShowForm(false);
            setFormData({ clientId: '', title: '', instructions: '', dueDate: '' });
            alert('Task assigned successfully');
        } catch (error) {
            alert('Failed to assign task');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Client Tasks</h1>
                    <p className="text-gray-600">Assign tasks to your clients</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Assign Task
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold mb-4">Assign New Task</h2>
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
                                    Task Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="input-field"
                                    placeholder="e.g., Daily Mood Journal"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Instructions
                                </label>
                                <textarea
                                    value={formData.instructions}
                                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                    className="input-field"
                                    rows="4"
                                    placeholder="Detailed instructions for the task..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Due Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    className="input-field"
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>
                            <div className="flex gap-3">
                                <button type="submit" className="btn-primary flex-1">
                                    Assign Task
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
                <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No tasks assigned yet</p>
            </div>
        </div>
    );
};

export default ClientTasks;
