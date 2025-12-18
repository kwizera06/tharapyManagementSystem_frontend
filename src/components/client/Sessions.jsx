import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { sessionAPI } from '../../services/api';
import { FileText, Calendar, TrendingUp } from 'lucide-react';
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
        return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Session History</h1>
                <p className="text-gray-600">Review your therapy session notes and progress</p>
            </div>

            <div className="space-y-4">
                {sessions.length === 0 ? (
                    <div className="card text-center py-12">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No session notes yet</p>
                        <p className="text-sm text-gray-500 mt-2">
                            Session notes will appear here after your appointments
                        </p>
                    </div>
                ) : (
                    sessions.map((session) => (
                        <div key={session.id} className="card hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-lg bg-primary-50">
                                    <FileText className="w-6 h-6 text-primary-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <Calendar className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm text-gray-600">
                                                    {format(new Date(session.createdAt), 'MMMM dd, yyyy')}
                                                </span>
                                            </div>
                                        </div>
                                        {session.progressScore && (
                                            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-lg">
                                                <TrendingUp className="w-4 h-4 text-green-600" />
                                                <span className="text-sm font-medium text-green-700">
                                                    Progress: {session.progressScore}/10
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-700 mb-1">Summary</h4>
                                            <p className="text-gray-600">{session.summary}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-700 mb-1">Notes</h4>
                                            <p className="text-gray-600">{session.notes}</p>
                                        </div>
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
