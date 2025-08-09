import {Action, Thunk, Computed, action, thunk} from "easy-peasy"
import { Thread } from "./ThreadModel"
import { UserModel2 } from "./UserModel"
import api from "../api/forums"
import { Post } from "./PostModel"
export interface Forum{
    id: number,
    title: string,
    description: string,
    iconUrl: string,
    icon: File | null,
    bannerUrl: string,
    banner: File | null,
    createdAt : Date,
    author: string,
    authorIcon: string,
    threads: Thread[],
    users: UserModel2[],
}

export interface CreateForumDto{
    title: string,
    description: string | null,
    icon?: File | null,
    banner?: File | null,
}
export interface EditForumDto{
    id: string,
    title: string,
    description: string | null,
    icon?: File | null,
    removeIcon: boolean,
    banner? :File | null,
    removeBanner: boolean
}
export interface ForumSearchResult{
    threads: Thread[],
    posts: Post[]
}
export interface ForumModel{
    searchResults: ForumSearchResult
    forums : Forum[],
    selectedForum: Forum | null,
    error: string | null,
    message: string | null,
    loading: boolean,

    setError: Action<ForumModel, string | null>,
    setLoading: Action<ForumModel, boolean>,
    setMessage: Action<ForumModel, string | null>,
    setSelectedForum: Action<ForumModel, Forum>,
    setSearchResults: Action<ForumModel, ForumSearchResult>,
    SetForums: Action<ForumModel, Forum[]>,
    AddForum: Action<ForumModel, Forum>,
    RemoveForum: Action<ForumModel, Forum>,
    UpdateForum: Action<ForumModel, Forum>,
    CreateForum: Thunk<ForumModel, CreateForumDto>,
    EditForum: Thunk<ForumModel, EditForumDto>,
    DeleteForum: Thunk<ForumModel, number>,
    SearchForum: Thunk<ForumModel, string>,
    SubscribeForum: Thunk<ForumModel, number>,
    UnSubscribeForum: Thunk<ForumModel, number>,
    Subscribed: Thunk<ForumModel, number>,
    GetAllForums: Thunk<ForumModel>,
    GetForumById: Thunk<ForumModel, number>
}

