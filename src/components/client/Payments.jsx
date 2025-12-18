import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { paymentAPI } from '../../services/api';
import { DollarSign, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const Payments = () => {
    const { user } = useAuth();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPayments();
    }, []);

    const loadPayments = async () => {
        try {
            const response = await paymentAPI.getClientPayments(user.id);
            setPayments(response.data);
        } catch (error) {
            console.error('Failed to load payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            COMPLETED: 'bg-green-100 text-green-800',
            FAILED: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status) => {
        if (status === 'COMPLETED') return <CheckCircle className="w-4 h-4" />;
        if (status === 'PENDING') return <Clock className="w-4 h-4" />;
        return <XCircle className="w-4 h-4" />;
    };

    const totalPaid = payments
        .filter(p => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    if (loading) {
        return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
                <p className="text-gray-600">Track your therapy session payments</p>
            </div>

            {/* Summary Card */}
            <div className="card mb-6 bg-gradient-to-r from-primary-50 to-primary-100">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Total Paid</p>
                        <p className="text-2xl font-bold text-gray-900">RWF{totalPaid.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            {/* Payments List */}
            {payments.length === 0 ? (
                <div className="card text-center py-12">
                    <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No payment records yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {payments.map((payment) => (
                        <div key={payment.id} className="card hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-semibold text-gray-900">
                                            RWF{parseFloat(payment.amount).toFixed(2)} {payment.currency}
                                        </h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(payment.status)}`}>
                                            {getStatusIcon(payment.status)}
                                            {payment.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {format(new Date(payment.paymentDate), 'MMM dd, yyyy')}
                                        </div>
                                        {payment.transactionId && (
                                            <span className="text-xs text-gray-500">
                                                ID: {payment.transactionId}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Payments;
