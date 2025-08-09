import {Action, Thunk, Computed, action,thunk} from "easy-peasy"
import { Post, PostModel } from "./PostModel"
import { RefreshToken } from "./RefreshToken"
import { Thread, ThreadModel } from "./ThreadModel"
import { Notifications,NotificationModel } from "./Notification"
import { ProfileModel, Profile, EditProfileDto } from "./ProfileModel"
import api from "../api/forums"
import { StoreModel } from "./StoreModel"
import { Message } from "./MessageModel"
import { AccessExpression } from "typescript"
import { Forum } from "./ForumModel"

type ActivityPayload = {
    posts: Post[],
    threads: Thread[],
    forums: Forum[],
    totalPostLikeCount: Number | undefined,
    totalThreadLikeCount: Number | undefined,
    totalSubscribedForumCount: Number | undefined
}
export interface LoginDto{
    username: string,
    password: string,
}
export interface RegisterDto{
    username: string,
    email: string,
    firstName: string,
    lastName: string,
    password: string,
    confirmPassword: string
}
export interface UserModel2{
    username : string
}
export interface UserModel{
    Id: string,
    message: string,
    token: string | null,
    refreshToken: string | null,
    loggedIn: boolean,
    loading: boolean,
    error: string | null,
    Profile: Profile | null,
    Posts: Post[],
    Activity: ActivityPayload,
    Threads: Thread[],
    Notifications: Notifications[],
    RefreshTokens: RefreshToken[],
    Messages: Message[],
    logout: Action<UserModel>,

