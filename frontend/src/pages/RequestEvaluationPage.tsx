import React, { useState } from 'react';

export function RequestEvaluationPage() {
    const [details, setDetails] = useState('');
    const [contactMethod, setContactMethod] = useState('email'); // email by default
    const [photo, setPhoto] = useState<File | null>(null);

    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPhoto(e.target.files[0]);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsError(false);
        setMessage('');

        // get the token from localStorage
        const token = localStorage.getItem('access_token');
        
        if (!token) {
            setIsError(true);
            setMessage('You must be logged in to make a request.');
            return;
        }

        // use 'FormData' to send files to be recieved on py backend
        const formData = new FormData();
        formData.append('details', details);
        formData.append('contact_method', contactMethod);
        if (photo) {
            formData.append('photo', photo);
        }

        try {
            // send the request
            const response = await fetch('http://localhost:5000/api/request-evaluation', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            setMessage(data.message);
            setDetails('');
            setContactMethod('email');
            setPhoto(null);
            (event.target as HTMLFormElement).reset();
        } catch (error: any) {
            setIsError(true);
            setMessage(error.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="p-8 bg-white rounded-lg shadow-md w-full max-w-lg"
            >
                <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">
                    Request an Evaluation
                </h2>

                <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                        Object Details
                    </label>
                    <textarea
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={5}
                        placeholder="Describe your antique object..."
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                        Preferred Contact Method
                    </label>
                    <select
                        value={contactMethod}
                        onChange={(e) => setContactMethod(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                    </select>
                </div>

                <div className="mb-6">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                        Upload Photo (Optional)
                    </label>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept="image/png, image/jpeg, image/gif"
                        className="w-full text-sm text-gray-500
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-lg file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        PNG, JPG, or GIF only. Max 16MB.
                    </p>
                </div>

                <button
                    type="submit"
                    className="w-full py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                    Submit Request
                </button>

                {message && (
                    <p className={`mt-4 text-sm text-center ${isError ? 'text-red-600' : 'text-green-600'}`}>
                        {message}
                    </p>
                )}
            </form>
        </div>
    );
}