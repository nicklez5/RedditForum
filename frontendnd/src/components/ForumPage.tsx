import React, {useState, useEffect} from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {useStoreActions, useStoreState} from "../interface/hooks";
import { useTheme } from "./ThemeContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faClipboard, faKey, faPlus } from "@fortawesome/free-solid-svg-icons";
import { Form } from "react-bootstrap";
import CommentBox from "./CommentBox";
import api from "../api/forums";
import { formatWhen } from "../utils/dates";
import { Post } from "../interface/PostModel";
import CreateForumModal from "./CreateForumModal";
import { CreateForumDto, EditForumDto } from "../interface/ForumModel";
import { CreateThreadDto } from "../interface/ThreadModel";
import CreateThreadModal from "./CreateThreadModal";
import EditForumModal from "./EditForumModal";

const ForumPage = () => {
    const navigate = useNavigate();
    const fetchForumId = useStoreActions((a) => a.forum.GetForumById);
    const forum = useStoreState((s) => s.forum.selectedForum);
    const {darkMode} = useTheme();
    const {id} = useParams();
    const bg2 = darkMode ? "#000000e8" : "#ffffff";
    const color = darkMode ? "white" : "black";
    const threads_list = useStoreState((s) => s.thread.threads);
    const loggedIn = useStoreState((s) => s.user.loggedIn);
    const [show, setShow] = useState(false);
    const [show2, setShow2] = useState(false);
    const open = () => setShow(true);
    const close = () => setShow(false);
    const open2 = () => setShow2(true);
    const close2 = () => setShow2(false);
    const deleteForum = useStoreActions((a) => a.forum.DeleteForum);
    const createThread = useStoreActions((a) => a.thread.CreateThread)
    const editForum = useStoreActions((a) => a.forum.EditForum);
    const Username = useStoreState((s) => s.user.Profile?.username);

    const handleSubmit = async(data: {title: string, content: string, image?: File | null, video? : File| null, forumId: number}) => {
            if(!loggedIn)
                return;
            const dto: CreateThreadDto ={
                title: data.title,
                content: data.content,
                image: data.image,
                video: data.video,
                forumId : data.forumId,
            }
            await createThread(dto);
    }
    const handleSubmit2 = async(data: {title: string, description: string, iconFile? : File | null; removeIcon: boolean}) => {
        if(!loggedIn)
            return;
        const dto: EditForumDto = {
            id: id!,
            title: data.title,
            description: data.description,
            iconFile: data.iconFile,
            removeIcon: data.removeIcon,
        }
        await editForum(dto);
        fetchForumId(parseInt(id!));
    }

    useEffect(() => {
        if(id){
            fetchForumId(parseInt(id))
            console.log(forum);
        }
    },[])
    const fetchthread = useStoreActions((a) => a.thread.GetAllThreadsByForum);
    useEffect(() => {
        if(id){
            fetchthread(parseInt(id))
            console.log(threads_list)
        }
        
    },[])
    const [showCommentBox, setShowCommentBox] = useState(false);
    const panelBg = darkMode ? "bg-dark" : "bg-body-secondary";
    const threads = forum?.threads;
    const fetchId = async(username: string) => {
        try{
            const {data} = await api.get(`/api/account/${username}`, {allowAnonymous : true});
            navigate(`/profile/${data.id}`)
        }catch(err){
            console.error("Failed to resolve user:", err)
        }
    }
    //const posts = threads_list![1].posts ?? []
    //console.log(posts)
    function getLatestReply(thread: Post): Post | null {
        let latest: Post | null = null;
        const stack: Post[] = [...(thread.replies ?? [])];

        while (stack.length) {
            const p = stack.pop()!;
            if (!latest || p.createdAt  > latest.createdAt) {
            latest = p;
            }
            if (p.replies?.length) stack.push(...p.replies);
        }
        return latest;
        }
    const DeleteForum = async(id: number) => {
        await deleteForum(id);
        navigate("/")
    }
    const options = {weekday : 'long', year : 'numeric', month: "long", day: "numeric"} as const
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
                        <p className="fs-5 fw-normal  mt-2"><Link to="/" className="a123 text-decoration-none bg-gradient ">Home </Link><FontAwesomeIcon icon={faChevronRight}  /><Link to="/" className="a123 text-decoration-none bg-gradient">Forums </Link><FontAwesomeIcon icon={faChevronRight}/><Link to={`/forum/${id}`} className="a123 text-decoration-none bg-gradient">{forum?.title}</Link></p>
                       </div>
            </div>
             <br/>
                    <div className="d-flex justify-content-between text-white  fs-5 mx-auto  container "  >
                       <div className="border-1 border home_tool2 w-100 align-items-center d-flex ps-3 gap-3 overflow-hidden">
                        <img src={forum?.iconUrl} className="avatar"/>
                        <p className="fs-3  mt-2 fw-bold text-nowrap">{forum?.title}</p>
                        
                        <div className="d-flex justify-content-end align-items-end w-100 pe-2 gap-2">
                            <button className="border-2 rounded-5 text-white p-2 border-success" 
                            style={{backgroundColor: "green"}}
                            onClick={open}
                            >
                            <FontAwesomeIcon icon={faClipboard}/>
                                Post Thread
                            </button>
                            {Username === forum?.author  && (
                                <>
                                <button className="border-2  rounded-5 text-white p-2 border-danger bg-danger" 
                                style={{backgroundColor: "green"}}
                                onClick={() => DeleteForum(parseInt(id!))}
                                >
                                <FontAwesomeIcon icon={faClipboard}/>
                                Delete Forum
                                </button>
                                <button className="border-2 text-white rounded-5 p-2 border-primary bg-primary" 
                                style={{backgroundColor: "green"}}
                                onClick={open2}
                                >
                                <FontAwesomeIcon icon={faClipboard}/>
                                Edit Forum
                                </button>
                                </>
                            )}
                            
                       </div>
                       </div>
                       
                       
                    </div>
        <CreateThreadModal 
            show={show}
            onClose={close}
            onSubmit={handleSubmit}
            />
        <EditForumModal
            show={show2}
            onClose={close2}
            onSubmit={handleSubmit2}
            initial= {{
                title: forum?.title,
                description: forum?.description,
                iconUrl: forum?.iconUrl,

            }}
            />
        <br/>
        <div className="d-flex justify-content-between text-white  fs-5 mx-auto  container " style={{height: "65px"}} >
                       <div className="border-1 border home_tool3 w-100 align-items-center d-flex ps-3">
                        
                        <div className="d-flex justify-content-end align-items-end w-100 pe-5">
                            <div className="dropdown" >
                                <button className="dropdown-toggle border-0 bg-transparent" data-bs-toggle="dropdown" aria-expanded="false" style={{color: color}}>
                                    Filters
                                </button>
                                <ul className="dropdown-menu" style={{height: "105px"}}>
                                    <button className="w-100  border-0 shadow-md">Random</button>
                                    <button className="w-100  border-0 shadow-md">Newest</button>
                                    <button className="w-100  border-0 shadow-md">Hottest</button>
                                </ul>
                            </div>
                            
                       </div>
                       </div>
                            
        </div>
        <div className="d-flex justify-content-between text-white fs-5 mx-auto container">
            <div className="border-1 border home_tool2 w-100 align-items-center d-flex ">
                <CommentBox forumId={parseInt(id!)} authorIcon={forum?.authorIcon!}/>
            </div>
        </div>
        {threads_list?.map((thd) => {
            const LastPost = thd.latestReply;
            //console.log(posts);
            
            return (
                <div className={`d-flex justify-content-end text-white mx-auto  container `}>
                    <div className={`d-flex align-items-center border border-1 w-100 ${panelBg} p-3`}>
                        <img src={thd.authorProfileImageUrl} className="avatar" />
                        <div className={`d-flex align-items-start flex-column w-25  px-3 text-wrap ${darkMode ? 'text-white' : 'text-dark'}`} >
                        <Link to={`/threads/${thd.id}`} className="text-decoration-none text-truncate overflow-hidden">
                        <span className="d-block fw-bold text-wrap">{thd.title}</span>
                        </Link>
                        <button onClick={() => fetchId(thd.authorUsername)} className={`border-0 bg-transparent ${darkMode ? 'text-white' : 'text-dark'}`}>
                            <p className="fs-6 mb-1 text-nowrap border-0 fw-bold">{thd.authorUsername}<span className="fs-6 mx-3 fw-light"> {formatWhen(thd.createdAt)}</span> </p>
                            
                        </button>
                        
                        </div>
                        <div className="d-flex w-100 justify-content-end align-items-end">
                            {/* Stats */}
                            <div
                            className={`w-25 px-3 ${darkMode ? "text-white" : "text-dark"}`}
                            style={{ fontVariantNumeric: "tabular-nums" }}
                            >
                            <div className="d-flex justify-content-between">
                                <span className={`${darkMode ? 'text-white' : 'text-muted'}`}>Replies:</span>
                                <span className="fw-bold text-end">{thd.postCount}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span className={`${darkMode ? 'text-white' : 'text-muted'}`}>Likes:</span>
                                <span className="fw-bold text-end">{thd.likeCount}</span>
                            </div>
                            </div>

                            {/* Right meta */}
                            <div className="d-flex justify-content-end align-items-end">
                            <div className={`d-flex flex-column ${darkMode ? "text-white" : "text-dark"}`} style={{ width: 220 }}>
                                {LastPost ? (
                                <>
                                    <p className="fs-6 fw-bold mb-1 text-truncate">{formatWhen(LastPost.createdAt)}</p>
                                    <button
                                    className={`border-0 bg-transparent ${darkMode ? "text-white" : "text-dark"} p-0`}
                                    onClick={() => fetchId(LastPost.authorUsername)}
                                    >
                                    {LastPost.authorUsername}
                                    </button>
                                </>
                                ) : (
                                <>
                                    <p className="fs-6 fw-bold mb-1 text-truncate">{formatWhen(thd.createdAt)}</p>
                                    <button
                                    className={`border-0 bg-transparent ${darkMode ? "text-white" : "text-dark"} p-0`}
                                    onClick={() => fetchId(thd.authorUsername)}
                                    >
                                    {thd.authorUsername}
                                    </button>
                                </>
                                )}
                            </div>
                            </div>
                            </div>
                    </div>

                </div>
                
            )
        })}
    <br/>
    <footer className="text-white d-flex ">
        
    </footer>
        </div>
        
    )
}
export default ForumPage;