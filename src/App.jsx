import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './Pages/Dashboard';
import Login from './Pages/Login';
import AgentDetailPage from './Pages/AgentDetailPage';
import NoInternet from './Pages/NoInternet'; // Create this file below
import '../src/index.css';

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return <NoInternet />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Dashboard />} />
      <Route path="/agent-details/:kaveriId" element={<AgentDetailPage />} />
    </Routes>
  );
}

export default App;