    setLoggedIn: Action<UserModel, boolean>,
    setProfile: Action<UserModel, Profile>,
    setId: Action<UserModel, string>,
    setMessage: Action<UserModel, string>,
    setToken: Action<UserModel, string | null>,
    setRefreshToken: Action<UserModel, string | null>,
    setLoading: Action<UserModel, boolean>,
    setError: Action<UserModel, string| null>,
    setActivity: Action<UserModel, ActivityPayload>,
    setPosts: Action<UserModel, Post[]>,
    setThreads: Action<UserModel, Thread[]>,
    setNotifications: Action<UserModel, Notifications[]>,
    setMessages: Action<UserModel, Message[]>,
    fetchProfile: Thunk<UserModel, void ,void, Profile>,
    fetchMessages: Thunk<UserModel, void ,void, Message[]>,
    fetchNotifications: Thunk<UserModel, void, void, Notifications[]>,
    updateProfile: Thunk<UserModel, EditProfileDto>,
    changePassword: Thunk<UserModel, {currentPassword: string, newPassword: string}>;
    changeUsername: Thunk<UserModel, string>,
    changeEmail: Thunk<UserModel, string>,
    fetchActivity: Thunk<UserModel,void,void, ActivityPayload>;
    forgotPassword: Thunk<UserModel, {username: string, clientUrl: string}>;
    login: Thunk<UserModel, LoginDto, void, StoreModel>;
    register: Thunk<UserModel, RegisterDto>;
    GetRefreshToken: Thunk<UserModel, {token: string}, string>
}
export const userModel: UserModel = {
    Id: "",
    message: "",
    token: "",
    loggedIn: false,
    refreshToken: "",
    loading: false,
    error: "",
    Profile: null,
    Posts: [],
    Threads: [],
    Activity: {
        posts: [],
        forums: [],
        threads: [],
        totalPostLikeCount: undefined,
        totalThreadLikeCount: undefined,
        totalSubscribedForumCount: undefined
    },
    Notifications: [],
    RefreshTokens: [],
    Messages: [],
    logout: action((state) => {
        localStorage.removeItem('token')
        localStorage.clear()
        state.token = null
        state.loggedIn = false
        state.refreshToken = null
        state.Id = ""
        state.message = ""
        state.error = null
        state.loading = false
        state.Profile = null
        state.Posts = []
        state.Threads = []
        state.Notifications = []
    }),
    setLoggedIn: action((state, loggedIn) => {
        state.loggedIn = loggedIn
    }),
    setPosts: action((state, posts) => {
        state.Posts = posts
    }),
    setThreads: action((state, threads) => {
        state.Threads = threads
    }),
    setProfile: action((state, profile) => {
        state.Profile = profile
    }),
    setActivity: action((state, activity) => {
        state.Activity = activity
    }),
    setId: action((state, id) => {
        localStorage.setItem("user_id", id)
        state.Id = id
    }),
    setMessage: action((state, message) => {
        state.message = message
    }),
    setToken: action((state, token) => {
        state.token = token
    }),
    setRefreshToken: action((state, token) => {
        state.refreshToken = token
    }),
    setLoading: action((state, loading) => {
        state.loading = loading
    }),
    setError: action((state, error) => {
        state.error = error
    }),
    setNotifications: action((state, notification) => {
        state.Notifications = notification
    }),
    setMessages: action((state, messages) => {
        state.Messages = messages
    }),
    fetchMessages: thunk(async (actions) => {
        actions.setLoading(true)
        try {
            const response = await api.get<Message[]>("/api/message/all")
            actions.setMessages(response.data)
            actions.setError(null)
        } catch (error: any) {
            console.error("Error fetching messages. ", error.message)
            actions.setError(error.message)
        } finally {
            actions.setLoading(false)
        }
    }),
    fetchNotifications: thunk(async (actions) => {
        actions.setLoading(true)
        try {
            const response = await api.get<Notifications[]>("/api/notification")
            actions.setNotifications(response.data)
            actions.setError(null)
        } catch (error: any) {
            console.error("Error fetching notifications: ", error.message)
            actions.setError(error.message)
        } finally {
            actions.setLoading(false)
        }
    }),

    fetchProfile: thunk(async (actions) => {
        actions.setLoading(true)
        try {
            const response = await api.get<Profile>("/api/profile/me")
            actions.setProfile(response.data)
            actions.setId(response.data.id)
            actions.setError(null)
        } catch (error) {
            console.error("Failed to fetch profile", error)
            actions.setError("Failed to fetch profile")
        } finally {
            actions.setLoading(false)
        }
    }),
    updateProfile: thunk(async (actions, EditProfile) => {
        actions.setLoading(true)
        try {
            const response = await api.put("/api/profile/update", {
                firstName: EditProfile.firstName,
                lastName: EditProfile.lastName,
                bio: EditProfile.bio,
                profileImageUrl: EditProfile.profileImageUrl
            })
            await actions.fetchProfile()
            actions.setMessage(response.data)
            actions.setError(null)
        } catch (error: any) {
            console.error("Failed to update profile:", error)
            actions.setError(
                error.response?.data?.message || "Failed to update profile."
            )
        } finally {
            actions.setLoading(false)
        }
    }),
    changePassword: thunk(async (actions, { currentPassword, newPassword }) => {
        actions.setLoading(true)
        try {
            const response = await api.post("/api/account/change-password", { currentPassword: currentPassword, newPassword: newPassword })
            actions.setMessage(response.data)
            actions.setError(null)
            return {success: true};
        } catch (error: any) {
            console.error("Failed to change password:", error)
            actions.setError(
                error.response?.data?.message || "Failed to change password."
            )
            return {success: false}
        } finally {
            actions.setLoading(false)
        }
    }),
    changeUsername: thunk(async(actions, username) => {
        actions.setLoading(true);
        try{
            var user_id = localStorage.getItem("user_id")
            const response = await api.post(`/api/account/change-username/${user_id}`,{
                newUsername: username
            })
            actions.setMessage(response.data)
            actions.setError(null)
            return {success: true}
        }catch(error: any){
            actions.setError(error.message)
            return {success: false}
        }finally{
            actions.setLoading(false);
        }
    }),
    changeEmail: thunk(async(actions, email) => {
        actions.setLoading(true);
        try{
            var user_id = localStorage.getItem("user_id")
            const response = await api.post(`/api/account/change-email/${user_id}`,{
                newEmail: email
            })
            actions.setMessage(response.data)
            actions.setError(null)
             return {success: true}
        }catch(error: any){
            actions.setError(error.message)
            return {success: false}
        }finally{
            actions.setLoading(false);
        }
    }),
    fetchActivity: thunk(async (actions) => {
        actions.setLoading(true)
        try {
            var user_id = localStorage.getItem("user_id")
            const response = await api.get<ActivityPayload>(`/api/account/activity/${user_id}`)
            const data = response.data
            actions.setActivity(data);
            actions.setError(null)
        } catch (error: any) {
            console.error("Failed to fetch activity", error)
            actions.setError(error.message)
        } finally {
            actions.setLoading(false)
        }
    }),
    forgotPassword: thunk(async (actions, { username, clientUrl }) => {
        actions.setLoading(true)
        try {
            const response = await api.post('/api/auth/forgot-password',
                {
                    username: username,
                    clientUrl: clientUrl //deploy url
                }
            )
            actions.setMessage(response.data)
            actions.setError(null)
        } catch (error: any) {
            console.error("Failed to reset password", error)
            actions.setError(error.message)
        } finally {
            actions.setLoading(false)
        }
    }),
    register: thunk(async (actions, RegisterDto) => {
        actions.setLoading(true)
        try {
            const response = await api.post('/api/auth/register', {
                username: RegisterDto.username,
                email: RegisterDto.email,
                firstName: RegisterDto.firstName,
                lastName: RegisterDto.lastName,
                password: RegisterDto.password,
                confirmPassword: RegisterDto.confirmPassword
            })
            actions.setError(null)
        } catch (error: any) {
            actions.setError(error.message)
        } finally {
            actions.setLoading(false)
        }
    }),
    login: thunk(async (actions, LoginDto, helpers) => {
        actions.setLoading(true)
        try {
            const response = await api.post('/api/auth/login',
                {
                    identifier: LoginDto.username,
                    password: LoginDto.password
                }
            )
            const data = response.data
            actions.setToken(data.accessToken)
            actions.setRefreshToken(data.refreshToken)
            localStorage.setItem("access_token", data.accessToken)
            localStorage.setItem("refresh_token", data.refreshToken)
            await helpers.getStoreActions().user.setLoggedIn(true)
            await helpers.getStoreActions().user.fetchProfile()
            await helpers.getStoreActions().admin.isUserAdmin(LoginDto.username)
            await helpers.getStoreActions().user.fetchActivity()
            await helpers.getStoreActions().user.fetchNotifications()
            await helpers.getStoreActions().user.fetchMessages()
            actions.setError(null)
        } catch (error: any) {
            console.error("Failed to login", error)
            actions.setError(error.message)
        } finally {
            actions.setLoading(false)
        }
    }),
    GetRefreshToken: thunk(async (actions) => {
        actions.setLoading(true)
        try {
            const response = await api.post('/api/auth/refresh-token', {
                token: localStorage.getItem("refresh_token")
            })
            const data = response.data
            actions.setToken(data.accessToken)
            actions.setRefreshToken(data.refreshToken)
            localStorage.setItem("access_token", data.accessToken)
            localStorage.setItem("refresh_token", data.refreshToken)
            actions.setError(null)
        } catch (error: any) {
            console.error("Failed to get refresh token", error)
            actions.setError(error.message)
        } finally {
            actions.setLoading(false)
        }
    }),

}