import {Action, Thunk, Computed, action, thunk} from "easy-peasy"
import {Reply} from "./ReplyModel"
import api from "../api/forums"
export interface Post {
    id: number,
    content: string,
    authorUsername: string,
    image?: File | null,
    imageUrl: string,
    profileImageUrl: string,
    parentPostId: number,
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
    image?: File|null
}
export interface EditPostDto{
    id: number,
    content: string,
    image? :File| null,
    removeImage: boolean
}
export interface ReplyPostDto{
    content: string,
    parentPostId: number | null,
    image?: File | null
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
            if(CreatePostDto.image){
                formData.append("image",CreatePostDto.image)
            }
            const response = await api.post("/api/post", formData, {
                headers: {"Content-Type": "multipart/form-data"},
            })
            actions.AddPost(response.data)
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
        try{
            const formData = new FormData();
            formData.append("content", EditPostDto.content);
            formData.append("removeImage", EditPostDto.removeImage ? "true" : "false")
            if(EditPostDto.image) formData.append("image", EditPostDto.image);
            const response = await api.put(`/api/post/${EditPostDto.id}`, formData, {
                headers: {"Content-Type": "multipart/form-data"},
            })
            if(response.status === 200){
                const updatedPost = response.data;
                const existingPost = getState().posts.find(p => p.id === EditPostDto.id);
                if(existingPost){
                    actions.UpdatePost({
                    ...existingPost,
                    content: updatedPost.content,
                    image: updatedPost.imageUrl ?? null,
                    });
                }
            }else{
                console.error("Edit post failed:", response.data);
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
            if(ReplyPostDto.image){
                formData.append("image", ReplyPostDto.image);
            }
            const response = await api.post('/api/post/reply', formData, {
                headers: {"Content-Type": "multipart/form-data"},
            });
            const newReply = response.data;
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