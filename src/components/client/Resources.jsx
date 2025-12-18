import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { resourceAPI } from '../../services/api';
import { FileText, ExternalLink, Download } from 'lucide-react';

const Resources = () => {
    const { user } = useAuth();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadResources();
    }, []);

    const loadResources = async () => {
        try {
            const response = await resourceAPI.getClientResources(user.id);
            setResources(response.data);
        } catch (error) {
            console.error('Failed to load resources:', error);
        } finally {
            setLoading(false);
        }
    };

    const getFileTypeIcon = (fileType) => {
        return <FileText className="w-6 h-6 text-primary-600" />;
    };

    if (loading) {
        return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
                <p className="text-gray-600">Therapy materials shared by your therapist</p>
            </div>

            {resources.length === 0 ? (
                <div className="card text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No resources available yet</p>
                    <p className="text-sm text-gray-500 mt-2">Your therapist will share helpful materials here</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {resources.map((resource) => (
                        <div key={resource.id} className="card hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-3">
                                {getFileTypeIcon(resource.fileType)}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 truncate">{resource.title}</h3>
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{resource.description}</p>
                                    <div className="flex items-center gap-2 mt-3">
                                        <span className="text-xs px-2 py-1 bg-primary-50 text-primary-700 rounded">
                                            {resource.fileType}
                                        </span>
                                        {resource.client && (
                                            <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                                                Personal
                                            </span>
                                        )}
                                    </div>
                                    <a
                                        href={`http://localhost:8080${resource.fileUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 mt-3 text-sm text-primary-600 hover:text-primary-700"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Open Resource
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Resources;
