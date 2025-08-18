import {Action, Thunk, Computed, action, thunk, Store} from "easy-peasy"
import { Thread } from "./ThreadModel"
import { UserModel2 } from "./UserModel"
import api from "../api/forums"
import { Post } from "./PostModel"
import axios from "axios"
import { StoreModel } from "./StoreModel"
export interface Forum{
    id: number,
    title: string,
    description: string,
    iconUrl: string,
    icon: File | null,
    bannerUrl: string,
    bannerKey: string,
    iconKey: string,
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
    iconFile?: File | null,
    bannerFile?: File,
}
export interface EditForumDto{
    id: string,
    title: string,
    description: string | null,
    iconFile?: File | null,
    bannerFile?: File | null,
    removeIcon: boolean,
    removeBanner?: boolean,
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
    EditForum: Thunk<ForumModel, EditForumDto, void, StoreModel>,
    DeleteForum: Thunk<ForumModel, number, void, StoreModel>,
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
            const response = await api.post("/api/forum", formData, {
                headers: {"Content-Type": "multipart/form-data"},
            })
            const forum = response.data;
            const forumId = forum.id;
            const getDims = async (file: File) => {
                try { const bmp = await createImageBitmap(file); return { w: bmp.width, h: bmp.height }; }
                catch { return undefined; }
            };
            if(CreateForumDto.iconFile){
                const f = CreateForumDto.iconFile;
                const {data: p} = await api.post("/api/forum/presign/icon", null, {
                    params: {contentType: f.type, fileName: f.name}
                });
                await axios.put(p.url, f, {headers: {"Content-Type": f.type}});
                const dims = await getDims(f);
                await api.post(`/api/forum/${forumId}/icon`, {
                     key: p.key, url: p.publicUrl, contentType: f.type, sizeBytes: f.size,
                     width: dims?.w, height: dims?.h
                })
                forum.iconUrl = p.publicUrl;
            }
            if(CreateForumDto.bannerFile){
                const f = CreateForumDto.bannerFile;
                const {data: p} = await api.post("/api/forum/presign/banner", null, {
                    params: {contentType: f.type, fileName: f.name}
                });
                await axios.put(p.url, f, {headers: {"Content-Type": f.type}});
                const dims = await getDims(f);
                await api.post(`/api/forum/${forumId}/banner`, {
                     key: p.key, url: p.publicUrl, contentType: f.type, sizeBytes: f.size,
                     width: dims?.w, height: dims?.h
                })
                forum.bannerUrl = p.publicUrl;
            }
            actions.AddForum(forum);
            actions.setError(null)
        }catch(error : any){
            console.error("Error creating forum:",error.message);
            actions.setError(error.message)
        }finally{
            actions.setLoading(false);
        }
    }),
    EditForum: thunk(async(actions , EditForumDto, helpers) => {
        actions.setLoading(false);
        const {getState, getStoreActions} = helpers;
        const getDims = async(file: File) => {
            try { 
                const bmp = await createImageBitmap(file); return { w: bmp.width, h: bmp.height}
            }catch{
                return undefined;
            }
        }
        try{
            const formData = new FormData();
            formData.append("title", EditForumDto.title)
            formData.append("description", EditForumDto.description!)
            const response = await api.put(`/api/forum/${EditForumDto.id}`,formData,{
                headers: {"Content-Type": "multipart/form-data"}
            })
            const existingForum = getState().forums.find(f => f.id === parseInt(EditForumDto.id))
            if(response.status === 200){
                const updatedForum = response.data
                if(existingForum){
                    actions.UpdateForum({...existingForum, 
                        title: updatedForum.title, 
                        description: updatedForum.description,
                    })
                }
            }else{
                console.error("Edit forum failed:", response.data)
            }
            if(EditForumDto.iconFile){
                const f = EditForumDto.iconFile;
                const {data: pi} = await api.post("/api/forum/presign/icon", null, {
                    params: {contentType: f.type, fileName: f.name}
                })
                await axios.put(pi.url, f, {headers: {'Content-Type' : f.type}});
                const dims = await getDims(f);
                await api.post(`/api/forum/${EditForumDto.id}/icon`, {
                    key: pi.key, url: pi.publicUrl, contentType: f.type, sizeBytes: f.size,
                    width: dims?.w, height: dims?.h
                })
                actions.UpdateForum({...existingForum!, iconUrl: pi.publicUrl})
            }
            if (EditForumDto.bannerFile) {
                const f = EditForumDto.bannerFile;
                const { data: pb } = await api.post('/api/forum/presign/banner', null, {
                    params: { contentType: f.type, fileName: f.name }
                });
                await axios.put(pb.url, f, { headers: { 'Content-Type': f.type } });
                const dims = await getDims(f);
                await api.post(`/api/forum/${EditForumDto.id}/banner`, {
                    key: pb.key, url: pb.publicUrl, contentType: f.type, sizeBytes: f.size,
                    width: dims?.w, height: dims?.h
                });
                actions.UpdateForum({ ...existingForum!, bannerUrl: pb.publicUrl });
            }
            if(EditForumDto.removeBanner){
                const response = await api.delete(`/api/forum/${EditForumDto.id}/banner`);
                const updatedForum = response.data;
                actions.UpdateForum({...existingForum!, bannerUrl: updatedForum.bannerUrl, bannerKey: updatedForum.bannerKey})
            }
            if(EditForumDto.removeIcon){
                const response = await api.delete(`/api/forum/${EditForumDto.id}/icon`);
                const updatedForum = response.data;
                actions.UpdateForum({...existingForum!, iconUrl: updatedForum.iconUrl, iconKey: updatedForum.iconKey})
            }
            actions.setError(null);
        }catch(error : any){
            const msg =
                error?.response?.data ||
                error.message || 'Failed to edit forum';
            console.error("Error editting forum:", msg);
            getStoreActions().ui.setAlert({message: msg, type: "danger"})
            actions.setError(msg);
        }finally{
            actions.setLoading(false);
        }
    }),
    DeleteForum: thunk(async(actions, forum_id, helpers) => {
        actions.setLoading(true);
        const {getState, getStoreActions} = helpers;
        try{
            const response = await api.delete(`/api/forum/${forum_id}`);
            if(response.status === 200){
                const existingForum = getState().forums.find(f => f.id === forum_id);
                if(existingForum){
                    actions.RemoveForum(existingForum);
                }
            }else{
                console.error("Delete failed:", response.data);
                actions.setError(response.data?.message || response.data || "Delete failed");
            }
        }catch(error : any){
            const msg =
            error?.response?.data ||
            error.message ||
            'Failed to delete forum';
            getStoreActions().ui.setAlert({message: msg, type: "danger"})
            if (axios.isAxiosError(error)) {
                const backendMessage = 
                    error.response?.data?.message || // JSON { message: "..."}
                    error.response?.data ||          // raw string from backend
                    error.message;                   // fallback
                console.error("Error deleting forum:", backendMessage);
                actions.setError(backendMessage);
            } else {
                
                console.error("Unexpected error:", error);
                actions.setError("Unexpected error occurred.");
            }
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