import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { goalAPI } from '../../services/api';
import { Target, TrendingUp, Calendar, CheckCircle2, CircleDashed, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

const Goals = () => {
    const { user } = useAuth();
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadGoals();
    }, []);

    const loadGoals = async () => {
        try {
            const response = await goalAPI.getClientGoals(user.id);
            setGoals(response.data);
        } catch (error) {
            console.error('Failed to load goals:', error);
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
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Therapy Goals</h1>
                    <p className="text-slate-600 dark:text-slate-400">Track your progress towards your therapy objectives</p>
                </div>
            </div>

            <div className="grid gap-6">
                {goals.length === 0 ? (
                    <div className="text-center py-16 glass-panel rounded-3xl">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Target className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No goals set yet</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                            Your therapist will help you set goals during your sessions to track your progress.
                        </p>
                    </div>
                ) : (
                    goals.map((goal) => (
                        <div key={goal.id} className="glass-panel p-6 rounded-2xl hover:border-primary-500/30 transition-all group">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl transition-colors duration-300 ${goal.status === 'COMPLETED'
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                                        : 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                    }`}>
                                    {goal.status === 'COMPLETED' ? (
                                        <CheckCircle2 className="w-6 h-6" />
                                    ) : (
                                        <Target className="w-6 h-6" />
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                            {goal.description}
                                        </h3>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${goal.status === 'COMPLETED'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-900/50'
                                                : 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900/50'
                                            }`}>
                                            {goal.status === 'COMPLETED' ? 'Completed' : 'In Progress'}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4" />
                                            <span>Started: {format(new Date(goal.startDate), 'MMM dd, yyyy')}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-primary-600 dark:text-primary-400">
                                            <ArrowRight className="w-4 h-4" />
                                            <span>Target: {format(new Date(goal.targetDate), 'MMM dd, yyyy')}</span>
                                        </div>
                                    </div>

                                    {/* Progress Bar (Visual Only for now as backend doesn't provide % yet) */}
                                    {goal.status !== 'COMPLETED' && (
                                        <div className="mt-4 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary-500 rounded-full w-1/3 animate-pulse"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Goals;
