import React from 'react';
import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import { ThemeProvider, useTheme } from './components/ThemeContext';
function AppContent() {

  return(
    <div className="App">
      <Header/>
      <Outlet/>
    </div>
  )
}
export default function App(){
  return (
    <ThemeProvider>
      <AppContent/>
    </ThemeProvider>
  )
}


