import { useEffect, useState } from 'react';

const getMessage = async () => {
  try {
    const res = await fetch('/api');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const message = await res.json();
    return message.message;
  } catch (error) {
    console.error('Error fetching message:', error);
    return 'Failed to fetch message';
  }
};

export default function Home() {
  const [msg, setMsg] = useState('');

  useEffect(() => {
    getMessage().then(setMsg);
  }, []);

  return (
    <div className="...">
      <main className="...">
        <h2>Message: {msg}</h2>
      </main>
    </div>
  );
}
