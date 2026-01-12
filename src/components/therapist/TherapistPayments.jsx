import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { paymentAPI, userAPI } from '../../services/api';
import {
    DollarSign, Plus, Calendar, CheckCircle, Clock, XCircle,
    Search, Filter, ArrowUpRight, ArrowDownLeft, CreditCard,
    MoreVertical, Download, Wallet, TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';

const TherapistPayments = () => {
    const { user } = useAuth();
    const [payments, setPayments] = useState([]);
    const [clients, setClients] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
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
            // You might want to add a toast notification here
        } catch (error) {
            console.error('Failed to record payment:', error);
        }
    };

    const handleStatusUpdate = async (paymentId, newStatus) => {
        try {
            await paymentAPI.updateStatus(paymentId, newStatus);
            loadData();
        } catch (error) {
            console.error('Failed to update payment status:', error);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
            COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
            FAILED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle size={16} />;
            case 'PENDING': return <Clock size={16} />;
            case 'FAILED': return <XCircle size={16} />;
            default: return <Clock size={16} />;
        }
    };

    const totalRevenue = payments
        .filter(p => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const pendingAmount = payments
        .filter(p => p.status === 'PENDING')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const filteredPayments = payments.filter(payment => {
        const matchesSearch =
            payment.client?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'ALL' || payment.status === filterStatus;
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
                        Payments & Revenue
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">Track your earnings and manage transactions</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-violet-500/20 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                    <Plus size={20} />
                    <span>Record Payment</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Wallet size={80} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
                        <h3 className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
                            RWF {totalRevenue.toLocaleString()}
                        </h3>
                        <div className="flex items-center gap-1 text-emerald-500 text-sm mt-2">
                            <TrendingUp size={16} />
                            <span>+12.5% from last month</span>
                        </div>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Clock size={80} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Payments</p>
                        <h3 className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
                            RWF {pendingAmount.toLocaleString()}
                        </h3>
                        <div className="flex items-center gap-1 text-amber-500 text-sm mt-2">
                            <Clock size={16} />
                            <span>{payments.filter(p => p.status === 'PENDING').length} pending transactions</span>
                        </div>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CreditCard size={80} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Transactions</p>
                        <h3 className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
                            {payments.length}
                        </h3>
                        <div className="flex items-center gap-1 text-violet-500 text-sm mt-2">
                            <CheckCircle size={16} />
                            <span>{payments.filter(p => p.status === 'COMPLETED').length} successful</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by client or transaction ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    {['ALL', 'COMPLETED', 'PENDING', 'FAILED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${filterStatus === status
                                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            {status.charAt(0) + status.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Payments List */}
            <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredPayments.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>No payments found matching your criteria</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredPayments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${payment.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' :
                                                        payment.status === 'PENDING' ? 'bg-amber-100 text-amber-600' :
                                                            'bg-red-100 text-red-600'
                                                    }`}>
                                                    {payment.status === 'COMPLETED' ? <ArrowDownLeft size={18} /> : <Clock size={18} />}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {payment.transactionId || 'Manual Entry'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {payment.sessionId ? `Session #${payment.sessionId}` : 'Direct Payment'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 text-xs font-bold">
                                                    {payment.client?.fullName.charAt(0)}
                                                </div>
                                                <span className="text-gray-700 dark:text-gray-300">{payment.client?.fullName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {format(new Date(payment.paymentDate), 'MMM dd, yyyy')}
                                            <span className="block text-xs opacity-75">
                                                {format(new Date(payment.paymentDate), 'hh:mm a')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {payment.currency} {parseFloat(payment.amount).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                                                {getStatusIcon(payment.status)}
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            {payment.status === 'PENDING' && (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleStatusUpdate(payment.id, 'COMPLETED')}
                                                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                        title="Mark as Paid"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(payment.id, 'FAILED')}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Mark as Failed"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Record Payment Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl animate-scale-in">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Record Payment</h3>
                            <button
                                onClick={() => setShowForm(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Client</label>
                                <select
                                    value={formData.clientId}
                                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                    required
                                >
                                    <option value="">Select client</option>
                                    {clients.map((client) => (
                                        <option key={client.id} value={client.id}>{client.fullName}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Currency</label>
                                    <select
                                        value={formData.currency}
                                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                    >
                                        <option>RWF</option>
                                        <option>USD</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Transaction ID (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.transactionId}
                                    onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                    placeholder="e.g., TXN123456"
                                />
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
                                    Record Payment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TherapistPayments;
