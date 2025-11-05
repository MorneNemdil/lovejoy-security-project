import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// We can re-use our strength checker from Register.tsx
// You could move this to a shared 'utils.ts' file
const checkPasswordStrength = (pw: string) => {
  let score = 0;
  if (pw.length > 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score < 3) return 'Weak';
  if (score < 5) return 'Medium';
  return 'Strong';
};

export function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [strength, setStrength] = useState<'Weak' | 'Medium' | 'Strong' | ''>('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pw = e.target.value;
    setNewPassword(pw);
    setStrength(pw ? checkPasswordStrength(pw) : '');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsError(false);
    
    try {
      const response = await fetch('http://localhost:5000/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: newPassword }),
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setMessage(data.message);
      // on success, go to login page after 2 secs
      setTimeout(() => navigate('/login'), 2000);

    } catch (error: any) {
      setIsError(true);
      setMessage(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form 
        onSubmit={handleSubmit} 
        className="p-8 bg-white rounded-lg shadow-md w-96"
      >
        <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">
          Reset Your Password
        </h2>

        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-700">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={handlePasswordChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {strength && (
            <span className={`text-sm ${
              strength === 'Weak' ? 'text-red-500' :
              strength === 'Medium' ? 'text-yellow-500' : 'text-green-500'
            }`}>
              {strength}
            </span>
          )}
        </div>

        <button 
          type="submit" 
          disabled={strength !== 'Strong'}
          className="w-full py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none disabled:bg-gray-400"
        >
          Reset Password
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