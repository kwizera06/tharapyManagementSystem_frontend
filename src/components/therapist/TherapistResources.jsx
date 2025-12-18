import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { resourceAPI, userAPI } from '../../services/api';
import { FileText, Plus, Trash2, ExternalLink } from 'lucide-react';

const TherapistResources = () => {
    const { user } = useAuth();
    const [resources, setResources] = useState([]);
    const [clients, setClients] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        clientId: '',
        title: '',
        description: '',
        file: null,
        fileType: 'PDF',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [resourcesRes, clientsRes] = await Promise.all([
                resourceAPI.getTherapistResources(user.id),
                userAPI.getUsersByRole('CLIENT'),
            ]);
            setResources(resourcesRes.data);
            setClients(clientsRes.data);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('therapistId', user.id);
            if (formData.clientId) data.append('clientId', formData.clientId);
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('file', formData.file);
            data.append('fileType', formData.fileType);

            await resourceAPI.create(data);
            setShowForm(false);
            setFormData({ clientId: '', title: '', description: '', file: null, fileType: 'PDF' });
            loadData();
            alert('Resource created successfully');
        } catch (error) {
            alert('Failed to create resource');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this resource?')) {
            try {
                await resourceAPI.deleteResource(id);
                loadData();
            } catch (error) {
                alert('Failed to delete resource');
            }
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
                    <p className="text-gray-600">Share therapy materials with clients</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add Resource
                </button>
            </div>

            {/* Create Form */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold mb-4">Share New Resource</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Client (optional - leave empty for all clients)
                                </label>
                                <select
                                    value={formData.clientId}
                                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="">All Clients</option>
                                    {clients.map((client) => (
                                        <option key={client.id} value={client.id}>{client.fullName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="input-field"
                                    rows="3"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">File</label>
                                <input
                                    type="file"
                                    onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">File Type</label>
                                <select
                                    value={formData.fileType}
                                    onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                                    className="input-field"
                                >
                                    <option>PDF</option>
                                    <option>VIDEO</option>
                                    <option>AUDIO</option>
                                    <option>ARTICLE</option>
                                    <option>OTHER</option>
                                </select>
                            </div>
                            <div className="flex gap-3">
                                <button type="submit" className="btn-primary flex-1">Create</button>
                                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Resources List */}
            {resources.length === 0 ? (
                <div className="card text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No resources yet</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {resources.map((resource) => (
                        <div key={resource.id} className="card">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                                    <div className="flex items-center gap-2 mt-3">
                                        <span className="text-xs px-2 py-1 bg-primary-50 text-primary-700 rounded">{resource.fileType}</span>
                                        {resource.client ? (
                                            <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                                                {resource.client.fullName}
                                            </span>
                                        ) : (
                                            <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded">All Clients</span>
                                        )}
                                    </div>
                                    <a href={`http://localhost:8080${resource.fileUrl}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-3 text-sm text-primary-600 hover:text-primary-700">
                                        <ExternalLink className="w-4 h-4" />
                                        View
                                    </a>
                                </div>
                                <button onClick={() => handleDelete(resource.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TherapistResources;
