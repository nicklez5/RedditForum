import {Action, Thunk, Computed, action, thunk} from "easy-peasy"
import { Post } from "./PostModel"
import { Forum } from "./ForumModel"
import api from "../api/forums"
export interface Thread{
    id: number;
    title: string;
    content: string;
    image? : File | null;
    imageUrl : string;
    forumId: number;
    forumTitle: string;
    forumIconUrl: string;
    authorId: number;
    authorUsername: string;
    postCount: number;
    likeCount: number;
    userVote: number;
    posts: Post[];
    createdAt: Date;
}
export interface CreateThreadDto{
    title: string,
    content: string,
    forumId: number,
    image?: File | null
}
export interface EditThreadDto{
    id: number,
    title: string,
    content: string,
    image? :File | null,
    removeImage: boolean
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
    CreateThread: Thunk<ThreadModel, CreateThreadDto>,
    EditThread: Thunk<ThreadModel,EditThreadDto>,
    DeleteThread: Thunk<ThreadModel, number>,
    GetAllThreads: Thunk<ThreadModel>,
    GetAllThreadsByForum: Thunk<ThreadModel, number>,
    GetThreadById: Thunk<ThreadModel, number>,
    voteThread: Thunk<ThreadModel, {threadId: number, voteValue: number}>,
    GetThreadLikes: Thunk<ThreadModel, number>
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
            if(CreateThreadDto.image){
                formData.append("image",CreateThreadDto.image)
            }
            const response = await api.post("/api/thread", formData
            );
            actions.AddThread(response.data);
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
        try{
            const formData = new FormData();
            formData.append("content", EditThreadDto.content);
            formData.append("removeImage", EditThreadDto.removeImage ? "true" : "false")
            formData.append("title", EditThreadDto.title);
            if(EditThreadDto.image) formData.append("image",EditThreadDto.image);
            const response = await api.put(`/api/thread/${EditThreadDto.id}`, formData,{
                headers: {"Content-Type": "multipart/form-data"},
            });
            if(response.status === 200){
                const updatedThread = response.data
                const existingThread = getState().threads.find(t => t.id === EditThreadDto.id);
                if(existingThread){
                    actions.UpdateThread({
                        ...existingThread, 
                        title: updatedThread.title,
                        content: updatedThread.content,
                        image: updatedThread.imageUrl ?? null,
                    })
                }
            }else{
                console.error("Edit failed:", response.data);
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
            const response = await api.get(`/api/thread/search?sortBy=${sortBy}`)
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
            const response = await api.get(`/api/thread/${id}/search?sortBy=${sortBy}`, {allowAnonymous: true , suppressRedirect: true})
            actions.SetThreads(response.data);
            actions.setError(null);
        }catch(error : any){
            console.error("Failed to sort threads", error)
            actions.setError(error.message)
        }finally{
            actions.setLoading(false)
        }
    })

}