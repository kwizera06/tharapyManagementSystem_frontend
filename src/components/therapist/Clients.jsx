import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentAPI, userAPI } from '../../services/api';
import { Users, Mail, Phone, Calendar } from 'lucide-react';

const Clients = () => {
    const { user } = useAuth();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">My Clients</h1>
                <p className="text-gray-600">Clients who have appointments with you ({clients.length})</p>
            </div>

            {clients.length === 0 ? (
                <div className="card text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No clients yet</p>
                    <p className="text-sm text-gray-500 mt-2">Clients will appear here when they book appointments with you</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clients.map((client) => (
                        <div key={client.id} className="card hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-primary-700 font-semibold text-lg">
                                        {client.fullName?.charAt(0)}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {client.fullName}
                                    </h3>
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-600 flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            <span className="truncate">{client.email}</span>
                                        </p>
                                        {client.phoneNumber && (
                                            <p className="text-sm text-gray-600 flex items-center gap-2">
                                                <Phone className="w-4 h-4" />
                                                {client.phoneNumber}
                                            </p>
                                        )}
                                        <p className="text-sm text-primary-600 flex items-center gap-2 mt-2">
                                            <Calendar className="w-4 h-4" />
                                            {client.appointmentCount} appointment{client.appointmentCount !== 1 ? 's' : ''}
                                        </p>
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

export default Clients;
