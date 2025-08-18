import React, {useState, useEffect} from "react";
import api from "../api/forums"
import { useStoreActions, useStoreState } from "../interface/hooks";
import { useTheme } from "./ThemeContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowAltCircleRight, faBicycle, faChevronRight, faClipboard, faComment, faKey, faMicrochip, faMicrophone, faNoteSticky, faPlus, faScaleBalanced, faSpa, faStaffSnake } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { formatWhen } from "../utils/dates";
import { CreateThreadDto } from "../interface/ThreadModel";
import CreateThreadModal from "./CreateThreadModal";
import { CreateForumDto } from "../interface/ForumModel";
import CreateForumModal from "./CreateForumModal";
import { Alert } from "react-bootstrap";
import { RegisterDto } from "../interface/UserModel";
import RegisterModal from "./Signup";
import {  useNavigate } from "react-router-dom";


const Home = () => {
    const navigate = useNavigate();
    const {darkMode} = useTheme();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const login = useStoreActions((a) => a.user.login);
    const fetchForums = useStoreActions((a) => a.forum.GetAllForums);
    const createForum = useStoreActions((a) => a.forum.CreateForum);
    const forums = useStoreState((s) => s.forum.forums);
    const bg = darkMode ? "#000000" : "#ffffff";
    const bg2 = darkMode ? "#000000e8" : "#ffffff";
    const loggedIn = useStoreState((s) => s.user.loggedIn);
    const register = useStoreActions((a) => a.user.register);
    const [show,setShow] = useState(false);
    const [show2,setShow2] = useState(false); 
    const [show3, setShow3] = useState(false);
    const open = () => setShow(true);
    const close = () => setShow(false);
    const open2 = () => setShow2(true);
    const close2 = () => setShow2(false);
    const open3 = () => setShow3(true);
    const close3 = () => setShow3(false);
    const createThread = useStoreActions((a) => a.thread.CreateThread);
    const error2 = useStoreState((s) => s.user.error);
    const [error,setError] = useState('');
    const message = useStoreState((s) => s.user.message);
    const setMessage = useStoreActions((a) => a.user.setMessage);
    useEffect(() => {
        fetchForums();
    },[])
    const handleSubmit = async(data: {title: string, content: string, image?: File | null, video? : File| null, forumId: number}) => {
        if(!loggedIn)
            return;
        if(data.title === ""){
            setError('Title is empty please enter a title')
            return;
        }
        if(data.forumId === undefined){
            setError("ForumID is undefined please select a forum")
            return;
        }
        const dto: CreateThreadDto ={
            title: data.title,
            content: data.content,
            image: data.image,
            video: data.video,
            forumId : data.forumId,
        }
        await createThread(dto);
    }
    const handleSubmit2 = async(data: {title: string, description: string, iconFile? : File | null}) => {
        if(!loggedIn)
            return;
        if(data.title === ""){
            setError("Title is empty please enter a title");
        }
        const dto: CreateForumDto = {
            title: data.title,
            description : data.description,
            iconFile: data.iconFile,
        }
        await createForum(dto);
    }
    const handleSubmit3 = async(data: {username: string, email: string, firstName: string, lastName: string, password: string, confirmPassword: string, role: string }) => {
        const dto: RegisterDto ={
            username: data.username,
            email: data.email,
            firstName : data.firstName,
            lastName: data.lastName,
            password: data.password,
            confirmPassword: data.confirmPassword,
            role: data.role
        }
        await register(dto);
    }
    const exclude = [
        "Announcements",
        "Productivity",
        "Fitness & Nutrition",
        "Mental Wellness",
        "Work–Life Balance",
        "Off Topic",
        "New Member Introduction"
    ]
    const include = [
        "Productivity",
        "Fitness & Nutrition",
        "Mental Wellness",
        "Work–Life Balance"
    ]
    const include2 = [
        "Announcements",
        "Off Topic",
        "New Member Introduction"
    ]
    const visible = forums.filter(f => !exclude.includes(f.title));
    console.log(visible);
    console.log(forums)
    const visible2 = forums.filter(f => include.includes(f.title))
    console.log(visible2);

    const visible3 = forums.filter(f => include2.includes(f.title))
    const tests = forums.filter((f) => f.title.toLowerCase() === "askreddit")
    const teststhreads = tests[0]?.threads ?? []
    const sorted123 = [...teststhreads].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const announcements = forums.filter((f) => f.title.toLowerCase() === "announcements")
    const threads = announcements[0]?.threads ?? []
    const sorted = [...threads].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    const options = {weekday : 'long', year : 'numeric', month: "long", day: "numeric"} as const
    const offtopic = forums.filter((f) => f.title.toLowerCase().replace(" ","") === "offtopic")
    const offtopics = offtopic[0]?.threads ?? []
    const sorted1 = [...offtopics].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    const introduction = forums.filter((f) => f.title.toLowerCase().replace(/\s+/g, "") === "newmemberintroduction")
    const introductions = introduction[0]?.threads ?? []
    const sorted2 = [...introductions].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

   

   
    return(
        <div className="min-vh-100 z-1" style={{height: "", background: bg2}}>
            {error !== "" && (
                <>
                <Alert variant="danger" dismissible>{error}</Alert>
                </>
            )}
            {error2 !== null && (
                <>
                <Alert variant="danger" dismissible>{error2}</Alert>
                </>
            )}
            {typeof message === "string" && (
            <Alert variant="success" dismissible onClose={() => setMessage(null)}>
                {message}
            </Alert>
            )}
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
                    <button className="border-1 px-3 py-2 mt-2  me-5 fs-6 fw-normal opacity-75" style={{color: "black"}} onClick={open3}><FontAwesomeIcon icon={faPlus}/>Register</button>
                    <button className="border-1 px-3 py-2 mt-2  me-5 fs-6 fw-normal text-white border-2" style={{color: "black", backgroundColor: "#272a30"}} onClick={() => navigate('/login')}><FontAwesomeIcon icon={faKey}/>Log in</button>
                </div>
            </div>
            </div>
            )}

        <br/>
        <RegisterModal
            show={show3}
            onClose={close3}
            onSubmit={handleSubmit3}
            />
        <div className="d-flex justify-content-between text-white  fs-5 mx-auto  container"  >
           <div className="border-1 border  home_tool w-100 align-items-start d-flex ps-3">
            <p className="fs-5 fw-normal  mt-2"><Link to="/" className="a123 text-decoration-none bg-gradient">Home </Link><FontAwesomeIcon icon={faChevronRight}  /></p>
           </div>
        </div>
        <br/>
        <div className="d-flex justify-content-between text-white  fs-5 mx-auto  container "  >
           <div className="border-1 border home_tool2 w-100 align-items-center d-flex ps-3">
            <p className="fs-3  mt-2 text-white ">Forum</p>
            <div className="d-flex justify-content-end align-items-end w-100 pe-5">
                <button className="border-2 border-0 rounded-4 text-primary p-2 bg-light" style={{backgroundColor: "grey"}}
                    onClick={open}
                >
                <FontAwesomeIcon icon={faClipboard}/>
                    Post Thread
                </button>
           </div>
           </div>
           
           <CreateThreadModal 
                show={show}
                onClose={close}
                onSubmit={handleSubmit}
                />
        </div>
        <br/>
        <div className="d-flex justify-content-between text-white  fs-5 mx-auto  container " >
            <div className="border-1 border w-100 align-items-center d-flex ps-3 " style={{background: "linear-gradient(90deg,rgba(2, 0, 36, 1) 0%, rgba(8, 7, 106, 1) 20%, rgba(3, 119, 187, 1) 53%, rgba(3, 130, 195, 1) 79%, rgba(0, 212, 255, 1) 100%)"}}>
               <p className="fs-4 mt-2"> General Discussion</p> 
            </div>
        </div>
        <br/>
        <div className="container px-3">
        {visible3.map((f) => {
            const teststhreads = f?.threads ?? []
            const sorted123 = [...teststhreads].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return (
                <>
                <div className="d-flex align-items-center px-3 py-2 border rounded-3  home_tool2">

                {/* LEFT: forum icon + info */}
                <div className="d-flex align-items-start gap-3 flex-grow-1 overflow-hidden" style={{ minWidth: 0 }}>
                    
                        {f.iconKey ? (
                            <>
                            <img src={f.iconUrl} className="avatar"/> 
                            </>
                        ) : 
                        <span className="p-3 rounded-circle d-inline-block" style={{backgroundColor: "#68084d"}}>
                        <FontAwesomeIcon icon={faScaleBalanced} />
                        </span>}


                    <div className="overflow-hidden" style={{ minWidth: 0 }}>
                    {/* forum title (ellipsis) */}
                    <Link to={`/forum/${f.id}`} className="d-block fw-bold text-decoration-none text-truncate text-start">
                        {f.title}
                    </Link>
                    {/* forum description (ellipsis) */}
                    <p className="mb-0 small text-body-secondary d-block text-truncate text-start">
                        {f.description}
                    </p>
                    </div>
                </div>

                {/* RIGHT: last thread preview (fixed width, never shifts) */}
                <div className="d-flex align-items-center gap-2 ms-3 flex-shrink-0" style={{ width: 360 }}>
                    <img
                    src={f?.authorIcon}
                    className="rounded-circle shadow-lg"
                    style={{ width: 40, height: 40, objectFit: "cover" }}
                    alt=""
                    />
                    <div className="overflow-hidden" style={{ minWidth: 0 }}>
                    <Link
                        to={`/threads/${sorted123[0]?.id?.toString()}`}
                        className="d-block text-decoration-none text-truncate text-start"
                        title={sorted123[0]?.title}
                    >
                        {sorted123[0]?.title}
                    </Link>
                    <div className="small text-nowrap text-start">
                        {formatWhen(sorted123[0]?.createdAt)}
                    </div>
                    </div>
                </div>
                </div>
                </>
            )
        })}
        </div>
        <br/>
       <div className="d-flex justify-content-between text-white  fs-5 mx-auto  container " >
            <div className="border-1 border w-100 align-items-center d-flex ps-3 " style={{background: "linear-gradient(90deg,rgba(2, 0, 36, 1) 0%, rgba(8, 7, 106, 1) 20%, rgba(3, 119, 187, 1) 53%, rgba(3, 130, 195, 1) 79%, rgba(0, 212, 255, 1) 100%)"}}>
               <p className="fs-4 mt-2">Lifestyle / Wellness</p> 
            </div>
        </div>
        <br/>
        <div className="container px-3">
        {visible2.map((f) => {
            const teststhreads = f?.threads ?? []
            const sorted123 = [...teststhreads].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return (
                <>
                <div className="d-flex align-items-center px-3 py-2 border rounded-3  home_tool2">

                {/* LEFT: forum icon + info */}
                <div className="d-flex align-items-start gap-3 flex-grow-1 overflow-hidden" style={{ minWidth: 0 }}>
                    
                        {f.iconKey ? (
                            <>
                            <img src={f.iconUrl} className="avatar"/> 
                            </>
                        ) : 
                        <span className="p-3 rounded-circle d-inline-block" style={{backgroundColor: "#68084d"}}>
                        <FontAwesomeIcon icon={faScaleBalanced} />
                        </span>}


                    <div className="overflow-hidden" style={{ minWidth: 0 }}>
                    {/* forum title (ellipsis) */}
                    <Link to={`/forum/${f.id}`} className="d-block fw-bold text-decoration-none text-truncate text-start">
                        {f.title}
                    </Link>
                    {/* forum description (ellipsis) */}
                    <p className="mb-0 small text-body-secondary d-block text-truncate text-start">
                        {f.description}
                    </p>
                    </div>
                </div>

                {/* RIGHT: last thread preview (fixed width, never shifts) */}
                <div className="d-flex align-items-center gap-2 ms-3 flex-shrink-0" style={{ width: 360 }}>
                    <img
                    src={f?.authorIcon}
                    className="rounded-circle shadow-lg"
                    style={{ width: 40, height: 40, objectFit: "cover" }}
                    alt=""
                    />
                    <div className="overflow-hidden" style={{ minWidth: 0 }}>
                    <Link
                        to={`/threads/${sorted123[0]?.id?.toString()}`}
                        className="d-block text-decoration-none text-truncate text-start"
                        title={sorted123[0]?.title}
                    >
                        {sorted123[0]?.title}
                    </Link>
                    <div className="small text-nowrap text-start">
                        {formatWhen(sorted123[0]?.createdAt)}
                    </div>
                    </div>
                </div>
                </div>
                </>
            )
        })}
        </div>
        <br/>
        <div className="d-flex justify-content-between text-white  fs-5 mx-auto  container " >
            <div className="border-1 border w-100 align-items-center d-flex ps-3 " style={{background: "linear-gradient(90deg,rgba(2, 0, 36, 1) 0%, rgba(8, 7, 106, 1) 20%, rgba(3, 119, 187, 1) 53%, rgba(3, 130, 195, 1) 79%, rgba(0, 212, 255, 1) 100%)"}}>
               <p className="fs-4 mt-2">AskReddit</p> 
               <div className="d-flex justify-content-end align-items-end w-100">
                <button className="me-5 p-2 border-0 rounded-4 bg-light text-primary" onClick={open2}>
                    <FontAwesomeIcon icon={faNoteSticky}/>
                    Add Forum
                    
                </button>
               </div>
            </div>
        </div>
        <CreateForumModal 
                show={show2}
                onClose={close2}
                onSubmit={handleSubmit2}
                />
        <br/>
        
        <div className="container px-3">
        {visible.map((f) => {
            const teststhreads = f?.threads ?? []
            const sorted123 = [...teststhreads].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return (
                <>
                <div className="d-flex align-items-center px-3 py-2 border rounded-3  home_tool2">

                {/* LEFT: forum icon + info */}
                <div className="d-flex align-items-start gap-3 flex-grow-1 overflow-hidden" style={{ minWidth: 0 }}>
                    
                        {f.iconKey ? (
                            <>
                            <img src={f.iconUrl} className="avatar"/> 
                            </>
                        ) : 
                        <span className="p-3 rounded-circle d-inline-block" style={{backgroundColor: "#68084d"}}>
                        <FontAwesomeIcon icon={faScaleBalanced} />
                        </span>}


                    <div className="overflow-hidden" style={{ minWidth: 0 }}>
                    {/* forum title (ellipsis) */}
                    <Link to={`/forum/${f.id}`} className="d-block fw-bold text-decoration-none text-truncate text-start">
                        {f.title}
                    </Link>
                    {/* forum description (ellipsis) */}
                    <p className="mb-0 small text-body-secondary d-block text-truncate text-start">
                        {f.description}
                    </p>
                    </div>
                </div>

                {/* RIGHT: last thread preview (fixed width, never shifts) */}
                <div className="d-flex align-items-center gap-2 ms-3 flex-shrink-0" style={{ width: 360 }}>
                    <img
                    src={f?.authorIcon}
                    className="rounded-circle shadow-lg"
                    style={{ width: 40, height: 40, objectFit: "cover" }}
                    alt=""
                    />
                    <div className="overflow-hidden" style={{ minWidth: 0 }}>
                    <Link
                        to={`/threads/${sorted123[0]?.id?.toString()}`}
                        className="d-block text-decoration-none text-truncate text-start"
                        title={sorted123[0]?.title}
                    >
                        {sorted123[0]?.title}
                    </Link>
                    <div className="small text-nowrap text-start">
                        {formatWhen(sorted123[0]?.createdAt)}
                    </div>
                    </div>
                </div>
                </div>
                </>
            )
        })}
        </div>
        <footer>

        </footer>
        </div>

    )
}
export default Home;