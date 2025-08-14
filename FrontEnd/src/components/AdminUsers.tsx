import {useEffect , useState} from "react";
import {Table, Button} from 'react-bootstrap';
import AdminSidebar from "./AdminSidebar";
import api from "../api/forums";
import { useStoreActions, useStoreState } from "../interface/hooks";
import { useTheme } from "./ThemeContext";
import { useNavigate } from "react-router-dom";
const AdminUsers = () => {
    const navigate = useNavigate();
    const {darkMode} = useTheme();
    const users = useStoreState((s) => s.admin.users)
    const error = useStoreState((s) => s.admin.error);
    const fetchUsers = useStoreActions((a) => a.admin.fetchAllUsers);
    const {banUser, UnbanUser, makeAdmin, UnAdmin} = useStoreActions((a) => a.admin)
    useEffect(() => {
        fetchUsers();
    },[fetchUsers]);
    const fetchId = async(username: string) => {
        try{
        const { data} = await api.get(`/api/account/${username}`);
        navigate(`/activity/${data.id}`)
        }catch(err){
        console.error("Failed to resolve user:", err);
        }
  }
    const unAdmin = async(username : string) => {
        UnAdmin(username)
        alert(`This user with username: ${username} has been revoked admin privileges`);
    }
    const MakeAdmin = async(username : string) => {
        makeAdmin(username);
        alert(`This user with username: ${username} has been granted admin privlieges`)
        
    }
    const BanUser = async(username:string) => {
        banUser(username)
        alert(`This user with username: ${username} has been banned`)
        
    }
    const UnBanUser = async(username : string) => {
        UnbanUser(username)
        alert(`This user with username: ${username} has been unbanned`)
        
    }
    const bg = darkMode ? "#212529" : "#ffffff";
    const color = darkMode ? "white": "black";
    return (
        <div className={`p-3 ${error ? "border border-danger" : "border border-transparent"} d-flex `}
            style={{borderWidth: "2px", borderRadius: "6px"}}
        >
            <AdminSidebar active="users" />
            <div className="p-4 flex-grow-1">
                {error && (
                <div className="alert alert-danger py-2 my-2">
                    {error}
                </div>
                )}
                <h2>Manage Users</h2>
                <Table striped bordered hover className={darkMode ? "table-dark" : "table-light"}>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Admin</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td><button onClick={() => fetchId(user.username)} className="border-0 rounded-pill btn-outline-primary fw-bold shadow-sm" style={{backgroundColor: bg, color: color}}>{user.username}</button></td>
                                <td>{user.email}</td>
                                <td>{user.banned ? "Banned": "Active"}</td>
                                <td>{user.admin ? "Admin" : "User"}</td>
                                <td>
                                {user.banned ? <button onClick={() => UnBanUser(user.username)} className="border border-success p-2 bg-success text-white" >Unban</button> 
                                             : <button onClick={() => BanUser(user.username)} className="border border-black p-2 bg-danger text-white ">Ban User</button>}
                                {user.admin ? <button onClick={() => unAdmin(user.username)} className="border border-success p-2 bg-success text-white ms-1">UnAdmin</button>
                                            : <button onClick={() => MakeAdmin(user.username)} className="border border-black p-2 bg-danger text-white ms-1">Promote</button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
            
        </div>
    )
}
export default AdminUsers;