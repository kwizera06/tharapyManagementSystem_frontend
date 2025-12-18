import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { taskAPI } from '../../services/api';
import { CheckSquare, Square, Calendar, AlertCircle } from 'lucide-react';
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
        return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
                <p className="text-gray-600">Complete tasks assigned by your therapist</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    All ({tasks.length})
                </button>
                <button
                    onClick={() => setFilter('pending')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'pending'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Pending ({tasks.filter(t => !t.completed).length})
                </button>
                <button
                    onClick={() => setFilter('completed')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'completed'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Completed ({tasks.filter(t => t.completed).length})
                </button>
            </div>

            {/* Tasks List */}
            <div className="space-y-3">
                {filteredTasks.length === 0 ? (
                    <div className="card text-center py-12">
                        <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">
                            {filter === 'completed' ? 'No completed tasks yet' : 'No tasks assigned yet'}
                        </p>
                    </div>
                ) : (
                    filteredTasks.map((task) => {
                        const isOverdue = !task.completed && isPast(new Date(task.dueDate));
                        return (
                            <div
                                key={task.id}
                                className={`card hover:shadow-md transition-all ${task.completed ? 'opacity-75' : ''
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <button
                                        onClick={() => !task.completed && handleToggleTask(task.id)}
                                        className={`mt-1 flex-shrink-0 ${task.completed ? 'cursor-default' : 'cursor-pointer'
                                            }`}
                                        disabled={task.completed}
                                    >
                                        {task.completed ? (
                                            <CheckSquare className="w-6 h-6 text-green-600" />
                                        ) : (
                                            <Square className="w-6 h-6 text-gray-400 hover:text-primary-600" />
                                        )}
                                    </button>
                                    <div className="flex-1">
                                        <h3 className={`text-lg font-semibold mb-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                                            }`}>
                                            {task.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-2">{task.instructions}</p>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className={`flex items-center gap-2 ${isOverdue ? 'text-red-600' : 'text-gray-600'
                                                }`}>
                                                {isOverdue && <AlertCircle className="w-4 h-4" />}
                                                <Calendar className="w-4 h-4" />
                                                Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                                            </div>
                                            {isOverdue && (
                                                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                                                    Overdue
                                                </span>
                                            )}
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
