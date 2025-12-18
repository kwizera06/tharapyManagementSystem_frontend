import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { paymentAPI, userAPI, sessionAPI } from '../../services/api';
import { DollarSign, Plus, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const TherapistPayments = () => {
    const { user } = useAuth();
    const [payments, setPayments] = useState([]);
    const [clients, setClients] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        clientId: '',
        sessionId: '',
        amount: '',
        currency: 'USD',
        transactionId: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [paymentsRes, clientsRes] = await Promise.all([
                paymentAPI.getTherapistPayments(user.id),
                userAPI.getUsersByRole('CLIENT'),
            ]);
            setPayments(paymentsRes.data);
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
            await paymentAPI.create(
                formData.clientId,
                formData.sessionId || null,
                formData.amount,
                formData.currency,
                formData.transactionId || null
            );
            setShowForm(false);
            setFormData({ clientId: '', sessionId: '', amount: '', currency: 'RWF', transactionId: '' });
            loadData();
            alert('Payment recorded successfully');
        } catch (error) {
            alert('Failed to record payment');
        }
    };

    const handleStatusUpdate = async (paymentId, newStatus) => {
        try {
            await paymentAPI.updateStatus(paymentId, newStatus);
            loadData();
        } catch (error) {
            alert('Failed to update payment status');
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

    const totalRevenue = payments
        .filter(p => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    if (loading) {
        return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
                    <p className="text-gray-600">Track session payments</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Record Payment
                </button>
            </div>

            {/* Summary Card */}
            <div className="card mb-6 bg-gradient-to-r from-green-50 to-green-100">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">RWF{totalRevenue.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            {/* Create Form */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold mb-4">Record Payment</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
                                <select
                                    value={formData.clientId}
                                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                    className="input-field"
                                    required
                                >
                                    <option value="">Select client</option>
                                    {clients.map((client) => (
                                        <option key={client.id} value={client.id}>{client.fullName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                                <select
                                    value={formData.currency}
                                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                    className="input-field"
                                >
                                    <option>RWF</option>
                                    <option>USD</option>
                                    
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID (optional)</label>
                                <input
                                    type="text"
                                    value={formData.transactionId}
                                    onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                                    className="input-field"
                                    placeholder="e.g., TXN123456"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button type="submit" className="btn-primary flex-1">Record</button>
                                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Payments List */}
            {payments.length === 0 ? (
                <div className="card text-center py-12">
                    <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No payments recorded yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {payments.map((payment) => (
                        <div key={payment.id} className="card">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-semibold text-gray-900">
                                            ${parseFloat(payment.amount).toFixed(2)} {payment.currency}
                                        </h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                                            {payment.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span>{payment.client?.fullName || 'Unknown Client'}</span>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {format(new Date(payment.paymentDate), 'MMM dd, yyyy')}
                                        </div>
                                        {payment.transactionId && (
                                            <span className="text-xs">ID: {payment.transactionId}</span>
                                        )}
                                    </div>
                                </div>
                                {payment.status === 'PENDING' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleStatusUpdate(payment.id, 'COMPLETED')}
                                            className="px-3 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm"
                                        >
                                            Mark Paid
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(payment.id, 'FAILED')}
                                            className="px-3 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-sm"
                                        >
                                            Mark Failed
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TherapistPayments;