export const forumModel: ForumModel = {
    searchResults: {
        threads: [],
        posts:[]
    },
    forums: [],
    selectedForum: null,
    message: "",
    error: "",
    loading: false,


    setSearchResults: action((state,payload) => {
        state.searchResults = payload
    }),
    setError: action((state, error) => {
        state.error = error
    }),

    setMessage: action((state, msg) => {
        state.message = msg
    }),
    setLoading: action((state, loading) => {
        state.loading = loading
    }),

    setSelectedForum: action((state, forum) => {
        state.selectedForum = forum
    }),

    SetForums: action((state, forums) => {
        state.forums = forums
    }),

    AddForum: action((state, forum) => {
        state.forums.push(forum)
    }),
    RemoveForum: action((state, forum) => {
        state.forums = state.forums.filter(f => f.id !== forum.id)
    }),
    UpdateForum: action((state,forum) => {
        const index = state.forums.findIndex(f => f.id === forum.id)
        if(index !== -1){
            state.forums[index] = forum;
        }
        if(state.selectedForum!.id == forum.id){
            state.selectedForum = forum;
        }
    }),
    CreateForum: thunk(async(actions,CreateForumDto) => {
        actions.setLoading(false);
        try{
            const formData = new FormData();
            formData.append("title", CreateForumDto.title)
            formData.append("description", CreateForumDto.description!)
            if(CreateForumDto.icon) formData.append("icon", CreateForumDto.icon);
            if(CreateForumDto.banner) formData.append("banner", CreateForumDto.banner);
            const response = await api.post("/api/forum", formData, {
                headers: {"Content-Type": "multipart/form-data"},
            })
            actions.AddForum(response.data)
            actions.setError(null)
        }catch(error : any){
            console.error("Error creating forum:",error.message);
            actions.setError(error.message)
        }finally{
            actions.setLoading(false);
        }
    }),
    EditForum: thunk(async(actions , EditForumDto, {getState}) => {
        actions.setLoading(false);
        try{
            const formData = new FormData();
            formData.append("title", EditForumDto.title)
            formData.append("description", EditForumDto.description!)
            formData.append("removeIcon", EditForumDto.removeIcon ? "true": "false")
            formData.append("removeBanner", EditForumDto.removeBanner ? "true" : "false")
            if(EditForumDto.icon) formData.append("icon",EditForumDto.icon);
            if(EditForumDto.banner) formData.append("banner", EditForumDto.banner);
            const response = await api.put(`/api/forum/${EditForumDto.id}`,formData,{
                headers: {"Content-Type": "multipart/form-data"}
            })
            if(response.status === 200){
                const updatedForum = response.data
                const existingForum = getState().forums.find(f => f.id === parseInt(EditForumDto.id))
                if(existingForum){
                    actions.UpdateForum({...existingForum, 
                        title: updatedForum.title, 
                        description: updatedForum.description,
                        iconUrl: updatedForum.iconUrl,
                        bannerUrl: updatedForum.bannerUrl, 
                        icon: updatedForum.icon ,
                        banner: updatedForum.banner ,
                    })
                }
            }else{
                console.error("Edit forum failed:", response.data)
            }
        }catch(error : any){
            console.error("Error editting forum:", error.message);
            actions.setError(error.message);
        }finally{
            actions.setLoading(false);
        }
    }),
    DeleteForum: thunk(async(actions, forum_id, {getState}) => {
        actions.setLoading(true);
        try{
            const response = await api.delete(`/api/forum/${forum_id}`);
            if(response.status === 200){
                const existingForum = getState().forums.find(f => f.id === forum_id);
                if(existingForum){
                    actions.RemoveForum(existingForum);
                }
            }else{
                console.error("Delete failed:", response.data);
            }
        }catch(error : any){
            console.error("Error deleting forum:", error.message);
            actions.setError(error.message);
        }finally{
            actions.setLoading(false);
        }
    }),
    GetAllForums: thunk(async(actions) => {
        actions.setLoading(true);
        try{
            const response = await api.get<Forum[]>("/api/forum", {allowAnonymous: true, suppressRedirect: true});
            actions.SetForums(response.data);
            actions.setError(null);
        }catch(error : any){
            console.error("Error fetching all forums: ", error.message);
            actions.setError(error.message)
        }finally{
            actions.setLoading(false)
        }
    }),
    GetForumById: thunk(async(actions, forum_id) => {
        actions.setLoading(true);
        try{
            const response = await api.get<Forum>(`/api/forum/${forum_id}`,{allowAnonymous: true , suppressRedirect: true});
            actions.setSelectedForum(response.data);
            actions.setError(null);
        }catch(error : any){
            console.error(`Error fetching forum id ${forum_id}`,error.message)
            actions.setError(error.message)
        }finally{
            actions.setLoading(false)
        }
    }),
    SearchForum: thunk(async(actions, query) => {
        actions.setLoading(true);
        try{
            const response = await api.get(`/api/forum/search?query=${encodeURIComponent(query)}`);
            actions.setSearchResults(response.data);
            actions.setError(null);
        }catch(error : any){
            console.error("Search failed: ", error.message)
            actions.setError(error.message)
        }finally{
            actions.setLoading(false)
        }
    }),
    SubscribeForum: thunk(async(actions , forum_id) => {
        actions.setLoading(true);
        try{
            const response = await api.post(`/api/forum/${forum_id}/subscribe`);
            if(response.status == 200){
                actions.setError(null);
            }
        }catch(error: any){
            console.error("Subscribe to forum failed: ", error.message)
            actions.setError(error.message)
        }finally{
            actions.setLoading(false)
        }
    }),
    UnSubscribeForum: thunk(async(actions, forum_id) => {
        actions.setLoading(true);
        try{
            const response = await api.post(`/api/forum/${forum_id}/unsubscribe`);
            if(response.status == 200){
                actions.setError(null);
            }
        }catch(error : any){
            console.error("Unsubscribe to forum failed: ", error.message)
            actions.setError(error.message)
        }finally{
            actions.setLoading(false);
        }
    }),
    Subscribed: thunk(async(actions,forum_id) => {
        actions.setLoading(true);
        try{
            const response = await api.get(`/api/forum/${forum_id}/subscribed`);
            const result = await response.data;
            actions.setError(null);
            return result;
            
        }catch(error : any){
            console.error("User is not subscribed to forum id: " , forum_id)
            actions.setError(error.message)
        }finally{
            actions.setLoading(false);
        }
    })

}