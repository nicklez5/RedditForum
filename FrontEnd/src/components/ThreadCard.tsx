import {Card, Badge, Button} from "react-bootstrap"
import { Thread } from "../interface/ThreadModel"
import { formatDistanceToNow } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faCommentAlt, faArrowUp, faArrowDown, faComment } from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { useStoreActions, useStoreState } from "../interface/hooks";
import api from "../api/forums";
interface Props{
    thread: Thread,
    darkMode: boolean
}
const ThreadCard: React.FC<Props> = ({ thread, darkMode}) => {
    const cardStyle = {
        backgroundColor: darkMode ?  "#1a1a1b" : "#ffffff",
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
    const [img ,setImg] = useState<string | null>(null);
    const [video,setVideo] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const {data} = await api.get(`/api/thread/${thread.id}`);
            setImg(data.imageUrl);
            setVideo(data.videoUrl);
        })();
    },[thread.id])
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
    const ASSET_BASE = (process.env.REACT_APP_ASSET_BASE_URL ?? API_BASE).replace(/\/$/, '');
    useEffect(() => {
    console.log('ThreadCard image debug', {
        id: thread.id,
        imageUrl: thread.imageUrl,
        imageKey: (thread as any).imageKey,
        resolved: resolveAsset(thread.imageUrl ?? (thread as any).imageKey ?? ''),
    });
    }, [thread.id, thread.imageUrl]);
    const resolveAsset = (u?: string | null): string | undefined => {
        if (!u) return undefined;                          // don't return base by itself
        if (/^https?:\/\//i.test(u)) return u;             // already absolute
        return `${ASSET_BASE}/${u.replace(/^\/+/, '')}`    // join with asset base
                .replace(/([^:]\/)\/+/g, '$1');
        };
    const imgSrc   = resolveAsset(thread.imageUrl ?? (thread as any).imageKey);
    const videoSrc = resolveAsset(thread.videoUrl ?? (thread as any).videoKey);
    return (
        <NavLink to={`/threads/${thread.id}`} style={{textDecoration: "none", color: 'inherit'}} className="card-link-wrapper">
        <Card className="shadow-sm border-1 post-card" style={cardStyle}>
        <div className="d-flex flex-row align-items-center mb-1 gap-1">
            {/* <div className="small" style={{color: color}}>r/{thread.forumTitle} ° {formatted}</div> */}
            <img src={resolveAsset(thread.forumIconUrl)} className="avatar1" />
            <span className="small fw-semibold flex-col gap-1" style={{color: color}}>r/{thread.forumTitle} • {formatted}</span>  
        </div>
        <h5 className="mt-3 fw-bold">{thread.title}</h5>
        <div className="mb-2" style={{color:color}}>{thread.content}</div>
        <div className="d-flex justify-content-center">
            {img && (
                <>
                <img src={resolveAsset(img)} style={{width: "400px"}} onError={() => console.error('CARD IMG ERROR', imgSrc)}/>
                <hr/>
                </>
            )}
        </div>
        
        <div className="d-flex justify-content-center">
            {video && (
                <>
                <video width="500" controls>
                    <source src={resolveAsset(video)} type={thread.videoContentType ?? "video/mp4"} onError={() => console.error('CARD VIDEO ERROR', videoSrc)} />
                </video>
                </>
            )}
        </div>
        <hr/>
        <div className="d-flex gap-3 text-muted small justify-content-center" onClick={(e) => e.stopPropagation()}>
                <div className={`rounded-pill align-items-center gap-2 px-2 py-1 vote-box d-flex ${userVote === 1 ? "upvoted" : userVote === -1 ? "downvoted" : ""}`}>
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
                
                <div className="align-items-center d-flex py-1 px-3 gap-2 comment-box rounded-pill ms-4">
                            
                <button className="comment-btn rounded-pill align-items-center border-0"><span className="me-3">{thread.postCount}</span><FontAwesomeIcon icon={faComment} /></button>
                </div>
                
            </div>
        </Card>
        </NavLink>
    )

};
export default ThreadCard