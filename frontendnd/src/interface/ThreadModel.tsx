import {Action, Thunk, Computed, action, thunk} from "easy-peasy"
import { Post, User } from "./PostModel"
import { Forum } from "./ForumModel"
import api from "../api/forums"
import axios from "axios";
import { StoreModel } from "./StoreModel";
export interface Thread{
    id: number;
    title: string;
    content: string;
    image? : File | null;
    imageUrl : string | null,
    imageKey: string | null,
    videoUrl: string | null,
    videoKey: string | null,
    videoContentType: string | null,
    forumId: number;
    forumTitle: string;
    forumIconUrl: string;
    authorId: number;
    authorUsername: string;
    authorProfileImageUrl: string;
    postCount: number;
    likeCount: number;
    userVote: number;
    posts: Post[];
    likedBy: User[] | null;
    latestReply: Post;
    createdAt: Date;
}
type VideoMeta = {durationSec? : number; width? : number; height?: number};
const readVideoMeta = (file: File): Promise<VideoMeta> => 
    new Promise((res) => {
        const v = document.createElement("video");
        v.preload = "metadata";
        v.onloadedmetadata = () => {
            res({
                durationSec: isFinite(v.duration) ? Math.round(v.duration) : undefined,
                width: v.videoWidth || undefined,
                height: v.videoHeight || undefined
            });
            URL.revokeObjectURL(v.src);
        }
        v.onerror = () => res({});
        v.src = URL.createObjectURL(file);
        v.load();
    })
