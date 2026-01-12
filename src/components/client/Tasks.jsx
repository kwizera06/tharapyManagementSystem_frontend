import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { taskAPI } from '../../services/api';
import { CheckSquare, Square, Calendar, AlertCircle, Filter, CheckCircle2, Circle } from 'lucide-react';
import { format, isPast } from 'date-fns';

const Tasks = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, completed

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            const response = await taskAPI.getClientTasks(user.id);
            setTasks(response.data);
        } catch (error) {
            console.error('Failed to load tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleTask = async (taskId) => {
        try {
            await taskAPI.markCompleted(taskId);
            loadTasks();
        } catch (error) {
            console.error('Failed to update task:', error);
        }
    };

    const filteredTasks = tasks.filter(task => {
        if (filter === 'pending') return !task.completed;
        if (filter === 'completed') return task.completed;
        return true;
    });

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
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Tasks</h1>
                    <p className="text-slate-600 dark:text-slate-400">Track your progress and assignments</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    {['all', 'pending', 'completed'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${filter === f
                                    ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tasks List */}
            <div className="grid gap-4">
                {filteredTasks.length === 0 ? (
                    <div className="text-center py-16 glass-panel rounded-3xl">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckSquare className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                            {filter === 'completed' ? 'No completed tasks yet' : 'No tasks found'}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                            {filter === 'completed'
                                ? 'Complete tasks to see them here.'
                                : 'You are all caught up! Check back later for new assignments.'}
                        </p>
                    </div>
                ) : (
                    filteredTasks.map((task) => {
                        const isOverdue = !task.completed && isPast(new Date(task.dueDate));
                        return (
                            <div
                                key={task.id}
                                className={`glass-panel p-6 rounded-2xl transition-all group ${task.completed ? 'opacity-75 bg-slate-50/50 dark:bg-slate-800/30' : 'hover:border-primary-500/30'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <button
                                        onClick={() => !task.completed && handleToggleTask(task.id)}
                                        className={`mt-1 flex-shrink-0 transition-colors ${task.completed ? 'cursor-default' : 'cursor-pointer hover:scale-110 active:scale-95 transform transition-transform'
                                            }`}
                                        disabled={task.completed}
                                    >
                                        {task.completed ? (
                                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                        ) : (
                                            <Circle className="w-6 h-6 text-slate-400 group-hover:text-primary-500" />
                                        )}
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                                            <h3 className={`text-lg font-semibold truncate pr-4 ${task.completed ? 'text-slate-500 line-through decoration-slate-400' : 'text-slate-900 dark:text-white'
                                                }`}>
                                                {task.title}
                                            </h3>
                                            {isOverdue && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 whitespace-nowrap">
                                                    <AlertCircle className="w-3 h-3" />
                                                    Overdue
                                                </span>
                                            )}
                                        </div>

                                        <p className={`text-sm mb-4 ${task.completed ? 'text-slate-400' : 'text-slate-600 dark:text-slate-300'
                                            }`}>
                                            {task.instructions}
                                        </p>

                                        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                                            <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-600 dark:text-red-400' : ''
                                                }`}>
                                                <Calendar className="w-4 h-4" />
                                                <span>Due {format(new Date(task.dueDate), 'MMM dd, yyyy')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Tasks;
