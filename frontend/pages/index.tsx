import router from 'next/router';
import { useEffect, useState } from 'react';

const getMessage = async () => {
  try {
    const res = await fetch('/api/v1');
    if (!res.ok) throw Error(`HTTP error! status: ${res.status}`);
    const message = await res.json();
    return message.message;
  } catch (error) {
    console.error('Error fetching message:', error);
    return 'Failed to fetch message';
  }
};

export default function Home() {
  const API_PORT = process.env.NEXT_PUBLIC_API_PORT || '8050';
  const API_BASE_URL = `http://localhost:${API_PORT}/api/v1`;
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    const url = `${API_BASE_URL}/sessions`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        router.push(`/list`);
      } else {
        const data = await res.json();
        console.error('Login failed:', data);
        setError(data?.error ?? 'Unknown error occurred');
      }
    } catch (err) {
      console.error('Network or unexpected error:', err);
      setError('Could not connect to server.');
    }
  };

  return (
    <main className="bg-stone-800">
      <div className="flex items-center justify-center min-h-screen bg-stone-800">
        <div className="w-full max-w-md px-4">
          <div className="bg-stone-400 shadow-lg rounded-lg p-6">
            <h3 className="text-red-500 text-sm mb-4">{error}</h3>
            <h3 className="text-center text-2xl font-semibold mb-6">Login</h3>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition"
                >
                  Login
                </button>
              </div>
            </form>
            <div>
              <button
                type="button"
                onClick={(e) => {
                  window.location.href = '/register';
                }}
                className="w-full bg-gray-600 text-white py-2 px-4 my-4 rounded-md hover:bg-gray-700 transition"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
