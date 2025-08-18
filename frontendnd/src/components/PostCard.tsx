import {useEffect, useState} from "react";
import api from "../api/forums";
import { EditPostDto, Post, User } from "../interface/PostModel";
import { useStoreActions, useStoreState } from "../interface/hooks";
import { useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeContext";
import { UserReputation } from "./UserReputation";
import { formatWhen } from "../utils/dates";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faReply, faThumbsDown, faThumbsUp, faTrash } from "@fortawesome/free-solid-svg-icons";
import { ReplyCard } from "./ReplyCard";
import { Form } from "react-bootstrap";
import EditPostModal from "./EditPostModal";
type PostCardProps = {
    post: Post;
    onReply: (p: {id: number; content: string; authorUsername: string}) => void;
    onDeleted?: (id: number) => void;
    onUpdated? : (updated: Post) => void;
}
export async function urlToFile(url: string, fileName? : string, mimeType? : string): Promise<File>{
    const res = await fetch(url);
    if(!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    const blob = await res.blob();
    const nameFromUrl = decodeURIComponent(new URL(url).pathname.split('/').pop() || "file");
    const name = fileName ?? nameFromUrl;
    const type = (mimeType ?? blob.type) || "application/octet-stream";
    return new File([blob], name, {type});
}
export function PostCard({post, onReply, onDeleted, onUpdated} : PostCardProps) {
    const {darkMode} = useTheme();
    const navigate = useNavigate();
    const deletePost = useStoreActions((a) => a.post.DeletePost);
    const [like, setLike] = useState(false);
    const getUsersWhoLiked = useStoreActions((a) => a.post.GetUsersWhoLiked);
    const getpostById = useStoreActions((a) => a.post.GetPostById);
    const selectedPost = useStoreState((s) => s.post.selectedPost)
    const [count,setCount] = useState(post.likeCount);
    const posts = useStoreState((s) => s.post.posts);
    const getPostById = useStoreActions((a) => a.post.GetPostById);
    const loggedIn = useStoreState((s) =>s.user.loggedIn);
    const likePost = useStoreActions((a) => a.post.votePost);
    const profile = useStoreState((s) => s.user.Profile);
    const editPost = useStoreActions((a) => a.post.EditPost);
    const [showModal, setShowModal] = useState(false);
    const open = () => setShowModal(true);
    const close = () => setShowModal(false);
    const [editContent, setEditContent] = useState('')
    const [editImage, setEditImage] = useState<File | null>(null)
    const [editRemoveImage, setEditRemoveImage] = useState(false);
    const [editVideo, setEditVideo] = useState<File | null>(null);
    const [editRemoveVideo, setEditRemoveVideo] = useState(false);
    useEffect(() => {
        const fetchData = async() => {
             try{
                const response = await api.get<User[]>(`/api/post/${post.id}/postUserLikes`)
                const likedUsers = response.data;
                if(profile){
                    const array1234 = likedUsers?.filter((u) => u.AuthorUsername === profile.username)
                    if(array1234.length === 0){
                        setLike(false);
                    }else{
                        setLike(true);
                    }
                }
            }catch(error: any){
                console.error("Failed to retrieve users who liked post", error.message)
            }
        }
        fetchData();
        setCount(post.likeCount)
    },[post.id,post.likeCount,getUsersWhoLiked])
    console.log(selectedPost)
    const likeButton = async(postId: number, voteValue: number) => {
        if(!loggedIn) return;
        const res = await likePost({postId: postId, voteValue: voteValue})
        setCount(res.likeCount);
        setLike(!like);
        //setCount(posts.find((p) => p.id === post.id)?.likeCount)
        await getpostById(post.id)
    }
    const collectData = async() => {
        setShowModal(true);
        setEditContent(post.content);
        const [imgFile, vidFile] = await Promise.all([
            post.imageUrl ? urlToFile(post.imageUrl).catch(() => null) : Promise.resolve(null),
            post.videoUrl ? urlToFile(post.videoUrl).catch(() => null) : Promise.resolve(null),
        ]);
        setEditImage(imgFile);   // null if no image/url failed
        setEditVideo(vidFile); 
        setEditRemoveImage(false);
        setEditRemoveVideo(false);
    }
    const panelBg = darkMode ? "bg-dark" : "bg-body-secondary";
    const fetchId = async(username: string) => {
        try{
            const {data} = await api.get(`/api/account/${username}`, {allowAnonymous : true});
            navigate(`/profile/${data.id}`)
        }catch(err){
            console.error("Failed to resolve user:", err)
        }
    }
    const DeletePost = async(id: number) => {
        await deletePost(id);
        onDeleted?.(id)
    }
    const handleSubmit = async(data: { content: string; image? : File | null; video? :File | null; removeImage: boolean; removeVideo : boolean}) => {
        const dto: EditPostDto = {
            id: post.id,
            content: data.content,
            image: data.image,
            video: data.video,
            removeImage: data.removeImage,
            removeVideo: data.removeVideo,
        }
        await editPost(dto);
        const updatedPost = await getPostById(post.id);
        onUpdated?.(updatedPost);
    }
    const bg2 = darkMode ? "#000000e8" : "#ffffff";
    const color = darkMode ? "white" : "black";
    const bg3 = darkMode ? "#363a42" : "#ffffff";
    return (
        <>
        <div className="d-flex align-items-start text-white fs-5 mx-auto container mt-4 w-100">
            <div className={`d-flex ${panelBg} w-100`}>
                <div className={`d-flex flex-column align-items-center border-1 p-3`}>
                    <img src={post.profileImageUrl!} className="avatar " style={{height: "85px", width:"85px"}}/>
                    <span className={`w-100 px-3 text-wrap ${darkMode ? 'text-white': 'text-dark'} small`}>
                        <button className={`border-0 bg-transparent ${darkMode ? 'text-white' : 'text-dark'} mb-3 fw-bold fs-6`} 
                        onClick={() => fetchId(post.authorUsername!)}>
                            {post.authorUsername}
                        </button>
                    </span>
                    <span>
                        <UserReputation username={post.authorUsername!}/>
                    </span>
                </div>
                <div className="flex-grow-1 d-flex" style={{color:color}}>
                    <div className="d-flex flex-column align-items-start justify-content-start">
                        <div className="d-flex">
                            <p className="fs-6 mt-2">{formatWhen(post.createdAt)}</p>
                        </div>
                        <p className="fs-6">{post.content}</p>
                        <div className="d-flex mb-2">
                        {post.imageKey && (
                            <img src={post.imageUrl!} height="400" width="400"/> 
                        )}
                        {post.videoKey && (
                            <video src={post.videoUrl!} height="400" width="400" controls />
                        )}
                        </div>
                        <div className="d-flex align-items-end justify-content-end flex-column flex-grow-1">
                            <p className="fs-6">Total Likes: {count}</p>
                        </div>
                        {profile?.username === post.authorUsername && (
                        <>
                        <div className="d-flex gap-2">
                            <button className={`border-0 px-2 py-2 rounded-2 fs-6 bg-danger ${darkMode ? 'text-white' : 'text-black'} mb-3`} style={{backgroundColor: bg3}}
                                onClick={() => DeletePost(post.id)}
                            >
                                <FontAwesomeIcon icon={faTrash}/>Delete
                            </button>
                            <button className={`border-0 px-2 py-2 rounded-2 fs-6 bg-info ${darkMode ? 'text-white' : 'text-black'} mb-3`} style={{backgroundColor: bg3}}
                                onClick={open}
                            >
                                <FontAwesomeIcon icon={faEdit}/> Edit
                            </button>
                        </div>
                        </>
                        )}
                    </div>
                </div>
                
                <div className="d-flex align-items-end justify-content-end mx-2">
                    <div className="me-2 ">
                        <button 
                        className={`border-0 px-2 py-2 rounded-2 fs-6 bg-primary ${darkMode ? 'text-white': "text-dark"} mb-3`}
                        style={{backgroundColor: bg3}}
                        onClick={() => {
                            if(like)
                                likeButton(post?.id!,0)
                            else
                                likeButton(post?.id!,1)
                        }}
                        >
                            {like ?
                            <>
                            <FontAwesomeIcon icon={faThumbsDown}/>Unlike
                            </>: <>
                            <FontAwesomeIcon icon={faThumbsUp}/>Like
                            </>
                            }
                        </button>
                    </div>
                    <div>
                        <button className={`border-0 px-2 py-2 rounded-2 fs-6 bg-success ${darkMode ? 'text-white' : 'text-black'} mb-3`} style={{backgroundColor: bg3}}
                        onClick={() => onReply(post)}>
                            <FontAwesomeIcon icon={faReply}/> Reply
                        </button>
                    </div>
                    <div className="d-flex">
                        
                    </div>
                </div>
            </div>
            <EditPostModal
                show={showModal}
                onClose = {close}
                onSubmit={handleSubmit}
                initial= {{
                    content: post.content,
                    imageUrl: post.imageUrl ?? null,
                    videoUrl: post.videoUrl ?? null
                }}
            />
        </div>
        {post.replies.map((r) => {
                return (
                    <PostCard post={r} onReply={onReply} onDeleted={onDeleted} onUpdated={onUpdated}/>
                )
            })}
        </>
    )
}