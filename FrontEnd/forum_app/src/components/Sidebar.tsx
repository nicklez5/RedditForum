import {Navbar, Nav, Button, Alert} from "react-bootstrap"
import "bootstrap/dist/css/bootstrap.min.css";
import { useStoreActions, useStoreState } from "../interface/hooks";
import React, {useState, useEffect} from "react"
import { useNavigate, Link} from "react-router-dom"
import { useTheme } from "./ThemeContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse,faFire,faBars,faComputer,faPlus, faPerson, faUserTie, faArrowRight} from "@fortawesome/free-solid-svg-icons";
import EditForumModal from "./EditForumModal";
import { Forum } from "../interface/ForumModel";
import axios from "axios";
interface SidebarProps {
  open: boolean;
  onClose: () => void;
}
const Sidebar: React.FC<SidebarProps> = ({open, onClose}) => {
    const {darkMode } = useTheme();
    const navigate = useNavigate()
    const isAdmin = useStoreState((s) => s.admin.userIsAdmin);
    const forums = useStoreState((s) => s.forum.forums)
    const [selectedForum, setSelectedForum] = useState<Forum | null>(null);
    const [showModal , setShowModal] = useState(false);
    const fetchForums = useStoreActions((a) => a.forum.GetAllForums)
    const bg = darkMode ? "#212529": "#ffffff";
    const error = useStoreState((s) => s.forum.error);
    const [error1, setError] = useState('');
    const [showError, setShowError] = useState(false);
    const deleteForum = useStoreActions((a) => a.forum.DeleteForum);
    const editForum = useStoreActions((a) => a.forum.EditForum);
    const token = useStoreState((s) => s.user.token);
    useEffect(() => {
        fetchForums()
    },[])
    useEffect(() => {
        setShowError(!!error);
    },[error])
    const color = darkMode ? "white": "black"
    const buttoncolor = darkMode ? "#212529" : "#ffffff"
    const API_BASE = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");
    const toAbs = (u?: string) =>
    u ? (/^https?:\/\//i.test(u) ? u : `${API_BASE}/${u}`.replace(/([^:]\/)\/+/g, "$1")) : "";

    // …
  
        return (
        <div
        className={`sidebar ${open ? 'open' : ''}`}
        style={{
            top: "36px",
            width: open ? '290px' : '50px',
            transition: 'width 0.3s ease', 
            color: color,
            overflow: 'auto',
            background: bg,
            height: 'calc(100vh - 56px)',
            position: 'fixed',
            zIndex: 1040,
            borderRight:`1px solid ${darkMode ? '#cccccc4c' : '#ccc'}`,
        }}
        >
        <button
            onClick={onClose}
            className = "rounded-pill border-0 d-flex align-items-center justify-content-center p-2"
            style={{position: 'absolute', top: '45px', right: open ? '25px' : '17.5px', zIndex: 1050, backgroundColor: buttoncolor,color: color, transform: "translateX(50%)"}}
        >
            <FontAwesomeIcon icon={faArrowRight} className = "rounded-pill" style={{backgroundColor: buttoncolor, color: color, height: "25px", width: "25px", padding: "0.5rem"}}/>
        </button>
        {open && (
        <>
        
        {error1 && <Alert variant="danger" dismissible  show={showError}  onClose={() => setShowError(false)}>{error1}</Alert>}
        <ul className="nav flex-column p-3">
            <div className="p-3">
            <li><a href="/" className="nav-link ps-3 fs-6 my-2" style={{color: color}}><FontAwesomeIcon icon={faHouse} className="me-3"/>Home</a></li>
            <li><a href="/forums" className="nav-link ps-3 fs-6 my-2" style={{color: color}}><FontAwesomeIcon icon={faFire} className="me-3"/> Forums</a></li>
            <li><a href="/popular" className="nav-link ps-3 fs-6 my-2" style={{color: color}}><FontAwesomeIcon icon={faPerson} className="me-3"/> Popular</a></li>
            {token !== null ? (<>
            <li><a href="/explore" className="nav-link ps-3 fs-6 my-2" style={{color: color}}><FontAwesomeIcon icon={faComputer} className="me-3"/>Explore</a></li>
            {isAdmin === true ? 
                <li><a href="/admin" className="nav-link ps-3 fs-6 my-2" style={{color: color}}><FontAwesomeIcon icon={faUserTie} className="me-3" /> Admin</a></li> 
            :   <li><a href="/user" className="nav-link ps-3 fs-6 my-2" style={{color: color}}><FontAwesomeIcon icon={faUserTie} className="me-3" />User</a></li>}
            </>): <></>}
            </div>
            {token !== null ? (<>
            {/* more links */}
            <hr/>
            <div className="p-3">
            <li className="ms-3 fs-6">Custom Feed</li>
            <li><a href="/postThread" className="nav-link ps-3 fs-6" style={{color: color}}><FontAwesomeIcon icon={faPlus} className="me-3 mt-3" />Create a custom feed</a></li>
            </div>
            </>) : <></>}
            <hr/>
            <div className="p-3">
            <li className="ms-3">Communities</li>
            {token !== null ? (<>
            <li><a href="/postForum" className="nav-link ps-3" style={{color: color}}><FontAwesomeIcon icon={faPlus} className="me-3 mt-3" />Create a community</a></li>
            </>) : <div className="py-2"></div>}
            {forums.map(forum => (
                <>
                <li className="mt-2"><a href={`/forum/${forum.id}`} className="ms-3 text-decoration-none fs-6 fw-bold" style={{color: color}}><img src={toAbs(forum.iconUrl)} height="30px" className="avatar"/>r/{forum.title}</a></li>
                <button onClick={() => {
                    if(window.confirm("Are you sure you want to delete this item?")){
                        deleteForum(forum.id)} 
                    }} className="rounded-pill mt-2 bg-danger  text-white px-3">Delete</button>
                <button onClick={() => {
                    setSelectedForum(forum)
                    setShowModal(true);
                } } className="rounded-pill mt-2 bg-success text-white px-3 mx-4">Edit</button>
                </>
            ))}
            </div>
            
        </ul>
        </>
        )}
        {selectedForum && (
            <EditForumModal 
                forum={{
                    id: selectedForum.id.toString(),
                    title: selectedForum.title,
                    description: selectedForum.description,
                    iconUrl: selectedForum.iconUrl,
                    bannerUrl: selectedForum.bannerUrl
                }}
                show={showModal}
                onClose={() => setShowModal(false)}
            />
        )}   
        </div>
    );
}

export default Sidebar