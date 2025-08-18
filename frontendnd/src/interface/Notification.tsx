import { Thunk, Action, Computed, thunk, action} from "easy-peasy"
import api from "../api/forums"
export interface Notifications{
    id: number,
    recipient: string,
    sender: string,
    message: string,
    createdAt: Date,
    url: string,
    type: string,
    isRead: boolean
}
export interface NotificationModel{
    notifications: Notifications[],
    loading: boolean,
    error: string | null,
    selectedNotification: Notifications | null,

    setLoading: Action<NotificationModel, boolean>,
    setError: Action<NotificationModel, string | null>,
    setSelectedNotification: Action<NotificationModel, Notifications>,
    SetNotifications: Action<NotificationModel, Notifications[]>,
    AddNotification: Action<NotificationModel, Notifications>,
    RemoveNotification: Action<NotificationModel,Notifications>,
    UpdateNotification: Action<NotificationModel, Notifications>,
    GetAllNotifications: Thunk<NotificationModel>,
    GetNotificationById: Thunk<NotificationModel, number>,
    DeleteNotification: Thunk<NotificationModel, number>,
    MarkAsRead: Thunk<NotificationModel, number>,
}
export const notificationModel: NotificationModel = {
    notifications: [],
    selectedNotification: null,
    loading: false,
    error: "",

    setLoading: action((state, loading) => {
        state.loading = loading
    }),

    setError: action((state, error) => {
        state.error = error
    }),
    setSelectedNotification: action((state, notification) => {
        state.selectedNotification = notification
    }),
    SetNotifications: action((state, notifications) => {
        state.notifications = notifications
    }),
    AddNotification: action((state, notification) => {
        state.notifications.push(notification)
    }),

    RemoveNotification: action((state, notification) => {
        state.notifications = state.notifications.filter(n => n.id !== notification.id)
    }),
    UpdateNotification: action((state, notification) => {
        const index = state.notifications.findIndex(n => n.id === notification.id);
        if(index !== -1){
            state.notifications[index] = notification
        }
        if(state.selectedNotification?.id === notification.id){
            state.selectedNotification = notification;
        }
    }),
    GetAllNotifications: thunk(async(actions) => {
        actions.setLoading(true);
        try{
            const response = await api.get<Notifications[]>("/api/notification");
            actions.SetNotifications(response.data);
            actions.setError(null);
        }catch(error: any){
            console.error("Error fetching notifications:", error.message);
            actions.setError(error.message);
        }finally{
            actions.setLoading(false);
        }
    }),
    GetNotificationById: thunk(async(actions,id) => {
        actions.setLoading(true);
        try{
            const response = await api.get<Notifications>(`/api/notification/${id}`);
            actions.setSelectedNotification(response.data);
            actions.setError(null);
        }catch(error: any){
            console.error("Error getting notifications:", error.message);
            actions.setError(error.message);
        }finally{
            actions.setLoading(false);
        }
    }),
    DeleteNotification: thunk(async(actions,id, {getState}) => {
        actions.setLoading(true);
        try{
            const response = await api.delete(`/api/notification/${id}`);
            if(response.status === 200){
                const existingNotification = getState().notifications.find(n => n.id === id);
                if(existingNotification){
                    actions.RemoveNotification(existingNotification);
                }
            }else{
                console.error("Delete failed:", response.data);
            }
        }catch(error:any){
            console.error("Error deleting notification:", error.message);
            actions.setError(error.message);
        }finally{
            actions.setLoading(false)
        }
    }),
    MarkAsRead: thunk(async(actions,id, {getState}) => {
        actions.setLoading(true);
        try{
            const response = await api.patch(`/api/notification/${id}`);
            if(response.status === 200){
                const current = getState().notifications.find(n => n.id === id);
                if(current){
                    actions.UpdateNotification({...current, isRead: true});
                }
            }
        }catch(error: any){
            console.error("Failed to mark as read:", error.message);
            actions.setError(error.message);
        }finally{
            actions.setLoading(false);
        }
    })
}