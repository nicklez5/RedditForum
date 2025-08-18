import {Action, Thunk, Computed, action, thunk} from "easy-peasy"
import {Reply} from "./ReplyModel"
import api from "../api/forums"
import axios from "axios";
export interface Post {
    id: number,
    content: string,
    authorUsername: string,
    image?: File | null,
    imageUrl: string | null,
    imageKey: string | null,
    videoUrl: string | null,
    videoKey: string | null,
    videoContentType: string | null,
    profileImageUrl: string,
    parentPostId?: number,
    threadId: number,
    createdAt: Date,
    likeCount: number,
    userVote: number,
    replies: Post[],
    likedBy: User[] | null;
}
export interface User{
    AuthorUsername: string
}
export interface CreatePostDto{
    content: string,
    threadId: number | null,
    parentPostId: number | null,
    image?: File|null,
    video? :File | null,
}
export interface EditPostDto{
    id: number,
    content: string,
    image? :File| null,
    removeImage: boolean
    video? :File| null,
    removeVideo: boolean,
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
    })
export interface ReplyPostDto{
    content: string,
    parentPostId: number | null,
    image?: File | null,
    video?: File | null,
}
export interface PostModel{
    posts: Post[],
    loading: boolean,
    error: string | null,
    selectedPost: Post | null,

    setLoading: Action<PostModel, boolean>,
    setError: Action<PostModel, string | null>,
    setSelectedPost: Action<PostModel, Post>,
    updatePostVote: Action<PostModel, {postId: number; newVote: number}>,
    SetPosts: Action<PostModel, Post[]>,
    AddPost: Action<PostModel, Post>,
    RemovePost: Action<PostModel, Post>,
    UpdatePost: Action<PostModel, Post>,
    CreatePost: Thunk<PostModel, CreatePostDto>,
    EditPost: Thunk<PostModel, EditPostDto>,
    DeletePost: Thunk<PostModel, number>,
    GetAllPosts: Thunk<PostModel>,
    GetAllPostsFlatten: Thunk<PostModel>,
    GetPostById: Thunk<PostModel, number>,
    votePost: Thunk<PostModel, {postId: number, voteValue: number}, any>,
    
