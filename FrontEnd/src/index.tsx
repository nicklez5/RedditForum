import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider,useStoreRehydrated} from 'easy-peasy';
import store from './interface/StoreModel';
import LoginPage from './components/Login';
import Home from './components/Home';
import SearchPage from './components/Search';
import ThreadPage from './components/Thread';
import NewThread from './components/NewThread';
import Notifications from './components/Notifications';
import PostRedirect from './components/PostRedirect';
import MessageConvo from './components/Message';
import ChatPage from './components/ChatPage';
import ProfilePage from './components/Profile';
import NewForum from './components/NewForum';
import ForumPage from './components/ForumPage';
import SignupPage from './components/SignupPage';
import AdminDashboard from './components/AdminDashboard';
import AdminSystemAlert from './components/AdminSystemAlerts';
import AdminUsers from './components/AdminUsers';
import AdminForums from './components/AdminForums';
import AdminThreads from './components/AdminThreads';
import AdminPosts from './components/AdminPosts';
import UserDashboard from './components/UserDashboard';
import UserPosts from './components/UserPosts';
import UserForums from './components/UserForums';
import UserThreads from './components/UserThreads';
import Achievements from './components/Achievements';
import ForumList from './components/ForumList';
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
        <Route index element={<LoginPage/>}/>
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="admin/systemalerts" element={<AdminSystemAlert />}/>
        <Route path="admin/users" element={<AdminUsers />}/>
        <Route path="admin/forums" element={<AdminForums />}/>
        <Route path="admin/threads" element={<AdminThreads/>}/>
        <Route path="admin/posts" element={<AdminPosts />} />
        <Route path="user" element={<UserDashboard/>}/>
        <Route path="forums" element={<ForumList />}/>
        <Route path="user/posts" element={<UserPosts/>}/>
        <Route path="user/threads" element={<UserThreads />}/>
        <Route path="user/forums" element={<UserForums/>}/>
        <Route path="register" element={<SignupPage />} />
        <Route path="home" element={<Home SortBy='new'/>} />
        <Route path="popular" element={<Home SortBy='hot'/>}/>
        <Route path="explore" element={<Home SortBy='random'/>}/>
        <Route path="settings" element={<Settings />}/>
        <Route path="search" element={<SearchPage/>}/>
        <Route path="threads/:id" element={<ThreadPage/>}/>
        <Route path="postThread/:id" element={<NewThread/>}/>
        <Route path="postThread" element={<NewThread />}/>
        <Route path="posts/:id" element={<PostRedirect/>}/>
        <Route path="forum/:id" element={<ForumPage/>}/>
        <Route path="notifications" element={<Notifications />}/>
        <Route path="postForum" element={<NewForum />} />
        <Route path="messages" element={<ChatPage />}/>
        <Route path="messages/:id" element={<MessageConvo/>}/>
        <Route path="profile/:id" element={<ProfilePage EditMode={false}/>}/>
        <Route path="avatar/:id" element={<ProfilePage EditMode={true} />}/>
        <Route path="achievements" element={<Achievements/>}/>
        <Route path="forgotPassword" element={<ForgotPassword/>}/>
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
      <AppWrapper />
    </StoreProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

