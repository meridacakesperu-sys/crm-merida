import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'

function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  return (
    <>
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <Dashboard currentView={currentView} />
    </>
  )
}

export default App
