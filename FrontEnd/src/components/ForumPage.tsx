import React, {useEffect , useState} from "react";
import { useParams, Link, useNavigate} from "react-router-dom"
import { useStoreActions, useStoreState } from "../interface/hooks";
import {Spinner, Card, Dropdown, Button} from "react-bootstrap";
import ThreadCard from "./ThreadCard";
import { useTheme } from "./ThemeContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments, faPlus } from "@fortawesome/free-solid-svg-icons";
import useVisitTracker from "../hooks/useVisitTracker";
import api from "../api/forums";
const ForumPage = () => {
    const navigate = useNavigate();
    const {darkMode} = useTheme();
    const {id} = useParams();
    const userId = useStoreState((s) => s.user.Id);
    const threads = useStoreState((s) => s.thread.threads);
    const loading = useStoreState((s) => s.thread.loading);
    const error = useStoreState((s) => s.thread.error);
    const fetchForumById = useStoreActions((a) => a.forum.GetForumById);
    const [sortBy, setSortBy] = useState("new");
    const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
    const fetchThreads = useStoreActions((a) => a.thread.SearchByForumFilterThread);
    const selectedForum = useStoreState((s) => s.forum.selectedForum);
    const {Subscribed, UnSubscribeForum, SubscribeForum} = useStoreActions((a) => a.forum);
    useEffect(() => {
        if(id){
            fetchThreads({sortBy,id})
            fetchForumById(parseInt(id))
            if(userId){
                (async() => {
                    const result = await Subscribed(parseInt(id));
                    setIsSubscribed(result);
                })();
            }
        }
    },[fetchThreads, sortBy,fetchForumById, userId, id])
    useVisitTracker({ type: "forum", id: Number(id)})
    const handleSortChange = (sort: string | null) => {
        if(!sort) return;
        setSortBy(sort);
    }
    const handleSubscribeToggle = async () => {
        if(id){
            if(isSubscribed){
                await UnSubscribeForum(parseInt(id))
                setIsSubscribed(false);
            }else{
                await SubscribeForum(parseInt(id))
                setIsSubscribed(true);
            }
            fetchForumById(parseInt(id))
        }
        
    }
    const handleClick = () => {
        navigate(`/postThread/${id}`)
    }
    const bg = darkMode ? "#212529" : "#ffffff";
    const color = darkMode ? "white" : "black";
    if(loading) return <Spinner animation="border" />
    if(error) return <div className="text-danger">Error: {error}</div>
    const API_BASE = (process.env.REACT_APP_API_BASE_URL || '').replace(/\/$/, '');
    const fetchId = async(username: string) => {
    try{
      const { data} = await api.get(`/api/account/${username}`);
      navigate(`/activity/${data.id}`)
    }catch(err){
      console.error("Failed to resolve user:", err);
    }
  }
    const toAbs = (u: string) =>
    /^https?:\/\//i.test(u) ? u : `${API_BASE}/${u}`.replace(/([^:]\/)\/+/g, '$1');
    return (
        <div>
            <div style={{backgroundColor: bg, color: color}}>
                <div className="position-relative" style={{height: '160px', overflow: "hidden"}}>
                    <img src={toAbs(selectedForum?.bannerUrl!)} alt="" style={{height: "100%",width:"100%",objectFit: "cover"}} />
                    <div className="container d-flex justify-content-between align-items-center position-absolute" style={{bottom: "-36px", left: "50%", transform: 'translateX(-50%)', zIndex: 2,  paddingLeft: '1rem', maxWidth: "900px" , width: '100%', paddingRight: "1rem"}}>
                        <div className="d-flex align-items-center">
                        <img
                            src={toAbs(selectedForum?.iconUrl!)}
                            alt="icon"
                            style={{
                            width: "96px",
                            height: "96px",
                            borderRadius: "50%",
                            border: "4px solid var(--bs-body-bg)",
                            backgroundColor: "white", // white ring border
                            }}
                        />
                        <h4 className="ms-3 mb-0 fw-bolder">r/{selectedForum?.title!}</h4>
                    </div>
                </div>
                </div>
                <div style={{ height: "20px" }}></div>
                </div>
                <div className="position-relative">
                <div className="d-flex gap-2 justify-content-center  position-absolute top-0  start-50 pe-5 mb-1 ms-5 align-items-center">
                    <div className="ms-5 ps-3">
                        <div className="d-inline-block "><Button variant="outline-primary" className="rounded-pill p-1 ms-5 pe-2" style={{color: color, maxHeight: "60px"}} onClick={handleClick}><div className="d-flex align-content-center mb-1 h-100 fs-6 mt-1 rounded-pill pe-2"><FontAwesomeIcon icon={faPlus} className="flex-row mx-2 mt-1 fs-5"/> Create post </div></Button></div>
                    </div>    
                    
                    <Button variant={isSubscribed ? "outline-secondary" : "primary"} onClick={handleSubscribeToggle} disabled={isSubscribed === null} className="rounded-pill pe-3">{isSubscribed ? "Joined" : "Join"}</Button>
                    
                    </div>
                </div>
                <div className="d-flex justify-content-center mb-2 w-100 pe-5">
                
                <Dropdown onSelect={handleSortChange}>
                    <Dropdown.Toggle variant={darkMode ? "dark": "light"} id="dropdown-sort" className="position-relative top-50 start-50 translate-middle pe-xxl-5">
                        Sort: {sortBy.toUpperCase()}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item eventKey="new">New</Dropdown.Item>
                        <Dropdown.Item eventKey="hot">Hot</Dropdown.Item>
                        <Dropdown.Item eventKey="best">Best</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
            <div className="container d-flex">
        
            </div>
            {threads.length === 0 ? (
                <div className="container d-flex position-relative" style={{maxWidth: "900px"}}>
                    <div className="flex-grow-1 ms-5 ps-5 align-items-center top-0 end-0  position-absolute" style={{maxWidth: "800px"}}>
                        <div
                        className="ms-4 p-3 rounded"
                        style={{
                        width: "300px",
                        backgroundColor: darkMode ? "#1a1a1b" : "#f8f9fa",
                        color: darkMode ? "white" : "black",
                        border: "1px solid rgba(255,255,255,0.1)",
                        height: "fit-content"
                        }}
                    >
                        <h5>{selectedForum?.title}</h5>
                        <p>{selectedForum?.description}</p>
                        <hr />
                        <div>
                        <strong>{selectedForum?.users.length}</strong> Members<br />
                        <strong>3</strong> Online
                        </div>
                        <hr />
                        <strong>Moderators</strong>
                        <br/>
                        <img src={selectedForum?.authorIcon} className="avatar" />
                        <button>{selectedForum?.author}</button>
                        
                        <br/>
                        <div className="d-inline-block "><Link to={`/postThread/${id}`}><Button variant="outline-primary" className="rounded-pill p-1 ms-5" style={{color: color, maxHeight: "60px"}}><div className="d-flex align-content-center mb-1 h-100 fs-6 mt-1 rounded-pill pe-2"><FontAwesomeIcon icon={faPlus} className="flex-row mx-2 mt-1 fs-5"/> Create post </div></Button></Link></div>
                    </div>
                    </div>
                </div>
                
            ) : (
                <div className="container d-flex" style={{maxWidth: "1000px"}}>
                    <div className="flex-grow-1" style={{maxWidth: "800px"}}>
                    {threads.map(thread => (
                        <ThreadCard key={thread.id} thread={thread} darkMode={darkMode}/>
                    ))}
                    </div>
                     <div
                        className="ms-4 p-3 rounded"
                        style={{
                        width: "300px",
                        backgroundColor: darkMode ? "#1a1a1b" : "#f8f9fa",
                        color: darkMode ? "white" : "black",
                        border: "1px solid rgba(255,255,255,0.1)",
                        height: "fit-content"
                        }}
                    >
                        <h5>{selectedForum?.title}</h5>
                        <p>{selectedForum?.description}</p>
                        <hr />
                        <div>
                        <strong>{selectedForum?.users.length}</strong> Members<br />
                        <strong>3</strong> Online
                        </div>
                        <hr />
                        <strong>Moderators</strong>
                        <br/>
                        <div className="d-flex align-items-start gap-1">
                        <img src={selectedForum?.authorIcon} className="avatar" />
                        <div className="d-flex flex-column">
                             <button className="border-1 rounded-pill btn-outline-primary fw-bold" style={{backgroundColor: bg, color: color}} onClick={() => fetchId(selectedForum?.author!)}>{selectedForum?.author}</button>
                        </div>
                       
                        </div>
                        <br/>
                        <div className="d-inline-block "><Link to={`/postThread/${id}`}><Button variant="outline-primary" className="rounded-pill p-1 ms-1" style={{color: color, maxHeight: "60px"}}><div className="d-flex align-content-center mb-1 h-100 fs-6 mt-1 rounded-pill pe-2"><FontAwesomeIcon icon={faPlus} className="flex-row mx-2 mt-1 fs-5"/> Create post </div></Button></Link></div>
                    </div>
                </div>
            )}
        </div>
        
    )
}
export default ForumPage;