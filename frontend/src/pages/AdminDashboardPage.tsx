import { useState, useEffect } from 'react';

interface EvaluationRequest {
    id: number;
    details: string;
    contact_method: string;
    photo_filename: string | null;
    user_email: string;
}

export function AdminDashboardPage() {
    const [requests, setRequests] = useState<EvaluationRequest[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRequests = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setError('No authorization token found.');
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/api/admin/requests', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to fetch requests.');
                }

                const data = await response.json();
                setRequests(data.requests);

            } catch (err: any) {
                setError(err.message);
            }
        };

        fetchRequests();
    }, []);

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">All Evaluation Requests</h2>

            {error && <p className="text-red-500 bg-red-100 p-4 rounded-lg">{error}</p>}

            <div className="space-y-4">
                {requests.length > 0 ? (
                    requests.map((req) => (
                        <div key={req.id} className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
                            <h3 className="text-xl font-semibold text-blue-700">Request #{req.id}</h3>
                            <p className="text-sm text-gray-500 mb-2">From: {req.user_email}</p>

                            <p className="text-gray-700 mb-4">{req.details}</p>

                            <div className="text-sm">
                                <p><strong>Contact Method:</strong> {req.contact_method}</p>
                                <p><strong>Photo:</strong> {req.photo_filename || 'No photo submitted'}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    !error && <p className="text-gray-500">No evaluation requests found.</p>
                )}
            </div>
        </div>
    );
}