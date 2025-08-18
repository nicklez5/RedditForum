import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { useStoreRehydrated } from 'easy-peasy';
import {BrowserRouter, Routes, Route, Outlet} from "react-router-dom";
import { StoreProvider } from 'easy-peasy';
import store from './interface/StoreModel';
import Login from './components/Login';
import Home from './components/Home';
import ForumPage from './components/ForumPage';
import ThreadPage from './components/ThreadPage';
import ChatPage from './components/ChatPage';
import Notifications from './components/Notifications';
import ProfilePage from './components/ProfilePage';
import Achievements from './components/Achievements';
import NewProfilePage from './components/Profile';
import Settings from './components/Settings';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
const AppWrapper = () => {
  const rehydrated = useStoreRehydrated();
  if(!rehydrated) return <div>Loading...</div>
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App/>}>
          <Route index element={<Home/>}/>
          <Route path="login" element={<Login/>}/>
          <Route path="forum/:id" element={<ForumPage/>}/>
          <Route path="threads/:id" element={<ThreadPage/>}/>
          <Route path="messages" element={<ChatPage/>}/>
          <Route path="notifications" element={<Notifications/>}/>
          <Route path="profile/:id" element={<NewProfilePage/>}/>
          <Route path="achievements" element={<Achievements/>}/>
          <Route path="avatar/:id" element={<ProfilePage EditMode={true}/>}/>
          <Route path="settings" element={<Settings/>}/>
          <Route path="forgotpassword" element={<ForgotPassword/>}/>
          <Route path="reset-password" element={<ResetPassword/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <StoreProvider store={store}>
        <AppWrapper/>
    </StoreProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
