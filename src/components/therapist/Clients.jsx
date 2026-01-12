import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentAPI, userAPI } from '../../services/api';
import { Users, Mail, Phone, Calendar, Search, ArrowRight, User } from 'lucide-react';

const Clients = () => {
    const { user } = useAuth();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            // Get all appointments for this therapist
            const appointmentsRes = await appointmentAPI.getTherapistAppointments(user.id);
            const appointments = appointmentsRes.data;

            // Extract unique client IDs
            const uniqueClientIds = [...new Set(appointments.map(apt => apt.clientId))];

            // Fetch full client details for each unique client
            const clientPromises = uniqueClientIds.map(clientId =>
                userAPI.getUserById(clientId)
            );
            const clientResponses = await Promise.all(clientPromises);
            const clientsData = clientResponses.map(res => res.data);

            // Add appointment count for each client
            const clientsWithStats = clientsData.map(client => ({
                ...client,
                appointmentCount: appointments.filter(apt => apt.clientId === client.id).length,
            }));

            setClients(clientsWithStats);
        } catch (error) {
            console.error('Failed to load clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredClients = clients.filter(client =>
        client.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Clients</h1>
                    <p className="text-slate-600 dark:text-slate-400">Manage your client relationships ({clients.length})</p>
                </div>
            </div>

            {/* Search */}
            <div className="glass-panel p-4 rounded-2xl flex items-center gap-3">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search clients by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder-slate-400 w-full"
                />
            </div>

            {filteredClients.length === 0 ? (
                <div className="text-center py-16 glass-panel rounded-3xl">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No clients found</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                        {searchTerm ? 'Try adjusting your search terms.' : 'Clients will appear here when they book appointments with you.'}
                    </p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClients.map((client) => (
                        <div key={client.id} className="glass-panel p-6 rounded-2xl hover:border-primary-500/30 transition-all group hover:-translate-y-1 duration-300">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 flex items-center justify-center flex-shrink-0 shadow-inner">
                                    <span className="text-primary-700 dark:text-primary-300 font-bold text-xl">
                                        {client.fullName?.charAt(0)}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                        {client.fullName}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                        Client ID: #{client.id.toString().slice(-4)}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                    <span className="truncate">{client.email}</span>
                                </div>
                                {client.phoneNumber && (
                                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        <span>{client.phoneNumber}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-sm text-primary-600 dark:text-primary-400 font-medium p-2 rounded-lg bg-primary-50 dark:bg-primary-900/10">
                                    <Calendar className="w-4 h-4" />
                                    <span>{client.appointmentCount} appointment{client.appointmentCount !== 1 ? 's' : ''}</span>
                                </div>
                            </div>

                            <button className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400 transition-all flex items-center justify-center gap-2 group-hover:border-primary-200 dark:group-hover:border-primary-800">
                                View Profile <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Clients;
