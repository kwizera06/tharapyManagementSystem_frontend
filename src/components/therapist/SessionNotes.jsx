import React, { useState, useEffect } from 'react';
import {
    Search, Plus, FileText, Calendar, User, Clock,
    Edit, Trash2, Save, X, CheckCircle, AlertCircle,
    ChevronRight, Filter, MoreVertical
} from 'lucide-react';
import { sessionAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const SessionNotes = () => {
    const { user } = useAuth();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [currentNote, setCurrentNote] = useState({
        sessionId: '',
        clientName: '',
        date: '',
        content: '',
        privateNotes: '',
        tags: []
    });
    const [isEditing, setIsEditing] = useState(false);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const response = await sessionAPI.getTherapistNotes(user.id);
            // Mock data if API returns empty for demonstration
            if (!response.data || response.data.length === 0) {
                setNotes([
                    {
                        id: 1,
                        clientName: "Sarah Johnson",
                        sessionId: "sess_001",
                        date: "2024-03-15",
                        time: "10:00 AM",
                        content: "Patient showed signs of improvement in anxiety management. Discussed coping mechanisms for work-related stress.",
                        privateNotes: "Monitor sleep patterns next session.",
                        tags: ["Anxiety", "CBT"],
                        lastModified: "2024-03-15T11:30:00"
                    },
                    {
                        id: 2,
                        clientName: "Michael Chen",
                        sessionId: "sess_002",
                        date: "2024-03-14",
                        time: "2:00 PM",
                        content: "Initial assessment completed. Patient expressed concerns about recent life changes.",
                        privateNotes: "Refer to psychiatrist for medication evaluation if symptoms persist.",
                        tags: ["Assessment", "Depression"],
                        lastModified: "2024-03-14T15:45:00"
                    }
                ]);
            } else {
                setNotes(response.data);
            }
        } catch (error) {
            console.error('Error fetching notes:', error);
            showNotification('error', 'Failed to load session notes');
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleSaveNote = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                // await sessionAPI.updateNote(currentNote.id, currentNote);
                setNotes(notes.map(n => n.id === currentNote.id ? { ...currentNote, lastModified: new Date().toISOString() } : n));
                showNotification('success', 'Note updated successfully');
            } else {
                // await sessionAPI.createNote(currentNote);
                setNotes([...notes, { ...currentNote, id: Date.now(), lastModified: new Date().toISOString() }]);
                showNotification('success', 'Note created successfully');
            }
            setShowModal(false);
            resetForm();
        } catch (error) {
            showNotification('error', 'Failed to save note');
        }
    };

    const handleDeleteNote = async (id) => {
        if (window.confirm('Are you sure you want to delete this note?')) {
            try {
                // await sessionAPI.deleteNote(id);
                setNotes(notes.filter(n => n.id !== id));
                showNotification('success', 'Note deleted successfully');
            } catch (error) {
                showNotification('error', 'Failed to delete note');
            }
        }
    };

    const resetForm = () => {
        setCurrentNote({
            sessionId: '',
            clientName: '',
            date: '',
            content: '',
            privateNotes: '',
            tags: []
        });
        setIsEditing(false);
    };

    const openEditModal = (note) => {
        setCurrentNote(note);
        setIsEditing(true);
        setShowModal(true);
    };

    const filteredNotes = notes.filter(note =>
        note.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                        Session Notes
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">Manage and organize your client session records</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-violet-500/20 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                    <Plus size={20} />
                    <span>New Note</span>
                </button>
            </div>

            {/* Notification */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg animate-fade-in ${notification.type === 'success'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-red-50 text-red-600 border border-red-100'
                    }`}>
                    {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <p className="font-medium">{notification.message}</p>
                </div>
            )}

            {/* Search and Filter */}
            <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search notes by client, content, or tags..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-colors">
                    <Filter size={20} />
                    <span>Filters</span>
                </button>
            </div>

            {/* Notes Grid */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredNotes.map((note) => (
                        <div key={note.id} className="glass-panel p-6 rounded-2xl hover:shadow-xl transition-all duration-300 group animate-scale-in">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 dark:text-white">{note.clientName}</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Calendar size={14} />
                                            <span>{note.date}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                            <Clock size={14} />
                                            <span>{note.time}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openEditModal(note)}
                                        className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteNote(note.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className="text-gray-600 dark:text-gray-300 line-clamp-3">{note.content}</p>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {note.tags?.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <FileText size={14} />
                                    Session ID: {note.sessionId}
                                </span>
                                <span>Last edited: {new Date(note.lastModified).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                                {isEditing ? 'Edit Session Note' : 'New Session Note'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveNote} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Client Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={currentNote.clientName}
                                        onChange={(e) => setCurrentNote({ ...currentNote, clientName: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                        placeholder="Enter client name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Session ID</label>
                                    <input
                                        type="text"
                                        value={currentNote.sessionId}
                                        onChange={(e) => setCurrentNote({ ...currentNote, sessionId: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={currentNote.date}
                                        onChange={(e) => setCurrentNote({ ...currentNote, date: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Time</label>
                                    <input
                                        type="time"
                                        required
                                        value={currentNote.time || ''}
                                        onChange={(e) => setCurrentNote({ ...currentNote, time: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Session Notes</label>
                                <textarea
                                    required
                                    rows="4"
                                    value={currentNote.content}
                                    onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
                                    placeholder="Enter detailed session notes..."
                                ></textarea>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Private Notes (Only visible to you)</label>
                                <textarea
                                    rows="2"
                                    value={currentNote.privateNotes}
                                    onChange={(e) => setCurrentNote({ ...currentNote, privateNotes: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-amber-50 dark:bg-amber-900/10 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
                                    placeholder="Private observations..."
                                ></textarea>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags (comma separated)</label>
                                <input
                                    type="text"
                                    value={currentNote.tags?.join(', ') || ''}
                                    onChange={(e) => setCurrentNote({ ...currentNote, tags: e.target.value.split(',').map(t => t.trim()) })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                    placeholder="e.g., Anxiety, CBT, Progress"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-violet-500/20 transition-all duration-300 transform hover:-translate-y-0.5"
                                >
                                    <Save size={20} />
                                    <span>Save Note</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SessionNotes;
