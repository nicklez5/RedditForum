import {Card, Badge, Button} from "react-bootstrap"
import { Thread } from "../interface/ThreadModel"
import { formatDistanceToNow } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faCommentAlt, faArrowUp, faArrowDown, faComment } from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { useStoreActions, useStoreState } from "../interface/hooks";
interface Props{
    thread: Thread,
    darkMode: boolean
}
const ThreadCard: React.FC<Props> = ({ thread, darkMode}) => {
    const cardStyle = {
        backgroundColor: darkMode ?  "#3E4B58" : "#ffffff",
        color: darkMode ? "white": "black",
        borderRadius: "8px",
        padding: "12px 16px",
        marginBottom: "12px",
    }
    const fetchThread = useStoreActions((a) => a.thread.GetThreadById)
    const loggedIn = useStoreState((s) => s.user.loggedIn);
    const likeThread = useStoreActions((a) => a.thread.voteThread);
    const [voteCount, setVoteCount] = useState(thread.likeCount)
    const [userVote, setUserVote] = useState(0);
    const handleVote = async(vote: number) => {
        if(!loggedIn || !thread.id ) return;
        await likeThread({threadId: thread.id, voteValue: vote});
        if(userVote === vote){
            setUserVote(0);
            setVoteCount(voteCount - 1);
        }else{
            const diff = vote - userVote;
            setUserVote(vote);
            setVoteCount(voteCount + diff);
        }
        fetchThread(thread.id);
    }
    const bg = darkMode ? "#3E4B58" : "#ffffff";
    const color = darkMode ? "white" : "black";
    const formatted = formatDistanceToNow(new Date(thread.createdAt), {addSuffix: true})
    const API_BASE = (process.env.REACT_APP_API_BASE_URL || '').replace(/\/$/, '');
    useEffect(() => {
    console.log('ThreadCard image debug', {
        id: thread.id,
        imageUrl: thread.imageUrl,
        imageKey: (thread as any).imageKey,
        resolved: toAbs(thread.imageUrl ?? (thread as any).imageKey ?? ''),
    });
    }, [thread.id, thread.imageUrl]);
    const toAbs = (u: string) =>
    /^https?:\/\//i.test(u) ? u : `${API_BASE}/${u}`.replace(/([^:]\/)\/+/g, '$1');
    return (
        <NavLink to={`/threads/${thread.id}`} style={{textDecoration: "none", color: 'inherit'}} className="card-link-wrapper">
        <Card className="shadow-sm border-5 post-card" style={cardStyle}>
        <div className="d-flex flex-row align-items-center mb-1 gap-1">
            {/* <div className="small" style={{color: color}}>r/{thread.forumTitle} ° {formatted}</div> */}
            <img src={toAbs(thread.forumIconUrl)} className="avatar1" />
            <span className="small fw-semibold flex-col gap-1" style={{color: color}}>r/{thread.forumTitle} • {formatted}</span>  
        </div>
        <h5 className="mt-3 fw-bold">{thread.title}</h5>
        <div className="mb-2" style={{color:color}}>{thread.content}</div>
        <div>
            {thread.imageUrl && (
                <img src={toAbs(thread.imageUrl)} style={{width: "200px"}} />
            )}
        </div>
        <div>
            {thread.videoUrl && (
                <video width="400" controls>
                    <source src={toAbs(thread.videoUrl)} type={thread.videoContentType ?? "video/mp4"} />
                </video>
            )}
        </div>
        <div className="d-flex gap-3 text-muted small" onClick={(e) => e.stopPropagation()}>
                <div className={`rounded-pill align-items-center gap-2 px-3 py-1 vote-box d-flex ${userVote === 1 ? "upvoted" : userVote === -1 ? "downvoted" : ""}`}>
                    <button className={`vote-btn ${userVote === 1 ? "upvoted" : ""}`} onClick={(e) => {
                        e.preventDefault();
                        handleVote(1) 
                    }}><FontAwesomeIcon icon={faArrowUp} style={{color: color}} /></button>
                    <span className="vote-count">{voteCount}</span>
                    <button className={`vote-btn ${userVote === -1 ? "downvoted" : ""}`} onClick={(e) => {
                        e.preventDefault();
                        handleVote(-1)
                        }}><FontAwesomeIcon icon={faArrowDown} style={{color: color}} /></button>
                </div>
                
                <div className="align-items-center d-flex py-1 px-3 gap-2 comment-box rounded-pill ms-3">
                            
                <button className="comment-btn rounded-pill align-items-center border-0"><span className="me-3">{thread.postCount}</span><FontAwesomeIcon icon={faComment} /></button>
                </div>
                <Button variant={darkMode ? "white" : "dark"} size="sm" className="py-0 px-3">Share</Button>
            </div>
        </Card>
        </NavLink>
    )

};
export default ThreadCard