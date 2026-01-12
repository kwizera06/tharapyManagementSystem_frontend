import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { sessionAPI } from '../../services/api';
import { FileText, Calendar, TrendingUp, Clock, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

const Sessions = () => {
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        try {
            const response = await sessionAPI.getClientSessions(user.id);
            setSessions(response.data);
        } catch (error) {
            console.error('Failed to load sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Session History</h1>
                    <p className="text-slate-600 dark:text-slate-400">Review your therapy session notes and progress</p>
                </div>
            </div>

            <div className="grid gap-6">
                {sessions.length === 0 ? (
                    <div className="text-center py-16 glass-panel rounded-3xl">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No session notes yet</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                            Session notes will appear here after your appointments are completed.
                        </p>
                    </div>
                ) : (
                    sessions.map((session) => (
                        <div key={session.id} className="glass-panel p-6 rounded-2xl hover:border-primary-500/30 transition-all group">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform duration-300">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                                        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4" />
                                                <span className="font-medium text-slate-900 dark:text-white">
                                                    {format(new Date(session.createdAt), 'MMMM dd, yyyy')}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-4 h-4" />
                                                <span>{format(new Date(session.createdAt), 'hh:mm a')}</span>
                                            </div>
                                        </div>

                                        {session.progressScore && (
                                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-full border border-emerald-100 dark:border-emerald-900/30">
                                                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                                                    Progress: {session.progressScore}/10
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                                                Summary
                                            </h4>
                                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                                {session.summary}
                                            </p>
                                        </div>

                                        {session.notes && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                                    Notes
                                                </h4>
                                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                                    {session.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Sessions;
