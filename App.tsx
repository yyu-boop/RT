
import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import { storageService } from './services/storageService';
import Navbar from './components/Navbar';
import HomeView from './views/HomeView';
import AuthView from './views/AuthView';
import PracticeView from './views/PracticeView';
import AnalysisView from './views/AnalysisView';
import AdminView from './views/AdminView';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('home');

  useEffect(() => {
    storageService.init();
    // Simple session persistence check
    const savedUser = localStorage.getItem('rt_session_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      // Auto redirect based on role if needed
    }
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('rt_session_user', JSON.stringify(user));
    if (user.role === UserRole.TRAINEE) setCurrentView('practice');
    else if (user.role === UserRole.EXPERT) setCurrentView('admin-images');
    else setCurrentView('admin-users');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('rt_session_user');
    setCurrentView('home');
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView onLoginClick={() => setCurrentView('auth')} />;
      case 'auth':
        return <AuthView onLoginSuccess={handleLoginSuccess} />;
      case 'practice':
        return currentUser ? <PracticeView user={currentUser} onUpdateUser={setCurrentUser} onNavigate={setCurrentView} /> : <HomeView onLoginClick={() => setCurrentView('auth')} />;
      case 'analysis':
        return currentUser ? <AnalysisView user={currentUser} /> : <HomeView onLoginClick={() => setCurrentView('auth')} />;
      case 'admin-users':
        return currentUser ? <AdminView initialMode="users" currentUser={currentUser} /> : <HomeView onLoginClick={() => setCurrentView('auth')} />;
      case 'admin-images':
        return currentUser ? <AdminView initialMode="images" currentUser={currentUser} /> : <HomeView onLoginClick={() => setCurrentView('auth')} />;
      default:
        return <HomeView onLoginClick={() => setCurrentView('auth')} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        user={currentUser} 
        onLogout={handleLogout} 
        onNavigate={setCurrentView} 
      />
      <main className="flex-grow">
        {renderView()}
      </main>
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>© 2024 射线数字评片训练系统. 专业・精准・高效.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
