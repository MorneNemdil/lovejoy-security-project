import { useState } from "react";

type PasswordStrength = 'Weak' | 'Medium' | 'Strong' | '';

export function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [pwStrength, setPwStrength] = useState<PasswordStrength>('');
    const [apiMessage, setApiMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const checkPasswordStrength = (pw: string): PasswordStrength => {
        let score = 0;
        if (pw.length > 8) score++;
        if (/[A-Z]/.test(pw)) score++; // uppercase
        if (/[a-z]/.test(pw)) score++; // lowercase
        if (/[0-9]/.test(pw)) score++; // number
        if (/[^A-Za-z0-9]/.test(pw)) score++; // symbol

        if (score < 3) return 'Weak';
        if (score < 5) return 'Medium';
        return 'Strong';
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        if (newPassword.length > 0) {
            setPwStrength(checkPasswordStrength(newPassword));
        } else {
            setPwStrength('');
        }
    };

    const getStrengthColor = () => {
        switch (pwStrength) {
            case 'Weak': return 'text-red-500';
            case 'Medium': return 'text-yellow-500';
            case 'Strong': return 'text-green-500';
            default: return 'text-gray-500';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsError(false);
        setApiMessage('');

        try {
            const response = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    phone: phone,
                    password: password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong ...');
            }

            setApiMessage(data.message);
            setName('');
            setEmail('');
            setPhone('');
            setPassword('');
        } catch (error: any) {
            setIsError(true);
            setApiMessage(error.message);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="p-8 bg-white rounded-lg shadow-md w-96">
                <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">
                    Register for Lovejoy's
                </h2>

                <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium text-gray-700">Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium text-gray-700">Phone</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required
                    />
                </div>

                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        {pwStrength && (
                            <span className={`text-sm ${getStrengthColor()}`}>
                                {pwStrength}
                            </span>
                        )}
                    </div>
                    <input
                        type="password"
                        value={password}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div className="relative w-full group">
                    <button
                        type="submit"
                        disabled={pwStrength !== 'Strong'}
                        className="w-full py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                       disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Register
                    </button>

                    {/* tooltip */}
                    {pwStrength !== 'Strong' && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 
                            w-max max-w-xs bg-gray-800 text-white text-sm rounded-md 
                            opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            Password must be 'Strong' to register.
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0
                              border-x-4 border-x-transparent border-t-4 border-t-gray-800" />
                        </div>
                    )}
                </div>
                {apiMessage && (
                    <p className={`mt-4 text-sm text-center ${isError ? 'text-red-600' : 'text-green-600'}`}>
                        {apiMessage}
                    </p>
                )}
            </form>
        </div>
    );
}

export default RegisterPage