    GetPostLikes: Thunk<PostModel, number>,
    GetUsersWhoLiked: Thunk<PostModel, number>,
    ReplyToPost: Thunk<PostModel, ReplyPostDto>
}
export const postModel: PostModel = {
    posts: [],
    loading: false,
    error: "",
    selectedPost : null,

    setLoading: action((state,loading) => {
        state.loading = loading
    }),

    setError: action((state, error) => {
        state.error = error
    }),

    setSelectedPost: action((state, post) => {
        state.selectedPost = post
    }),

    SetPosts: action((state, posts) => {
        state.posts = posts
    }),

    AddPost: action((state, post) => {
        state.posts.push(post)
    }),
    updatePostVote: action((state, {postId, newVote}) => {
        const post = state.posts.find(p => p.id === postId);
        if(post){
            post.userVote = newVote;
        }
    }),
    RemovePost: action((state, post) => {
        state.posts = state.posts.filter(p => p.id !== post.id)
        if(state.selectedPost!.id == post.id){
            state.selectedPost = null;
        }
    }),
    UpdatePost: action((state, post) => {
        const index = state.posts.findIndex(p => p.id === post.id);
        if(index !== -1){
            state.posts[index] = post;
            
        }
    }),
    CreatePost: thunk(async(actions, CreatePostDto) => {
        actions.setLoading(true);
        try{
            const formData = new FormData();
            formData.append("content", CreatePostDto.content);
            formData.append("threadId", String(CreatePostDto.threadId));
            if(CreatePostDto.parentPostId !== null){
                formData.append("parentPostId", String(CreatePostDto.parentPostId))
            }
            const response = await api.post("/api/post", formData, {
                headers: {"Content-Type": "multipart/form-data"},
            })
            const post = response.data;
            const postId = post.id;
     
            const getDims = async(file: File) => {
                try{ const bmp = await createImageBitmap(file); return { w: bmp.width, h: bmp.height}}
                catch{ return undefined;}
            }
            if(CreatePostDto.image){
                const f = CreatePostDto.image;
                const {data:p} = await api.post("/api/images/presign", null, {
                    params: {contentType: f.type, fileName: f.name, scope: "post"}
                })
                await axios.put(p.url, f, {headers: {'Content-Type': f.type}})
                const dims = await getDims(f);
                await api.post(`/api/post/${postId}/image`,{
                    key: p.key, url: p.publicUrl, contentType: f.type, sizeBytes: f.size, width: dims?.w, height: dims?.h
                })
                post.imageUrl = p.publicUrl;
                post.imageKey = p.key;
            }
            if(CreatePostDto.video){
                const f = CreatePostDto.video;
                const {data: pre} = await api.post("/api/videos/presign" , null,{
                    params: {contentType: f.type, fileName: f.name}
                })
                await axios.put(pre.url,f,{headers: {"Content-Type": f.type}})
                const meta = await readVideoMeta(f).catch(() => ({} as VideoMeta));
                await api.post(`/api/post/${postId}/video`,{
                    key: pre.key, url: pre.publicUrl, contentType: f.type, sizeBytes: f.size,
                    durationSec: meta.durationSec, width: meta.width, height: meta.height
                })
                post.videoUrl = pre.publicUrl;
                post.videoKey = pre.key;
                post.videoContentType = f.type;
            }
            actions.AddPost(post)
            actions.setError(null);
        }catch(error: any){
            console.error("Error creating post:", error.message);
            actions.setError(error.message);
        }finally{
            actions.setLoading(false);
        }
    }),
    EditPost: thunk(async(actions, EditPostDto, {getState}) => {
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
            formData.append("content", EditPostDto.content);
            const response = await api.put(`/api/post/${EditPostDto.id}`, formData, {
                headers: {"Content-Type": "multipart/form-data"},
            })
            const existingPost = getState().posts.find(p => p.id === EditPostDto.id);
            if(response.status === 200){
                const updatedPost = response.data;
                if(existingPost){
                    actions.UpdatePost({
                    ...existingPost,
                    content: updatedPost.content,
                    });
                }
            }else{
                console.error("Edit post failed:", response.data);
            }
            if(EditPostDto.image){
                const f = EditPostDto.image;
                const {data: pi} = await api.post("/api/images/presign", null ,{
                    params: {contentType: f.type, fileName: f.name, scope: "post"}
                })
                await axios.put(pi.url, f, {headers: {'Content-Type': f.type}});
                const dims = await getDims(f);
                await api.post(`/api/post/${EditPostDto.id}/image`, {
                    key: pi.key, url: pi.publicUrl, contentType: f.type, sizeBytes: f.size,
                    width: dims?.w, height: dims?.h
                })
                actions.UpdatePost({...existingPost!, imageUrl: pi.publicUrl, imageKey: pi.key});
            }
            if(EditPostDto.removeImage){
                const response = await api.delete(`/api/post/${EditPostDto.id}/image`)
                const updatedPost = response.data;
                actions.UpdatePost({...existingPost!, imageUrl: updatedPost.imageUrl,imageKey: updatedPost.imageKey })
            }
            if(EditPostDto.video){
                const f = EditPostDto.video;
                const { data: pre} = await api.post("/api/videos/presign", null, {
                    params: {contentType: f.type, fileName: f.name}
                });
                await axios.put(pre.url, f,{headers: {'Content-Type': f.type}});
                const meta = await readVideoMeta(f).catch(() => ({} as VideoMeta))
                await api.post(`/api/post/${EditPostDto.id}/video`,{
                    key: pre.key, url: pre.publicUrl, contentType: f.type, sizeBytes: f.size,
                    durationSec: meta.durationSec, width: meta.width, height: meta.height
                })
                actions.UpdatePost({...existingPost!, videoUrl: pre.publicUrl, videoKey: pre.key, videoContentType: f.type})
            }else if(EditPostDto.removeVideo){
                const response = await api.delete(`/api/post/${EditPostDto.id}/video`)
                const updatedPost = response.data
                actions.UpdatePost({...existingPost!, videoKey: updatedPost.videoKey, videoUrl: updatedPost.videoUrl})
            }
            actions.setError(null);
            
        }catch(error: any){
            console.error("Error editting post:", error.message);
            actions.setError(error.message);
        }finally{
            actions.setLoading(false);
        }
    }),
    DeletePost: thunk(async(actions, post_id,{getState}) => {
        actions.setLoading(true);

        try{
            const response = await api.delete(`/api/post/${post_id}`);
            if(response.status === 200){
                const existingPost = getState().posts.find(p => p.id === post_id);
                if(existingPost){
                    actions.RemovePost(existingPost);
                }
            }else{
                console.error("Delete failed:", response.data);
            }
            actions.setError(null);
        }catch(error: any){
            console.error("Error deleting post:", error.message);
            actions.setError(error.message);
        }finally{
            actions.setLoading(false);
        }
    }),
    GetAllPosts: thunk(async(actions) => {
        actions.setLoading(true);
        try{
            const response = await api.get<Post[]>("/api/post");
            actions.SetPosts(response.data);
            actions.setError(null);
        }catch(error : any){
            console.error("Error fetching all posts:", error.message);
            actions.setError(error.message);
        }finally{
            actions.setLoading(false)
        }
    }),
    GetAllPostsFlatten: thunk(async(actions) => {
        actions.setLoading(true);
        try{
            const response = await api.get<Post[]>("/api/post/posts");
            actions.SetPosts(response.data);
            actions.setError(null);
        }catch(error : any){
            console.error("Error fetching all posts:", error.message);
            actions.setError(error.message);
        }finally{
            actions.setLoading(false)
        }
    }),
    GetPostById: thunk(async(actions, id) => {
        actions.setLoading(true);
        try{
            const response = await api.get<Post>(`/api/post/${id}`);
            actions.setSelectedPost(response.data)
            actions.setError(null);
            return response.data
        }catch(error : any){
            console.error(`Error fetching post id ${id}`, error.message)
            actions.setError(error.message)
        }finally{
            actions.setLoading(false)
        }
    }),
    votePost: thunk(async(actions,{ postId, voteValue} , {getStoreState}) => {
        actions.setLoading(true);
        try{
            const response = await api.post(`/api/post/vote`, {
                postId,
                vote: voteValue,
            });
            const updatedPost = response.data;
            actions.UpdatePost(updatedPost);
            actions.setError(null);
            return response.data
        }catch(err: any){
            console.error("Like failed:", err);
            actions.setError(err.message);
        }finally{
            actions.setLoading(false);
        }
    }),
    GetPostLikes: thunk(async(actions,id, {getState}) => {
        actions.setLoading(true);
        try{
            const response = await api.get(`/api/post/${id}/postLikes`);
            const updatedPost = response.data;


            const posts = getState().posts.map(p => p.id === updatedPost.id ? updatedPost : p)
            actions.SetPosts(posts);


            const selected = getState().selectedPost;
            if(selected && selected.id === updatedPost.id){
                actions.setSelectedPost(updatedPost);
            }
            actions.setError(null);
        }catch(error : any){
            console.error("Failed to get post likes", error);
            actions.setError(error.message);
        }finally{
            actions.setLoading(false);
        }
    }),
    GetUsersWhoLiked: thunk(async(actions,id, {getState}) => {
        actions.setLoading(true);
        try{
            const response = await api.get<User[]>(`/api/post/${id}/postUserLikes`);
            const likedUsers = response.data;

            const selected = getState().selectedPost;
            if(selected && selected.id === id){
                actions.setSelectedPost({...selected, likedBy: likedUsers});
            }
            actions.setError(null);
        }catch(error: any){
            console.error("Failed to get users who liked post", error.message);
            actions.setError(error.message);
        }finally{
            actions.setLoading(false);
        }
    }),
    ReplyToPost: thunk(async(actions, ReplyPostDto,{getState}) => {
        actions.setLoading(true);
        try{
            const formData = new FormData();
            formData.append("content", ReplyPostDto.content);
            formData.append("parentPostId",String(ReplyPostDto.parentPostId))
            const response = await api.post('/api/post/reply', formData, {
                headers: {"Content-Type": "multipart/form-data"},
            });
            const newReply = response.data;
            const newReplyId = newReply.id;
            const getDims = async(file: File) => {
                try{ const bmp = await createImageBitmap(file); return {w:bmp.width, h:bmp.height}}
                catch{return undefined;}
            }
            if(ReplyPostDto.image){
                const f = ReplyPostDto.image;
                const {data:p} = await api.post("/api/images/presign", null , {
                    params: {contentType: f.type, fileName: f.name, scope: "post"}
                })
                await axios.put(p.url, f, {headers: {'Content-Type': f.type}})
                const dims = await getDims(f);
                await api.post(`/api/post/${newReplyId}/image`, {
                    key: p.key, url: p.publicUrl, contentType: f.type, sizeBytes: f.size, width: dims?.w, height: dims?.h
                })
                newReply.imageUrl = p.publicUrl;
                newReply.imageKey = p.key;
            }
            if(ReplyPostDto.video){
                const f = ReplyPostDto.video;
                const {data: pre} = await api.post("/api/videos/presign" , null ,{
                    params: {contentType: f.type, fileName: f.name}
                })
                await axios.put(pre.url, f,{headers: {"Content-Type": f.type}})
                const meta = await readVideoMeta(f).catch(() => ({} as VideoMeta));
                await api.post(`/api/post/${newReplyId}/video`,{
                    key: pre.key, url: pre.publicUrl, contentType: f.type, sizeBytes: f.size,
                    durationSec: meta.durationSec, width: meta.width, height: meta.height
                })
                newReply.videoUrl = pre.publicUrl;
                newReply.videoKey = pre.key;
                newReply.videoContentType = f.type;
            }
            const posts = getState().posts;

            const parentIndex = posts.findIndex(p => p.id === newReply.ParentPostId)
            if(parentIndex !== -1){
                const parentPost = posts[parentIndex];
            const updatedParent = {
                ...parentPost,
                Replies: [...parentPost.replies, newReply],
            }
            actions.UpdatePost(updatedParent);
            
        }else{
            console.warn("Parent post not found; reply created but not added to UI.")
        }
        actions.setError(null);
    }catch(error: any){
        console.error("Failed to reply to post", error.message)
        actions.setError(error.message);
    }finally{
        actions.setLoading(false);
    }
    })

}