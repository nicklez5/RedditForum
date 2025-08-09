import React, {useEffect, useState} from "react";
import { useNavigate, Link } from "react-router-dom";
import { Navbar, Nav, Container, Form, FormControl, Button} from "react-bootstrap"
import { useStoreActions, useStoreState } from "../interface/hooks";
import { useTheme } from "./ThemeContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon, faSearch, faComments, faRightFromBracket, faPlus, faBell,faEllipsis, faDoorOpen } from '@fortawesome/free-solid-svg-icons';
interface Props {
    toggleSidebar: () => void;
}
const Header = () =>{
    const logout = useStoreActions((a) => a.user.logout);
    const adminLogout = useStoreActions((a) => a.admin.setUserIsAdmin)
    const [unreadCount , setUnreadCount] = useState(0);
    const notifications = useStoreState((s) => s.user.Notifications)
    const fetchNotifications = useStoreActions((a) => a.user.fetchNotifications);
    const {darkMode, toggleDarkMode} = useTheme();
    const token = useStoreState((s) => s.user.token);
    const id = useStoreState((s) => s.user.Id);
    const profile = useStoreState((s) => s.user.Profile);
    const navigate = useNavigate();
    const [query,setQuery] = useState('')
    const searchForums = useStoreActions((actions) => actions.forum.SearchForum)
    const handleSearch = (e : any) => {
        e.preventDefault();
        if(query.trim()){
            searchForums(query)
            navigate(`/search?q=${encodeURIComponent(query)}`)
        }
    }
    const handleLogout = () => {
        logout();
        adminLogout(false);
        localStorage.clear();
        window.location.href = '/'
    }
    useEffect(() => {
        if(token){
            fetchNotifications()
        }
    },[token,fetchNotifications])

    useEffect(() => {
        setUnreadCount(notifications.filter(n => !n.isRead).length);
    },[notifications])
    
    const bg = darkMode ? "#212529" : "#ffffff";
    const color = darkMode ? "white" : "black";
    return(
        <Navbar bg={darkMode ? "dark" : "white"} expand="lg" className="navbar"  style={{zIndex: 1070, position: "sticky", top: "0"}}>
            <Container fluid>
                <Navbar.Brand as={Link} to="/" style={{color: color }} className="fw-bold">
                <img
                    src="https://www.redditstatic.com/desktop2x/img/favicon/apple-icon-180x180.png"
                    alt="Logo"
                    width="32"
                    height="32"
                    className="d-inline-block align-top"
                />{' '}
                Reddit
                </Navbar.Brand>
                <div className="d-flex justify-content-center align-items-center h-100 mt-0">
                    <Button variant="outline-secondary" onClick={toggleDarkMode} className={`theme-switcher-grid ${darkMode ? 'night-theme' : ''}`}>
                        <div className="sun" id="sun" aria-hidden="true"></div>
                        <div className="moon-overlay" id="moon-overlay" aria-hidden="true"></div>
                        <div
                        className="cloud-ball cloud-ball-left"
                        id="ball1"
                        aria-hidden="true"
                        ></div>
                        <div
                        className="cloud-ball cloud-ball-middle"
                        id="ball2"
                        aria-hidden="true"
                        ></div>
                        <div
                        className="cloud-ball cloud-ball-right"
                        id="ball3"
                        aria-hidden="true"
                        ></div>
                        <div
                        className="cloud-ball cloud-ball-top"
                        id="ball4"
                        aria-hidden="true"
                        ></div>
                        <div className="star" id="star1" aria-hidden="true"></div>
                        <div className="star" id="star2" aria-hidden="true"></div>
                        <div className="star" id="star3" aria-hidden="true"></div>
                        <div className="star" id="star4" aria-hidden="true"></div>
                        
                    </Button>
                    </div>
                <Navbar.Toggle aria-controls="basic-navbar-nav " />
                <Navbar.Collapse id="basic-navbar-nav">
                    <div className="d-flex justify-content-center mx-auto w-100">
                    <Form className="d-flex justify-content-between w-25" onSubmit={handleSearch}>
                    <div className="position-relative d-flex flex-md-fill ms-5">
                    <FormControl type="search" placeholder="Search" className="me-2 searchBar ps-5" style={{backgroundColor: bg, color: color}} value={query} onChange={(e) => setQuery(e.target.value)}/>
                    <FontAwesomeIcon
                        
                        icon={faSearch}
                        className="position-absolute top-50 start-0 translate-middle-y ms-3"
                        style={{ pointerEvents: 'none', color: color}}
                    />
                    </div>
                    <Button variant="outline-success" type="submit" className="d-none">Search</Button>
                    </Form>
                    </div>
                    
                    <div className="d-flex align-content-between gap-0">
                    {token !== null ? (<>
                    <div className="position-relative d-inline-block">
                        <Link to="/notifications"><Button variant="outline-secondary" className="rounded-pill p-3 border-0" style={{color: color}}><FontAwesomeIcon icon={faBell} /></Button>{unreadCount > 0 && (
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger mt-2" style={{ fontSize: '0.75rem' }}>
                                {unreadCount}
                                <span className="visually-hidden">unread notifications</span>
                            </span>
                        )}
                            </Link>

                    </div>
                    <div className="d-inline-block pb-2">
                        <Link to="/messages"><Button variant="outline-secondary" className="rounded-pill py-1 mt-2 border-0  px-4" style={{color: color}}><FontAwesomeIcon icon={faComments} className="rounded-pill mt-2"/></Button></Link>
                    </div>
                    <div className="d-inline-block pt-2">
                        
                        <Link to="/postThread"><Button variant="outline-secondary"  className="rounded-pill p-1 border-0" style={{color: color, maxHeight: "60px"}}><div className="d-flex align-content-center mb-1 h-100 fs-6 mt-1  rounded-pill"><FontAwesomeIcon icon={faPlus} className="flex-row mx-2  mt-1 fs-5"/>Create </div></Button></Link>
                    </div>
                    <div className="d-inline-block">

                        <div className="dropdown ">
                            <a className="btn btn-secondary dropdown-toggle border-0 rounded-pill  " href="/" role="button" data-bs-toggle="dropdown" aria-expanded="false" style={{backgroundColor: bg, color : color}}>
                                <div className="avatar-wrapper ">
                                <img src={profile?.profileImageUrl} alt="profile" style={{
                                                                                            width: '50px',
                                                                                            height: '40px',
                                                                                            borderRadius: '60%',
                                                                                            objectFit: 'fill',
                                                                                            }} className=" mx-1 rounded-pill shadow-lg"/>
                                </div>
                            </a>
                            <ul className="dropdown-menu  border shadow p-1" style={{backgroundColor: bg, color: color, transform: "translateX(-50px)", border: "1px solid rgba(255, 255, 255, 0.2)"}}>
                                <li><a className="dropdown-item px-3 py-2" href={`/profile/${id}`} >View Profile</a></li>
                                <li><a className="dropdown-item px-3 py-2" href={`/avatar/${id}`}>Edit Avatar</a></li>
                                <li><a className="dropdown-item px-3 py-2" href="/achievements">Achievements</a></li>
                                <li className="px-3 py-2">
                                    <div className="d-flex justify-content-center align-items-center h-100 mt-0">
                                    <Button variant="outline-secondary" onClick={toggleDarkMode} className={`theme-switcher-grid ${darkMode ? 'night-theme' : ''}`}>
                                        <div className="sun" id="sun" aria-hidden="true"></div>
                                        <div className="moon-overlay" id="moon-overlay" aria-hidden="true"></div>
                                        <div
                                        className="cloud-ball cloud-ball-left"
                                        id="ball1"
                                        aria-hidden="true"
                                        ></div>
                                        <div
                                        className="cloud-ball cloud-ball-middle"
                                        id="ball2"
                                        aria-hidden="true"
                                        ></div>
                                        <div
                                        className="cloud-ball cloud-ball-right"
                                        id="ball3"
                                        aria-hidden="true"
                                        ></div>
                                        <div
                                        className="cloud-ball cloud-ball-top"
                                        id="ball4"
                                        aria-hidden="true"
                                        ></div>
                                        <div className="star" id="star1" aria-hidden="true"></div>
                                        <div className="star" id="star2" aria-hidden="true"></div>
                                        <div className="star" id="star3" aria-hidden="true"></div>
                                        <div className="star" id="star4" aria-hidden="true"></div>
                                        
                                    </Button>
                                    </div>
                                </li>
                                <li><a className="dropdown-item px-3 py-2" ><Button variant="outline-secondary" as={Link as any} onClick={handleLogout} className="p-2 rounded-5 logout-btn " style={{color: color}}><FontAwesomeIcon icon={faRightFromBracket}/> Logout </Button></a></li>
                                <li><a className="dropdown-item px-3 py-2" href="/settings">Settings</a></li>
                            </ul>
                        </div>
                        
                    </div>
                    </>
                    ) : (
                        <>
                            <div className="d-inline-block">
                                {!token && (<Link to="/" className="btn rounded-pill py-3 px-4 login-btn2" style={{backgroundColor: "#DB3F29", color: "white", textDecoration: "none", fontWeight: "bold", whiteSpace: "nowrap", minWidth: "auto"}}>Log In</Link> )}
                            </div>
                            <div className='dropdown ms-2'>
                                <button className="btn btn-secondary login-btn dropdown-toggle rounded-circle mt-1 py-3 px-4 border-0" type="button" data-bs-toggle="dropdown" aria-expanded="false" style={{backgroundColor: bg, color: color}}>
                                        <FontAwesomeIcon icon={faEllipsis} />
                                </button>
                                        <ul className="dropdown-menu border shadow p-1" style={{backgroundColor: bg, color: color, transform: "translateX(-125px)", border: "1px solid rgba(255, 255, 255, 0.2)"}}>
                                            <li><a className="dropdown-item px-3 py-2" href="/"><FontAwesomeIcon icon={faDoorOpen} /> Log In / Sign Up</a></li>
                                        </ul>
                                
                            </div>
                        </>
                    )}
                    
                    
                    </div>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}
export default Header