export interface CreateThreadDto{
    title: string,
    content: string,
    forumId: number,
    image?: File | null
    video? : File | null,
}
export interface EditThreadDto{
    id: number,
    title: string,
    content: string,
    image? :File | null,
    removeImage: boolean
    video? : File | null,
    removeVideo: boolean,
}
export interface ThreadModel{
    threads: Thread[],
    loading: boolean,
    error: string | null,
    selectedThread: Thread | null,
    setLoading: Action<ThreadModel, boolean>,
    setError: Action<ThreadModel, string | null>,
    setSelectedThread: Action<ThreadModel, Thread>,
    SetThreads: Action<ThreadModel, Thread[]>,
    AddThread: Action<ThreadModel, Thread>,
    RemoveThread: Action<ThreadModel, Thread>,
    UpdateThread: Action<ThreadModel, Thread>,
    SearchByFilterThread: Thunk<ThreadModel, string>,
    SearchByForumFilterThread: Thunk<ThreadModel,{sortBy: string,id: string}>,
    CreateThread: Thunk<ThreadModel, CreateThreadDto,void,StoreModel>,
    EditThread: Thunk<ThreadModel,EditThreadDto>,
    DeleteThread: Thunk<ThreadModel, number>,
    GetAllThreads: Thunk<ThreadModel>,
    GetAllThreadsByForum: Thunk<ThreadModel, number>,
    GetThreadById: Thunk<ThreadModel, number>,
    voteThread: Thunk<ThreadModel, {threadId: number, voteValue: number}>,
    GetThreadLikes: Thunk<ThreadModel, number>
    GetUsersWhoLiked: Thunk<ThreadModel, number>,
}
export const threadModel: ThreadModel = {
    threads: [],
    loading: false,
    error: "",
    selectedThread: null,

    setLoading: action((state, loading) => {
        state.loading = loading
    }),

    setError: action((state, error) => {
        state.error = error
    }),
    setSelectedThread: action((state, thread) => {
        state.selectedThread = thread
    }),
    SetThreads: action((state, threads) => {
        state.threads = threads
    }),
    AddThread: action((state, thread) => {
        state.threads.push(thread)
    }),
    RemoveThread: action((state, thread) =>{
        state.threads = state.threads.filter(t => t.id !== thread.id);
    }),
    UpdateThread: action((state, updatedThread) => {
        const index = state.threads.findIndex(t => t.id === updatedThread.id);
        if(index !== -1){
            state.threads[index] = updatedThread;
        }
        if(state.selectedThread!.id == updatedThread.id){
            state.selectedThread = updatedThread;
        }
    }),

    CreateThread: thunk(async(actions,CreateThreadDto) => {
        
        actions.setLoading(true);
        try{
            const formData = new FormData();
            formData.append("title", CreateThreadDto.title);
            formData.append("forumId", String(CreateThreadDto.forumId));
            formData.append("content",CreateThreadDto.content);
            const res = await api.post("/api/thread", formData);

            // Guard: ensure JSON, not HTML
            const ct = res.headers?.["content-type"] ?? "";
            if (!ct.includes("application/json") && typeof res.data === "string") {
            throw new Error(`CreateThread returned ${ct}. Sample: ${res.data.slice(0, 120)}`);
            }

            // Get the id (handle casing/wrapping)
            const d: any = res.data;
            let threadId: number | undefined =
            d?.id ?? d?.Id ?? d?.threadId ?? d?.ThreadId ?? d?.thread?.id ?? d?.thread?.Id;

            // 201-with-Location fallback
            if (!threadId && res.status === 201 && res.headers?.location) {
            const last = res.headers.location.split("/").filter(Boolean).pop();
            if (last && /^\d+$/.test(last)) threadId = Number(last);
            }

            if (!threadId) {
            console.error("CreateThread response:", d);
            throw new Error("CreateThread failed: missing thread id");
            }

            
                        
            const getDims = async(file: File) => {
                try{ const bmp = await createImageBitmap(file); return {w:bmp.width, h:bmp.height}}
                catch { return undefined;}
            }
            if(CreateThreadDto.image){
                const f = CreateThreadDto.image;
                const {data: p} = await api.post("/api/images/presign", null, {
                    params: {contentType: f.type, fileName: f.name, scope: "thread"}
                })
                await axios.put(p.url, f, {headers: {"Content-Type": f.type}})
                const dims = await getDims(f);
                await api.post(`/api/thread/${threadId}/image`, {
                    key: p.key, url: p.publicUrl, contentType: f.type, sizeBytes: f.size, width: dims?.w, height: dims?.h
                })
                d.imageUrl = p.publicUrl;
                d.imageKey = p.key;
            }
            if(CreateThreadDto.video){
                const f = CreateThreadDto.video;
                const {data: pre} = await api.post("/api/videos/presign", null, {
                    params: {contentType: f.type, fileName: f.name}
                })
                await axios.put(pre.url, f, {headers: {"Content-Type": f.type}})
                const meta = await readVideoMeta(f).catch(() => ({} as VideoMeta));
                await api.post(`/api/thread/${threadId}/video`, {
                    key: pre.key, url: pre.publicUrl, contentType: f.type, sizeBytes: f.size,
                    durationSec: meta.durationSec, width: meta.width, height: meta.height
                });
                d.videoUrl = pre.publicUrl;
                d.videoKey = pre.key;
                d.videoContentType = f.type;
            }
            
            actions.AddThread(d);
            actions.setError(null);
        }catch(error: any){
            console.error("Failed to create thread:", error);
            actions.setError(error.message)
        }finally{
            actions.setLoading(false);
        }
    }),
    EditThread: thunk(async(actions,EditThreadDto, {getState}) => {
        actions.setLoading(true);
        const getDims = async(file: File) => {
            try { 
                const bmp = await createImageBitmap(file); return { w: bmp.width, h: bmp.height}
            }catch{
                return undefined;
            }
        }
        try{
            const formData = new FormData();
            formData.append("content", EditThreadDto.content);
            formData.append("title", EditThreadDto.title);
            const response = await api.put(`/api/thread/${EditThreadDto.id}`, formData,{
                headers: {"Content-Type": "multipart/form-data"},
            });
            const existingThread = getState().threads.find(t => t.id === EditThreadDto.id);
            if(response.status === 200){
                const updatedThread = response.data
                if(existingThread){
                    actions.UpdateThread({
                        ...existingThread, 
                        title: updatedThread.title,
                        content: updatedThread.content,
                    })
                }
            }else{
                console.error("Edit failed:", response.data);
            }
            if(EditThreadDto.image){
                const f = EditThreadDto.image;
                const {data: pi} = await api.post("/api/images/presign" , null , {
                    params: {contentType: f.type, fileName: f.name, scope: "thread"}
                })
                await axios.put(pi.url, f, {headers: {'Content-Type': f.type}});
                const dims = await getDims(f);
                await api.post(`/api/thread/${EditThreadDto.id}/image` , {
                    key: pi.key, url: pi.publicUrl, contentType: f.type, sizeBytes: f.size,
                    width: dims?.w, height: dims?.h
                })
                actions.UpdateThread({...existingThread!, imageUrl: pi.publicUrl, imageKey: pi.key});
            }else if(EditThreadDto.removeImage){
                const response = await api.delete(`/api/thread/${EditThreadDto.id}/image`)
                const updatedThread = response.data;
                actions.UpdateThread({...existingThread!, imageUrl: updatedThread.imageUrl, imageKey: updatedThread.imageKey})
            }
            if(EditThreadDto.video){
                const f = EditThreadDto.video;
                const {data: pre} = await api.post("/api/videos/presign" , null , {
                    params: {contentType: f.type, fileName: f.name}
                });
                await axios.put(pre.url, f, {headers: {'Content-Type': f.type}});
                const meta = await readVideoMeta(f).catch(() => ({} as VideoMeta))
                await api.post(`/api/thread/${EditThreadDto.id}/video` , {
                    key: pre.key, url: pre.publicUrl, contentType: f.type, sizeBytes: f.size,
                    durationSec: meta.durationSec, width: meta.width, height: meta.height
                })
                actions.UpdateThread({...existingThread!, videoUrl: pre.publicUrl, videoKey: pre.key, videoContentType: f.type})
            }
            else if(EditThreadDto.removeVideo){
                const response = await api.delete(`/api/thread/${EditThreadDto.id}/video`)
                const updatedThread = response.data;
                actions.UpdateThread({...existingThread!, videoUrl: updatedThread.videoUrl, videoKey: updatedThread.videoKey})
            }
            actions.setError(null);
        }catch(error: any){
            console.error("Error editing thread:", error.message);
            actions.setError(error.message)
        }finally{
            actions.setLoading(false);
        }
    }),
    DeleteThread: thunk(async(actions, id, {getState}) => {
        actions.setLoading(true);
        try{
            const response = await api.delete(`/api/thread/${id}`);
            if(response.status === 200){
                const existingThread = getState().threads.find(t => t.id === id);
                if(existingThread){
                    actions.RemoveThread(existingThread);
                }
            }else{
                console.error("Delete failed:", response.data);
            }
            actions.setError(null);
        }catch(error: any){
            console.error("Error deleting thread:", error.message);
            actions.setError(error.message);
        }finally{
            actions.setLoading(false);
        }
    }),
    GetAllThreads: thunk(async(actions) => {
        actions.setLoading(true);
        try{
            const response = await api.get<Thread[]>('/api/thread/all');
            actions.SetThreads(response.data);
            actions.setError(null);
        }catch(error : any){
            console.error("Error fetching all threads: ", error.message)
            actions.setError(error.message);
        }finally{
            actions.setLoading(false);
        }
    }),
    GetAllThreadsByForum: thunk(async(actions , id) => {
        actions.setLoading(true);
        try{
            const response = await api.get<Thread[]>(`/api/thread/forums/${id}`);
            actions.SetThreads(response.data)
            actions.setError(null);
        }catch(error:any){
            console.error("Error fetching all threads:", error.message)
            actions.setError(error.message);
        }finally{
            actions.setLoading(false);
        }
    }),
    GetThreadById: thunk(async( actions , id) => {
        actions.setLoading(true);
        try{
            const response = await api.get<Thread>(`/api/thread/${id}`);
            actions.setSelectedThread(response.data);
            actions.setError(null);
        }catch(error: any){
            console.error(`Error fetching thread id ${id}`, error.message)
            actions.setError(error.message)
        }finally{
            actions.setLoading(false);
        }
    }),
    voteThread: thunk(async(actions,{threadId, voteValue}, {getStoreState}) => {
        actions.setLoading(true);
        try{
            const response = await api.post(`/api/thread/vote`,{
                threadId,
                vote: voteValue
            });
            const updatedThread = response.data;
            actions.UpdateThread(updatedThread);
            actions.setError(null);
            return response.data
        }catch(err : any){
            console.error("Like failed:", err);
            actions.setError(err.message);
        }finally{
            actions.setLoading(false)
        }
    }),
    GetThreadLikes: thunk(async(actions, id, {getState}) => {
        actions.setLoading(true);
        try{
            const response = await api.get(`/api/thread/${id}/likes`);
            const likeCount = response.data;
            const selected = getState().selectedThread;
            if(selected && selected.id === id){
                actions.setSelectedThread({...selected, likeCount: likeCount});
            }
            actions.setError(null);
        }catch(error : any){
            console.error("Failed to get thread likes", error);
            actions.setError(error.message);
        }finally{
            actions.setLoading(false);
        }
    }),
    SearchByFilterThread: thunk(async(actions, sortBy) => {
        actions.setLoading(true);
        try{
            const response = await api.get<Thread[]>(`/api/thread/search?sortBy=${sortBy}`)
            actions.SetThreads(response.data);
            actions.setError(null);
        }catch(error : any){
            console.error("Failed to sort threads",error)
            actions.setError(error.message)
        }finally{
            actions.setLoading(false)
        }
    }),
    SearchByForumFilterThread: thunk(async(actions,{sortBy, id}) => {
        actions.setLoading(true);
        try{
            const response = await api.get<Thread[]>(`/api/thread/${id}/search?sortBy=${sortBy}`, {allowAnonymous: true , suppressRedirect: true})
            actions.SetThreads(response.data);
            actions.setError(null);
        }catch(error : any){
            console.error("Failed to sort threads", error)
            actions.setError(error.message)
        }finally{
            actions.setLoading(false)
        }
    }),
    GetUsersWhoLiked: thunk(async(actions,id, {getState}) => {
        actions.setLoading(true);
        try{
            const response = await api.get<User[]>(`/api/thread/${id}/threadUserLikes`);
            const likedUsers = response.data;

            const selected = getState().selectedThread;
            if(selected && selected.id === id){
                actions.setSelectedThread({...selected, likedBy: likedUsers});
            }
            actions.setError(null);
        }catch(error: any){
            console.error("Failed to get users who liked post", error.message);
            actions.setError(error.message);
        }finally{
            actions.setLoading(false);
        }
    }),

}