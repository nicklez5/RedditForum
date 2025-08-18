import React, {useState, useEffect, useRef} from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {useStoreActions, useStoreState} from "../interface/hooks";
import { useTheme } from "./ThemeContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faClipboard, faEdit, faImage, faKey, faPlus, faReply, faThumbsDown, faThumbsUp, faTrash, faXmark } from "@fortawesome/free-solid-svg-icons";
import { Button, Form } from "react-bootstrap";
import CommentBox from "./CommentBox";
import api from "../api/forums";
import { formatWhen } from "../utils/dates";
import { CreatePostDto, Post, User } from "../interface/PostModel";
import { Profile } from "../interface/ProfileModel";
import { UserReputation } from "./UserReputation";
import { buildQueries } from "@testing-library/dom";
import { PostCard } from "./PostCard";
import { EditThreadDto } from "../interface/ThreadModel";
import EditThreadModal from "./EditThreadModel";
const ThreadPage = () => {
    const [like, setLike] = useState(false);
    const [likePost, setLikePost] = useState(false);
    const navigate = useNavigate();
    const fetchThreadId = useStoreActions((a) => a.thread.GetThreadById);
    const editThread = useStoreActions((a) => a.thread.EditThread);
    const thread = useStoreState((s) => s.thread.selectedThread);
    const createPost = useStoreActions((a) => a.post.CreatePost);
    const deleteThread = useStoreActions((a) => a.thread.DeleteThread);
    const getUsersWhoLiked = useStoreActions((a) => a.thread.GetUsersWhoLiked);
    const {darkMode} = useTheme();
    const {id} = useParams();
    const loggedIn = useStoreState((s) => s.user.loggedIn)
    const forum = useStoreState((s) => s.forum.selectedForum);
    const likeThread = useStoreActions((a) => a.thread.voteThread);
    const [show, setShow] = useState(false);
    const open = () => setShow(true);
    const close = () => setShow(false);
    const [reply, setReply] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview , setImagePreview] = useState<string | null>(null);
    const [video, setVideo] = useState<File | null>(null);
    const [videoPreview ,setVideoPreview] = useState<string | null>(null);
    const [removeImage, setRemoveImage] = useState(false);
    const [removeVideo, setRemoveVideo] = useState(false);
    const revokeImgRef = useRef<string | null>(null);
    const revokeVidRef = useRef<string | null>(null);
    const [replyParentId, setReplyParentId] = useState<number | null>(null);
    const user = useStoreState((s) => s.user.Profile)
    const selectedThread = useStoreState((s) => s.thread.selectedThread);
    const [posts ,setPosts] = useState<Post[]>(thread?.posts ?? []);
    const handleCancel = () => {
        setReply('')
        setImagePreview(null);
        setVideoPreview(null);

    }
    const clearPreviews = () => {
        if(revokeImgRef.current) {URL.revokeObjectURL(revokeImgRef.current); revokeImgRef.current = null;}
        if(revokeVidRef.current) {URL.revokeObjectURL(revokeVidRef.current); revokeVidRef.current = null;}
        setImage(null); setImagePreview(null);
        setVideo(null); setVideoPreview(null);
    }
    useEffect(() => {
        
        if(id){
            fetchThreadId(parseInt(id))
            console.log(thread);
        }

    },[])
    useEffect(() => {
        const fetchData = async() => {
            try{
                if(id){
                   const response = await api.get<User[]>(`/api/thread/${parseInt(id)}/threadUserLikes`)
                   const likedUsers = response.data;
                   if(user){
                    const array1234 = likedUsers?.filter((u) => u.AuthorUsername == user.username);
                        if(array1234.length === 0){
                            setLike(false);
                        }else{
                            setLike(true);
                        }
                   }
                }

            }catch(error: any){
                console.error("Failed to retrieve users who liked thread", error.message)
            }
        }
        fetchData();
    },[id,])
    useEffect(() => {
        setPosts(thread?.posts ?? [])
    },[thread?.id , thread?.posts])
    const handleFileChange = (file: File | null) => {
        clearPreviews();
        if(!file) return;
        const url = URL.createObjectURL(file);
        if(file.type.startsWith("image/")){
            setImage(file);
            setImagePreview(url);
            revokeImgRef.current = url;
        }else if(file.type.startsWith("video/")){
            setVideo(file);
            setVideoPreview(url);
            revokeVidRef.current = url;
        }else{
            URL.revokeObjectURL(url);
        }
    }
    useEffect(() => {
        clearPreviews();
    },[])
    const panelBg = darkMode ? "bg-dark" : "bg-body-secondary";
    const fetchId = async(username: string) => {
        try{
            const {data} = await api.get(`/api/account/${username}`, {allowAnonymous : true});
            navigate(`/profile/${data.id}`)
        }catch(err){
            console.error("Failed to resolve user:", err)
        }
    }
    const fetchProfile = async(username: string) => {
        try{
            const {data} = await api.get(`/api/account/${username}`,{allowAnonymous: true})
            const user_id = data.id;
            const response = await api.get<Profile>(`/api/profile/${user_id}`)
            return response.data
        }catch(err){
            console.error("Failed to retrive data:",err);
        }
    }
    const likeButton = async(threadId: number, voteValue: number) =>{
        if(!loggedIn) return;
        const res = await likeThread({threadId: threadId , voteValue: voteValue})
        setLike(!like);
    }
    const submitPost = async( ) => {
       const dto :CreatePostDto ={
            content: reply,
            threadId: parseInt(id!),
            parentPostId: replyParentId,
            image: image,
            video: video
            }
        await createPost(dto);
        fetchThreadId(parseInt(id!))
        setReply('')
        setImage(null);
        setVideo(null);
        setVideoPreview(null);
        setImagePreview(null);
        //fetchThreadId(parseInt(id!))
    }
    const DeleteThread = async(id: number) => {
        await deleteThread(id);
        navigate(`/forum/${forum?.id}`)
    }
    const submitThread = async(data: {title: string; content: string; image? : File | null; video? : File | null; removeImage: boolean; removeVideo: boolean}) => {
        const dto: EditThreadDto = {
            id: parseInt(id!),
            title: data.title,
            content: data.content,
            image: data.image,
            video: data.video,
            removeImage: data.removeImage,
            removeVideo: data.removeVideo,
        }
        await editThread(dto);

    }
    function BuildQuote(text?: string, author?: string, title?: string){
        const safeText = text ?? ""; // if undefined or null → ""
        const header = `${author ? `${author} wrote` : "Original post"}${title ? ` - ${title}` : ""}:\n`;
        const quoted = safeText.trim().split("\n").map((line) => `> ${line}`).join("\n");
        return `${header}${quoted}\n\n`;
    }
    const replyButton = () =>{
        const quote = BuildQuote(thread?.content!, thread?.authorUsername, thread?.title);
        setReply((prev) => (prev ? `${prev}\n${quote}` : quote));
        
    }
    const replyToPost = (post : {id: number; content: string; authorUsername: string}) => {
        const quote = BuildQuote(post.content ?? "", post.authorUsername)
        setReply(prev => (prev ? `${prev}\n${quote}` : quote))
        setReplyParentId(post.id);
    }
    const handleDeleted = (id:number) => {
        setPosts(prev => prev.filter(p => p.id !== id))
    }
    const handleUpdated = (updated: Post) => {
        setPosts(prev => prev.map(p => (p.id === updated.id ? {...p, ...updated} : p)))
    }
    const bg2 = darkMode ? "#000000e8" : "#ffffff";
    const color = darkMode ? "white" : "black";
    const bg3 = darkMode ? "#363a42" : "#ffffff";
    return(
        <div className="min-vh-100 z-1" style={{ background: bg2}}>
            {!loggedIn && (
                <div className="container pt-5">
                <div className=" align-items-center justify-content-center border homepage_bg pt-4" style={{height: "270px"}} >
                <p className="fw-semibold fs-2">Welcome to the Forum</p>
                <div className="d-flex justify-content-center  fw-light">
                    <p className="text-align w-50 ">Register a free account today to become a member! 
                        Once signed in, you'll be able to participate on this site by adding your own topics and posts.
                    </p>

                </div>
                <div className="d-flex justify-content-center">
                    <button className="border-1 px-3 py-2 mt-2  me-5 fs-6 fw-normal opacity-75" style={{color: "black"}}><FontAwesomeIcon icon={faPlus}/>Register</button>
                    <button className="border-1 px-3 py-2 mt-2  me-5 fs-6 fw-normal text-white border-2" style={{color: "black", backgroundColor: "#272a30"}}><FontAwesomeIcon icon={faKey}/>Log in</button>
                </div>
                </div>
                </div>
            )}
            <br/>
            <div className="d-flex justify-content-between text-white  fs-5 mx-auto  container"  >
                <div className="border-1 border  home_tool w-100 align-items-start d-flex ps-3">
                <p className="fs-5 fw-normal  mt-2">
                    <Link to="/" className="a123 text-decoration-none bg-gradient ">Home </Link>
                    <FontAwesomeIcon icon={faChevronRight}  /><Link to="/" className="a123 text-decoration-none bg-gradient">Forums </Link>
                    <FontAwesomeIcon icon={faChevronRight}/><Link to={`/forum/${forum?.id}`} className="a123 text-decoration-none bg-gradient">{forum?.title}</Link>
                    <FontAwesomeIcon icon={faChevronRight}/><Link to={`/threads/${id}`} className="a123 text-decoration-none bg-gradient">{thread?.title}</Link>
                    </p>
                </div>
            </div>
            <br/>
            <div className="d-flex justify-content-start text-white  fs-5 mx-auto  container "   >
                <div className="border-1  home_tool2 w-100 align-items-start d-flex ps-3 py-3">
                <p className="fs-4  mt-2 fw-normal w-100 d-flex text-wrap " style={{lineHeight: "1.2"}}>{thread?.title}</p>
                <div className="d-flex justify-content-end align-items-end w-100 pe-5">
                    
                </div>
                </div>
                                                    
            </div>
            <div className="d-flex align-items-start text-white fs-5 mx-auto container mt-4 w-100 ">
                <div className={`d-flex ${panelBg} w-100 `}>
                <div className={`d-flex  flex-column align-items-center border-1  p-3`}>
                    <img src={thread?.authorProfileImageUrl} className="avatar " style={{height: "85px", width:"85px"}}/>
                    
                    <span className={` w-100 px-3 text-wrap ${darkMode ? 'text-white' : 'text-dark'} small`} >
                        <button className={`border-0 bg-transparent ${darkMode ? 'text-white' : 'text-dark'} mb-3 fw-bold fs-6` } onClick={() => fetchId(thread?.authorUsername!)}>
                            {thread?.authorUsername}
                        </button>
                    </span>
                    <span>
                        <UserReputation username={thread?.authorUsername!}/>
                    </span>
                </div>

                <div className="flex-grow-1 d-flex" style={{color: color}}>
                    {thread?.content ? (
                        <div className="d-flex flex-column align-items-start justify-content-start">
                            <div className="d-flex">
                                <p className="fs-6 mt-2">{formatWhen(thread?.createdAt!)}</p>
                            </div>
                            <div className="d-flex">
                                {thread?.videoKey && (
                                    <video src={thread?.videoUrl!} controls width="400" height="400"/>
                                )}
                                {thread?.imageKey && (
                                    <img src={thread?.imageUrl!} width="400" height="400"/>
                                )}
                                
                            
                            </div>
                        <p className=" fs-5">{thread?.content}</p>
                        <div className="d-flex align-items-end justify-content-end flex-column flex-grow-1 ">
                            <p className="fs-6">Total Likes: {thread?.likeCount}</p>
                        </div>
                        <div className="d-flex gap-2">
                            <button className={`border-0 ps-2 py-2 rounded-2 fs-6 bg-danger ${darkMode ? 'text-white' : 'text-black'} mb-3`} style={{backgroundColor: bg3}}
                                onClick={() => DeleteThread(parseInt(id!))}
                            >
                                <FontAwesomeIcon icon={faTrash}/> Delete
                            </button>
                            <button className={`border-0 ps-2 py-2 rounded-2 fs-6 bg-info px-2 ${darkMode ? 'text-white' : 'text-black'} mb-3`} style={{backgroundColor: bg3}}
                                onClick={open}
                            >
                                <FontAwesomeIcon icon={faEdit}/> Edit
                            </button>
                            
                        </div>
                        </div>
                    ) : (
                        <>
                        <div className="d-flex flex-column align-items-start justify-content-start" >
                            <div className="d-flex">
                                <p className="text-bg-gradient fs-6 mt-2">{formatWhen(thread?.createdAt!)}</p>
                            </div>
                        <div className="d-flex">
                            {thread?.videoKey && (
                                 <video src={thread?.videoUrl!} controls width="400" height="400"/>
                            )}
                            {thread?.imageKey && (
                                <img src={thread?.imageUrl!} width="400" height="400"/>
                            )}
                            
                        
                        </div>
                        
                        <p className=" fs-6">{thread?.title}</p>
                        <div className="d-flex align-items-end justify-content-end flex-column flex-grow-1 ">
                            <p className="fs-6">Total Likes: {thread?.likeCount}</p>
                        </div>
                        <div className="d-flex gap-2">
                            <button className={`border-0 ps-2 py-2 rounded-2 fs-6 bg-danger ${darkMode ? 'text-white' : 'text-black'} mb-3`} style={{backgroundColor: bg3}}
                                onClick={() => DeleteThread(parseInt(id!))}
                            >
                                <FontAwesomeIcon icon={faTrash}/> Delete
                            </button>
                            <button className={`border-0 ps-2 py-2 rounded-2 fs-6 bg-info px-2 ${darkMode ? 'text-white' : 'text-black'} mb-3`} style={{backgroundColor: bg3}}
                                onClick={open}
                            >
                                <FontAwesomeIcon icon={faEdit}/> Edit
                            </button>
                            
                        </div>
                        </div>
                        
                        </>
                    )}
                    
                </div>
                
                <div className="d-flex align-items-end justify-content-end mx-2">
                    <div className="me-2">
                        
                        <button className={`border-0 px-2 py-2 rounded-2 fs-6 bg-primary ${darkMode ? 'text-white' : 'text-dark'} mb-3`} 
                        style={{backgroundColor: bg3}}
                        onClick={() => {
                            if(like)
                                likeButton(thread?.id!, 0)
                            else    
                                likeButton(thread?.id!,1)
                        }}
                        >
                            {like ? 
                            <>
                            <FontAwesomeIcon icon={faThumbsDown}/>Unlike
                            </>: <>
                             <FontAwesomeIcon icon={faThumbsUp}/>Like
                            </>}
                        
                    </button>
                    </div>
                    <div>
                        <button className={`border-0 px-2 py-2 rounded-2 fs-6 ${darkMode ? 'text-white' : 'text-black'} mb-3`} style={{backgroundColor: bg3}}
                        onClick={replyButton}
                        >
                        <FontAwesomeIcon icon={faReply}/>Reply
                        </button>
                    </div>
                    
                </div>
                </div>
                <EditThreadModal
                                show={show}
                                onClose = {close}
                                onSubmit={submitThread}
                                initial= {{
                                    title: thread?.title,
                                    content: thread?.content,
                                    imageUrl: thread?.imageUrl ?? null,
                                    videoUrl: thread?.videoUrl ?? null
                                }}
                            />
            </div>
            {posts.map((p) =>(
                <PostCard key={p.id} post={p} onReply={replyToPost} onDeleted={handleDeleted} onUpdated={handleUpdated}/>
            ))}
            <div className="d-flex align-items-start text-white fs-5 mx-auto container mt-4 w-100">
                <div className={`d-flex ${panelBg} w-100`}>
                    <div className={`d-flex flex-column align-items-center border-1 p-3`}>
                        <img src={user?.profileImageUrl!} className="avatar " style={{height: "85px", width:"85px"}}/>
                        <span className={` w-100 px-3 text-wrap ${darkMode ? 'text-white' : 'text-dark'} small`} >
                        <button className={`border-0 bg-transparent ${darkMode ? 'text-white' : 'text-dark'} mb-3 fw-bold fs-6` } onClick={() => fetchId(user?.username!)}>
                            {user?.username}
                        </button>
                    </span>
                    <span>
                        <UserReputation username={user?.username!}/>
                    </span>
                    </div>
                    <div className="flex-grow-1 d-flex " style={{color:color}}>
                        <Form onSubmit={(e) => {
                            e.preventDefault();
                            submitPost()
                            }} className="mt-4 w-100 ">
                            <div className="w-100 justify-content-center align-items-center d-flex flex-column me-3">
                            <textarea
                                className="bg-dark-subtle form-control mb-4"
                                rows={5}
                                placeholder="Write a post"
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                            /></div>
                            <div className="d-flex align-items-start justify-content-start ">
                                <div className="border px-2 py-2 border-opacity-25">
                                    <label htmlFor="upload" style={{cursor: "pointer"}}>
                                        <FontAwesomeIcon icon={faImage}/>
                                        <span className={`${darkMode ? 'text-white' : 'text-dark'} fs-6 ps-2 fw-bold`}>Attach files</span>
                                    </label>
                                    <input 
                                        id="upload"
                                        type="file"
                                        accept="image/,video/*"
                                        style={{display: "none"}}
                                        onChange={(e:React.ChangeEvent<HTMLInputElement>) => {
                                            const file = e.target.files?.[0] ?? null;
                                            handleFileChange(file);
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="d-flex">
                                {imagePreview && (
                                    <div className="d-flex position-relative ps-1 justify-content-center align-items-center" style={{maxWidth: "300px"}}>
                                        <img src={imagePreview} alt="preview" className="img-fluid rounded mt-3"/>
                                        <button 
                                            type="button"
                                            className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                            onClick={clearPreviews}
                                            style={{transform: 'translate(50%,-50%)', borderRadius: '50%'}}
                                        >
                                            <FontAwesomeIcon icon={faXmark}/>
                                        </button>
                                    </div>
                                )}
                                {videoPreview && (
                                    <div className="position-relative ps-1  " style={{maxWidth: "400px"}}>
                                        <video src={videoPreview} controls preload="metadata" style={{maxWidth: "400px", maxHeight: 420}} className="mt-1"/>
                                        <Button size="sm" variant="outline-secondary" className="btn btn-sm btn-danger position-absolute top-0"
                                            onClick={clearPreviews}
                                            style={{transform: "translate(0%, -50%)", borderRadius: "50%"}}
                                        ><FontAwesomeIcon icon={faXmark}/></Button>
                                    </div>
                                )}
                            </div>
                            <div className="d-flex align-items-end justify-content-end mb-2 gap-2">
                            <button type="submit" className="btn btn-primary me-1 p-2">
                                <FontAwesomeIcon icon={faReply}/>
                                Post
                            </button>
                            <button type="button" className="btn btn-secondary"
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>
                            </div>
                        </Form>
                    </div>
                </div>
                
            </div>
            <footer className="text-muted">
                lol
            </footer>
        </div>
    )
}
export default ThreadPage;