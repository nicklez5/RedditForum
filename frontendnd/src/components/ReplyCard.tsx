import {useEffect, useState} from "react";
import api from "../api/forums";
import { Reply} from "../interface/ReplyModel";
import { useStoreActions, useStoreState } from "../interface/hooks";
import { useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeContext";
import { UserReputation } from "./UserReputation";
import { formatWhen } from "../utils/dates";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faReply, faThumbsDown, faThumbsUp } from "@fortawesome/free-solid-svg-icons";
import { Post, User } from "../interface/PostModel";

export function ReplyCard({reply, onReply} : {reply: Post;  onReply: (p: { id: number; content: string; authorUsername: string }) => void}){
    const {darkMode} = useTheme();
    const navigate = useNavigate();
    const [like,setLike] = useState(false);
    const selectedPost = useStoreState((s) => s.post.selectedPost);
    const getUsersWhoLiked = useStoreActions((a) => a.post.GetUsersWhoLiked);
    const getpostById = useStoreActions((a) => a.post.GetPostById);
    const [count, setCount] = useState(reply.likeCount);
    const loggedIn = useStoreState((s) => s.user.loggedIn)
    const likePost = useStoreActions((a) => a.post.votePost);
    const profile = useStoreState((s) => s.user.Profile);
    useEffect(() => {
        const fetchData = async() => {
             try{
                const response = await api.get<User[]>(`/api/post/${reply.id}/postUserLikes`)
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
        setCount(reply.likeCount)
    },[reply.id, reply.likeCount, getUsersWhoLiked])
    console.log(selectedPost);
    const likeButton = async(postId: number, voteValue: number) => {
        if(!loggedIn) return;
        const res = await likePost({postId: postId, voteValue: voteValue})
        setCount(res.likeCount);
        setLike(!like);
        //setCount(posts.find((p) => p.id === post.id)?.likeCount)
        await getpostById(reply.id)
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
    const bg2 = darkMode ? "#000000e8" : "#ffffff";
    const color = darkMode ? "white" : "black";
    const bg3 = darkMode ? "#363a42" : "#ffffff";
    return (
        <>
        <div className="d-flex align-items-start text-white fs-5 mx-auto container mt-4 w-100">
            <div className={`d-flex ${panelBg} w-100`}>
                <div className={`d-flex flex-column align-items-center border-1 p-3`}>
                    <img src={reply.profileImageUrl!} className="avatar " style={{height: "85px", width:"85px"}}/>
                    <span className={`w-100 px-3 text-wrap ${darkMode ? 'text-white': 'text-dark'} small`}>
                        <button className={`border-0 bg-transparent ${darkMode ? 'text-white' : 'text-dark'} mb-3 fw-bold fs-6`} 
                        onClick={() => fetchId(reply.authorUsername!)}>
                            {reply.authorUsername}
                        </button>
                    </span>
                    <span>
                        <UserReputation username={reply.authorUsername!}/>
                    </span>
                </div>
                <div className="flex-grow-1 d-flex" style={{color:color}}>
                    <div className="d-flex flex-column align-items-start justify-content-start">
                        <div className="d-flex">
                            <p className="fs-6 mt-2">{formatWhen(reply.createdAt)}</p>
                        </div>
                        <p className="fs-6">{reply.content}</p>
                        <div className="d-flex mb-2">
                        {reply.imageKey && (
                            <img src={reply.imageUrl!} height="400" width="400"/> 
                        )}
                        {reply.videoKey && (
                            <video src={reply.videoUrl!} height="400" width="400" controls />
                        )}
                        </div>
                        <div className="d-flex align-items-end justify-content-end flex-column flex-grow-1">
                            <p className="fs-6">Total Likes: {count}</p>
                        </div>
                    </div>
                </div>
                <div className="d-flex align-items-end justify-content-end mx-2">
                    <div className="me-2">
                        <button 
                        className={`border-0 px-2 py-2 rounded-2 fs-6 ${darkMode ? 'text-white': "text-dark"} mb-3`}
                        style={{backgroundColor: bg3}}
                        onClick={() => {
                            if(like)
                                likeButton(reply?.id!,0)
                            else
                                likeButton(reply?.id!,1)
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
                        <button className={`border-0 px-2 py-2 rounded-2 fs-6 ${darkMode ? 'text-white' : 'text-black'} mb-3`} style={{backgroundColor: bg3}}
                        onClick={() => onReply(reply)}>
                            <FontAwesomeIcon icon={faReply}/> Reply
                        </button>
                    </div>
                </div>
            </div>
        </div>
        {reply.replies.map((r) => {
            return (
                <ReplyCard reply={r} onReply={onReply}/>
            )
        })}
        </>
    )
}