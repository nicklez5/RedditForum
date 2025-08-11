import React, {useState} from 'react';
import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import "./App.css"
import { ThemeProvider } from './components/ThemeContext';
import { useTheme } from './components/ThemeContext';
import SystemAlertBanner from './components/SystemAlertBanner';
import GlobalAlert from './components/GlobalAlert';
function AppContent() {
  const {darkMode} = useTheme();
   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
   const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
   const bg = darkMode ? "#212529" : "#ffffff";
   const color = darkMode ? "white": "black";
  return (
    <div className="d-flex" style={{backgroundColor: bg, color}}>
      <div className="flex-grow-1">
      <Header/>
      <SystemAlertBanner/>
      <GlobalAlert/>
      <div className="app-body">
      <Sidebar open={isSidebarOpen} onClose={toggleSidebar} />
      <main style={{marginLeft: isSidebarOpen ? "170px": "50px", backgroundColor: bg}}>
        <Outlet />
      </main>
       </div>
      </div>
    </div>
  );
}

export default function App(){
  return (
    <ThemeProvider>
      <AppContent/>
    </ThemeProvider>
  )
};
