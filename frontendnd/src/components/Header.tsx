import React, {useState, useEffect, ChangeEvent, HtmlHTMLAttributes, FormEvent, useRef} from "react";
import api from "../api/forums";
import { useStoreActions,useStoreState } from "../interface/hooks";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeContext";
import BG_Icon from "../Header2.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCoins, faHouse, faMessage, faMoon, faPlus, faShirt, faTrophy } from "@fortawesome/free-solid-svg-icons";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { faDoorOpen } from "@fortawesome/free-solid-svg-icons";
import { Form, FormControl, InputGroup, ListGroup } from "react-bootstrap";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import ReactSwitch from "react-switch";
import { CreateThreadDto, Thread } from "../interface/ThreadModel";
import CreateThreadModal from "./CreateThreadModal";
import { ForumSearchResult } from "../interface/ForumModel";
import { Post } from "../interface/PostModel";
const Header = () => {
    const navigate = useNavigate();
    const {darkMode, toggleDarkMode} = useTheme();
    const [unreadMsgs, setUnreadMsgs] = useState(0);
    const [unread, setUnread] = useState(0);
    const logOut = useStoreActions((a) => a.user.logout);
    //const fetchProfile = useStoreActions((a) => a.user.fetchProfile);
    const profile = useStoreState((s) => s.user.Profile);
    const notifications = useStoreState((s) => s.user.Notifications);
    const messages = notifications.filter((n) => n.type === "Message").filter((n) => n.isRead === false)
    const searchForm = useStoreActions((a) => a.forum.SearchForum);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [open2, setOpen2] = useState(false);
    const [active, setActive] = useState(-1);
    const [results4Thread ,setResults4Thread] = useState<Thread[]>([]);
    const [results4Post ,setResults4Post] = useState<Post[]>([]);
    const wrapRef = useRef<HTMLDivElement>(null);
    const [show, setShow] = useState(false);
    const open = () => setShow(true);
    const close = () => setShow(false);
    const createThread = useStoreActions((a) => a.thread.CreateThread);
    const [error, setError] = useState(null);
    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if(!wrapRef.current?.contains(e.target as Node)) setOpen2(false);
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    },[])
    const handleSearchChange = async(e: React.ChangeEvent<HTMLInputElement>) => {
        const q = e.target.value;
        setSearchTerm(q);
        if(q.trim().length < 2){
            setResults4Post([])
            setResults4Thread([])
            setOpen2(false);
            return;
        }
        try{
            const response = await api.get(`/api/forum/search?query=${encodeURIComponent(q)}`);
            const threads = response.data.threads;
            const posts = response.data.posts;
            setResults4Post(posts);
            setResults4Thread(threads);
            setError(null);
            setOpen2(true);
            setActive(-1);
        }catch(error: any){
            setError(error.message);
        }
       
        
    }
    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const total = results4Thread.length + results4Post.length;
        if (!open2 || total === 0) return;
        if(e.key === 'ArrowDown'){
            e.preventDefault();
            setActive(i => (i + 1) % total);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive(i => (i - 1 + total) % total);
        } else if (e.key === "Enter") {
            e.preventDefault();
                if (active < results4Thread.length) {
                const t = results4Thread[active];
                selectThread(t)
                // selectThread(t)
                } else {
                    const idx = active - results4Thread.length;
                    const p = results4Post[idx];
                    selectPost(p)
                    // selectPost(p)
                }
        }else if(e.key === "Escape"){
            setOpen2(false);
        }
    }
    const selectThread = (thread: Thread) => {
        setSearchTerm(thread?.title);
        setOpen2(false);
        navigate(`/threads/${thread.id}`)
    }
    const selectPost = (post: Post) => {
        setSearchTerm(post.content);
        setOpen2(false);
        navigate(`/threads/${post.threadId}`)
    }
    
    const handleSubmit = (event : FormEvent<HTMLFormElement>) =>{
        event.preventDefault();
        searchForm(searchTerm);
    }
    console.log(messages)
    
    const loggedIn = useStoreState((s) => s.user.loggedIn)
    const bg = darkMode ? "#2A3236" : "#ffffff";
    const color = darkMode ? "#ffffff": "#000000";
    const home_bg_icon = darkMode ? "#D93900" : "#ffffff";
    const id = useStoreState((s) => s.user.Id);
    useEffect(() => {
        setUnreadMsgs(messages.filter((n) => !n.isRead).length)
        setUnread(notifications.filter((n) => !n.isRead).length)
    })
    const handleSubmit2 = async(data: {title : string, content: string, image? :File | null, video? : File | null, forumId: number}) => {
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
    return(
        <div className="container-fluid p-0 ">
        <nav className="d-flex mx-auto w-100 border-1 py-2" style={{backgroundColor: bg, borderBottom: "2px solid grey" }}>
            <div className="align-items-start justify-content-start fs-2 mx-4 ">
                <a href="/" className={`text-decoration-none fs-4 fw-bold ${darkMode ? "text-white" : "text-global"}`}>
                   <FontAwesomeIcon icon={faHouse} style={{backgroundColor: home_bg_icon, borderRadius: "60%", border: "4px", height: "30px"}}/> Forum 
                </a>
            </div>
            
            <div className="align-items-center justify-content-end d-flex flex-grow-1 gap-1 ">
                <div className="position-relative d-flex justify-content-center">
                <Form>
                    <Form.Group controlId="searchFormInput">
                        <div ref={wrapRef} className="position-relative" style={{ width: 440 }}>
                        <InputGroup>
                        <span className="position-absolute top-50 start-0 translate-middle-y z-3 ps-2">
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                        </span>
                        <FormControl  
                            type="text" 
                            placeholder="Search Forum" 
                            value={searchTerm} 
                            onChange={handleSearchChange} 
                            onKeyDown={onKeyDown}
                            className="rounded-pill ps-5 fw-normal"
                            />
                        </InputGroup>
                        <ListGroup
                        className={`position-absolute w-100 ${open2 ? "" : "d-none"}`}
                        style={{ top: "calc(100% + 4px)", left: 0, zIndex: 1060, maxHeight: 280, overflowY: "auto" }}
                        role="listbox"
                        id="search-listbox"
                        >
                        {/* Empty state */}
                        {results4Thread.length === 0 && results4Post.length === 0 && (
                            <ListGroup.Item className="text-muted">No results</ListGroup.Item>
                        )}

                        {/* THREADS */}
                        {results4Thread.length > 0 && (
                            <>
                            <ListGroup.Item disabled className="text-uppercase small">Threads</ListGroup.Item>
                            {results4Thread.map((t, i) => {
                                const absIndex = i; // 0..threads-1
                                return (
                                <ListGroup.Item
                                    key={`t-${t.id}`}
                                    action
                                    active={active === absIndex}
                                    role="option"
                                    aria-selected={active === absIndex}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => selectThread(t)}
                                >
                                    <small className="text-muted me-2">Thread</small>
                                    {t.title}
                                </ListGroup.Item>
                                );
                            })}
                            </>
                        )}

                        {/* POSTS */}
                        {results4Post.length > 0 && (
                            <>
                            <ListGroup.Item disabled className="text-uppercase small mt-1">Posts</ListGroup.Item>
                            {results4Post.map((p, i) => {
                                const absIndex = results4Thread.length + i; // continue after threads
                                return (
                                <ListGroup.Item
                                    key={`p-${p.id}`}
                                    action
                                    active={active === absIndex}
                                    role="option"
                                    aria-selected={active === absIndex}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => selectPost(p)}
                                >
                                    <small className="text-muted me-2">Post</small>
                                    {p.content}
                                </ListGroup.Item>
                                );
                            })}
                            </>
                        )}
                        </ListGroup>
                        </div>
                    </Form.Group>
                    
                </Form>
                </div>
            </div>
            <div className="d-flex align-items-center justify-content-end fs-3 flex-grow-1 gap-2" >
            {loggedIn ? (
                <div className="d-flex mx-2 gap-1 fs-5 mt-2 pb-1 mb-1" >
                    <button className={`bg-transparent border-0  mx-2 extend_button ${darkMode ? 'text-white' : 'text-black'}`} 
                    onClick={() => navigate('/messages')}>
                        {unreadMsgs  > 0 && (
                            <span className="position-absolute ps-2 top-0 pt-2 z-1 badge rounded-pill bg-danger ms-3 mt-2" style={{fontSize: "0.75rem"}}>{unreadMsgs}</span>    
                        )}
                        
                        <FontAwesomeIcon icon={faMessage}/>
                    </button>
                    <button className={`bg-transparent border-0 extend_button ${darkMode ? 'text-white' : 'text-black'}`}  
                    onClick={open}
                    >
                        <FontAwesomeIcon icon={faPlus}/> Create</button>
                    <CreateThreadModal
                        show={show}
                        onClose={close}
                        onSubmit={handleSubmit2}
                        />
                    <button className={`bg-transparent border-0 mx-2 extend_button ${darkMode ? "text-white" : 'text-black'}`}
                        onClick={() => navigate('/notifications')}
                    >
                        {unread > 0 && (
                            <span className="position-absolute ps-2 top-0 pt-2 z-1 badge rounded-pill bg-danger ms-3 mt-2" style={{fontSize: "0.75rem"}}>{unread}</span>
                        )}
                        <FontAwesomeIcon icon={faBell}/>
                    </button>
                    <button className="rounded-circle bg-transparent border-0 extend_button" id="dropdownMenuButton" type="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <img src={profile?.profileImageUrl!} alt="profile" style={{
                            width: "50px",
                            height: "40px",
                            borderRadius: "60%",
                            objectFit: "fill"
                        }} className="mx-1 rounded-circle shadow-lg"/>
                    </button>
                    <div className="dropdown-menu px-3 "  aria-labelledby="dropdownMenuButton" style={{backgroundColor: bg, color: "white", height: "265px", width: "250px"}}>
                        <a className={`dropdown-item fs-5 ${darkMode ? 'text-white' : 'text-black'}`} href={`/profile/${id}`}>
                            <img src={profile?.profileImageUrl!} alt="profile" style={{
                                width: "50px",
                                height: "40px",
                                borderRadius: "60%",
                                objectFit: "fill"
                            }} className="mx-1 rounded-circle shadow-lg"/>
                            View Profile
                        </a>
                        <a className={`dropdown-item fs-5 ${darkMode ? 'text-white' : 'text-black'}`} href={`/avatar/${id}`}>
                            <FontAwesomeIcon icon={faShirt}/> Edit Avatar
                        </a>
                        <a className={`dropdown-item fs-5 ${darkMode ? 'text-white' : 'text-black'}`} href="/achievements">
                            <FontAwesomeIcon icon={faTrophy}/> Achievements
                        </a>
                        
                        <a className={`dropdown-item fs-5 ${darkMode ? 'text-white' : 'text-black'}`} href="#">
                            
                            <div className="switch">
                                <FontAwesomeIcon icon={faMoon}/>
                                <label>{darkMode === false ? "Light Mode" : "Dark Mode"}</label> 
                                <ReactSwitch onChange={toggleDarkMode} checked={darkMode === true}/>
                            </div>
                        </a>
                        <button className={`dropdown-item fs-5 ${darkMode ? 'text-white' : 'text-black'} `} onClick={() => logOut()}>
                            <FontAwesomeIcon icon={faDoorOpen}/>
                            Log out
                        </button>
                        
                        <a className={`dropdown-item fs-5 ${darkMode ? 'text-white' : 'text-black'}`} href="/settings">
                            <FontAwesomeIcon icon={faCoins}/>
                            Settings
                        </a>
                    </div>
                </div>

            ) : 
                <>
                <button className=" rounded-pill px-3 mb-1 pb-1 mt-1 button123" style={{border: "0px solid #D93900",borderColor: "#D93900",backgroundColor: "#D93900" }}>
                    <a href="/login" className="text-decoration-none text-white fs-6 fw-bold " style={{position: "relative",bottom: "4px"}}>Log In</a>
                </button>
                <div className="dropdown">
                <button className="rounded-pill px-3 mb-1 pb-1 mt-1 bg-transparent extend_button  " id="dropdownMenuButton" type="button" style={{border: "2px solid #2A3236"}} data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <FontAwesomeIcon icon={faEllipsis} className="border-0"/>
                </button>
                <div className="dropdown-menu px-3 " aria-labelledby="dropdownMenuButton" style={{backgroundColor: "#2A3236", color: "white"}}>
                    <a className="dropdown-item text-white" href="#">
                        <FontAwesomeIcon icon={faDoorOpen} className="border-0"/> Log In / Signup
                    </a>

                </div>
                </div>
                </>
            }
            </div>
        </nav>
        
        </div>
    )
}
export default Header;