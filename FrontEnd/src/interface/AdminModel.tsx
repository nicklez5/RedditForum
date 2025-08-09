import {Action, Thunk, Computed, action, thunk} from "easy-peasy"
import api from "../api/forums";

export interface UserSummary{
    id: string;
    username: string;
    email: string;
    banned: boolean;
    admin: boolean;
}
export interface SystemAlertDto{
    message : string
}
export interface AdminModel{
    users: UserSummary[];
    userIsAdmin: boolean,
    loading: boolean,
    error: string | null,

    setLoading: Action<AdminModel, boolean>,
    setError: Action<AdminModel, string | null>,
    setUsers: Action<AdminModel,UserSummary[]>,
    setUserIsAdmin: Action<AdminModel, boolean>,

    fetchAllUsers: Thunk <AdminModel>,
    isUserAdmin: Thunk<AdminModel, string>,
    SendSystemAlert: Thunk<AdminModel, SystemAlertDto>,
    UnbanUser: Thunk<AdminModel, string>,
    banUser: Thunk<AdminModel, string>,
    UnAdmin: Thunk<AdminModel, string>,
    makeAdmin: Thunk<AdminModel,string>
}

export const adminModel: AdminModel = {
    users: [],
    loading: false,
    error: null,
    userIsAdmin: false,
    
    setUserIsAdmin: action((state, admin_bool) => {
        state.userIsAdmin = admin_bool
    }),
    setLoading: action((state, loading) => {
        state.loading = loading
    }),
    setError: action((state, error) => {
        state.error = error
    }),
    setUsers: action((state, users) => {
        state.users = users
    }),
    fetchAllUsers: thunk(async(actions) => {
        actions.setLoading(true);
        try{
            const response = await api.get<UserSummary[]>("/api/admin");
            actions.setUsers(response.data);
            actions.setError(null);
        }catch(error : any){
            console.error("Error fetching all users: " , error.message);
            actions.setError(error.message);
        }finally{
            actions.setLoading(false)
        }
    }),
    isUserAdmin: thunk(async(actions, email) => {
        actions.setLoading(true);
        try{
            const response = await api.post<boolean>("/api/admin/isAdmin",
                {identifier: email}
            );
            actions.setUserIsAdmin(response.data);
            actions.setError(null);
        }catch(error : any){
            console.error("Error fetching if user is admin: " , error.message);
            actions.setError(error.message);
        }finally{
            actions.setLoading(false)
        }
    }),
    SendSystemAlert: thunk(async(actions, SystemAlertDto) => {
        actions.setLoading(true);
        try{
            const response = await api.post("/api/admin/alert",{
                Message: SystemAlertDto.message
            });

            actions.setError(null);
        }catch(error : any){
            console.error("Error sending system alert:", error.message);
            actions.setError(error.message);
        }finally{
            actions.setLoading(false);
        }
    }),
    UnbanUser: thunk(async(actions, username, {getState} ) => {
        actions.setLoading(true);
        try{
            const response = await api.post(`/api/admin/unban?username=${username}`);
            actions.setError(null);
            const updatedUsers = getState().users.map( user => user.username === username ? {...user, banned: false} : user);
            actions.setUsers(updatedUsers);
        }catch(error: any){
            console.error("Error unbanning user: ", error.message);
            actions.setError(error.message);
        }finally{
            actions.setLoading(false);
        }
    }),
    banUser: thunk(async(actions, username, {getState} ) => {
        actions.setLoading(true);
        try{
            const response = await api.post(`/api/admin/ban?username=${username}`);
            actions.setError(null);
            const updatedUsers = getState().users.map( user => user.username === username ? {...user, banned: true} : user);
            actions.setUsers(updatedUsers)
        }catch(error: any){
            console.error("Error banning user: ", error.message);
            actions.setError(error.message);
        }finally{
            actions.setLoading(false);
        }
    }),
    UnAdmin: thunk(async(actions, username, {getState}) => {
        actions.setLoading(true);
        try{
            const response = await api.post("/api/admin/unadmin", {
                username: username
            })
            actions.setError(null);
            const updatedUsers = getState().users.map(user => user.username === username ? {...user, admin: false} : user)
            actions.setUsers(updatedUsers);
        }catch(error : any){
            console.error("Failed to revoke admin privileges: ", error.message);
            actions.setError(error.message)
        }finally{
            actions.setLoading(false);
        }
    }),
    makeAdmin: thunk(async(actions, username, {getState}) => {
        actions.setLoading(true);
        try{
            const response = await api.post(`/api/admin/promote/?username=${username}`)
            actions.setError(null);
            const updatedUsers = getState().users.map(user => user.username === username ? {...user, admin: true} : user )
            actions.setUsers(updatedUsers);
        }catch(error : any){
            console.error("Failed to promote user admin privileges: ", error.message);
            actions.setError(error.message);
        }finally{
            actions.setLoading(false);
        }
    })

}