import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Login from './components/Login'

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('crm_token');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) return <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>Cargando...</div>;

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />
  }

  return (
    <>
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} onLogout={() => {
        localStorage.removeItem('crm_token');
        localStorage.removeItem('crm_username');
        setIsAuthenticated(false);
      }} />
      <Dashboard currentView={currentView} />
    </>
  )
}

export default App
