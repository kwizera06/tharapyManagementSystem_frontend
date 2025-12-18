import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { goalAPI } from '../../services/api';
import { Target, TrendingUp, Calendar } from 'lucide-react';
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
        return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Therapy Goals</h1>
                <p className="text-gray-600">Track your progress towards your therapy objectives</p>
            </div>

            <div className="space-y-4">
                {goals.length === 0 ? (
                    <div className="card text-center py-12">
                        <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No goals set yet</p>
                        <p className="text-sm text-gray-500 mt-2">
                            Your therapist will help you set goals during your sessions
                        </p>
                    </div>
                ) : (
                    goals.map((goal) => (
                        <div key={goal.id} className="card hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-lg ${goal.status === 'COMPLETED' ? 'bg-green-100' : 'bg-blue-100'
                                    }`}>
                                    <Target className={`w-6 h-6 ${goal.status === 'COMPLETED' ? 'text-green-600' : 'text-blue-600'
                                        }`} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {goal.description}
                                        </h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${goal.status === 'COMPLETED'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-blue-100 text-blue-800'
                                            }`}>
                                            {goal.status === 'COMPLETED' ? 'Completed' : 'In Progress'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            Started: {format(new Date(goal.startDate), 'MMM dd, yyyy')}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4" />
                                            Target: {format(new Date(goal.targetDate), 'MMM dd, yyyy')}
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

export default Goals;
