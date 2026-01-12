import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { resourceAPI, userAPI } from '../../services/api';
import {
    FileText, Plus, Trash2, ExternalLink, Search, Filter,
    Video, Music, Link as LinkIcon, File, Download, X, UploadCloud,
    Users, Globe
} from 'lucide-react';

const TherapistResources = () => {
    const { user } = useAuth();
    const [resources, setResources] = useState([]);
    const [clients, setClients] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL');
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
            // Add toast notification here
        } catch (error) {
            console.error('Failed to create resource:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this resource?')) {
            try {
                await resourceAPI.deleteResource(id);
                loadData();
            } catch (error) {
                console.error('Failed to delete resource:', error);
            }
        }
    };

    const getFileIcon = (type) => {
        switch (type) {
            case 'PDF': return <FileText size={24} className="text-red-500" />;
            case 'VIDEO': return <Video size={24} className="text-blue-500" />;
            case 'AUDIO': return <Music size={24} className="text-purple-500" />;
            case 'ARTICLE': return <LinkIcon size={24} className="text-green-500" />;
            default: return <File size={24} className="text-gray-500" />;
        }
    };

    const filteredResources = resources.filter(resource => {
        const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'ALL' || resource.fileType === filterType;
        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                        Resources Library
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">Share and manage therapeutic materials</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-violet-500/20 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                    <Plus size={20} />
                    <span>Add Resource</span>
                </button>
            </div>

            {/* Search and Filters */}
            <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search resources..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    {['ALL', 'PDF', 'VIDEO', 'AUDIO', 'ARTICLE'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${filterType === type
                                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            {type.charAt(0) + type.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Resources Grid */}
            {filteredResources.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <FileText size={48} className="mb-4 opacity-20" />
                    <p>No resources found matching your criteria</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResources.map((resource) => (
                        <div key={resource.id} className="glass-panel p-6 rounded-2xl group hover:shadow-xl transition-all duration-300 animate-scale-in">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 group-hover:bg-white dark:group-hover:bg-gray-700 transition-colors">
                                    {getFileIcon(resource.fileType)}
                                </div>
                                <button
                                    onClick={() => handleDelete(resource.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <h3 className="font-semibold text-gray-800 dark:text-white mb-2 line-clamp-1">
                                {resource.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 h-10">
                                {resource.description}
                            </p>

                            <div className="flex items-center gap-2 mb-4 text-xs">
                                {resource.client ? (
                                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                        <Users size={12} />
                                        {resource.client.fullName}
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                                        <Globe size={12} />
                                        All Clients
                                    </span>
                                )}
                                <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                    {resource.fileType}
                                </span>
                            </div>

                            <a
                                href={`http://localhost:8080${resource.fileUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-violet-50 hover:text-violet-600 dark:hover:bg-violet-900/20 dark:hover:text-violet-400 transition-all font-medium text-sm"
                            >
                                <ExternalLink size={16} />
                                View Resource
                            </a>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl animate-scale-in">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Share New Resource</h3>
                            <button
                                onClick={() => setShowForm(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Target Audience
                                </label>
                                <select
                                    value={formData.clientId}
                                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                >
                                    <option value="">All Clients</option>
                                    {clients.map((client) => (
                                        <option key={client.id} value={client.id}>{client.fullName}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                    required
                                    placeholder="e.g., Anxiety Management Guide"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
                                    rows="3"
                                    required
                                    placeholder="Brief description of the resource..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">File Type</label>
                                    <select
                                        value={formData.fileType}
                                        onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                    >
                                        <option>PDF</option>
                                        <option>VIDEO</option>
                                        <option>AUDIO</option>
                                        <option>ARTICLE</option>
                                        <option>OTHER</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">File</label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            required
                                        />
                                        <div className="w-full px-4 py-2 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 text-center text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                                            <UploadCloud size={16} />
                                            <span className="truncate">{formData.file ? formData.file.name : 'Choose file'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-violet-500/20 transition-all"
                                >
                                    Share Resource
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TherapistResources;
