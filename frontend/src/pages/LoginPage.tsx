import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsError(false);
        setMessage('');

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            localStorage.setItem('access_token', data.access_token);

            setMessage('Login successful! Welcome.');
            // redirect the user to homepage here

        } catch (error: any) {
            setIsError(true);
            setMessage(error.message);
        }
    };

    return (
        <div className="flex items-center justify-center h-full bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="p-8 bg-white rounded-lg shadow-md w-96"
            >
                <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">
                    Login to Lovejoy's
                </h2>

                <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div className="mb-6">
                    <label className="block mb-2 text-sm font-medium text-gray-700">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <div className="text-right mt-2">
                        <Link to="/forgot-password"
                            className="text-sm text-blue-600 hover:underline">
                            Forgot Password?
                        </Link>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                    Login
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