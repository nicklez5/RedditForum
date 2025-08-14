import React,{ useState, useEffect } from "react";
import { useStoreActions, useStoreState } from "../interface/hooks";
import { Link } from "react-router-dom";
import api from "../api/forums";
import {useParams} from "react-router-dom";
import axios from "axios";
import { Post } from "../interface/PostModel";
import { Thread } from "../interface/ThreadModel";
import { Forum } from "../interface/ForumModel";
import { useTheme } from "./ThemeContext";

const ActivityPage = () => {
    const {id} = useParams();
    const {darkMode} = useTheme();
    const fetchProfileById = useStoreActions((a) => a.profile.fetchSelectedProfile);
    const [posts,setPosts] = useState<Post[]>([]);
    const [threads, setThreads] = useState<Thread[]>([]);
    const [forums, setForums] = useState<Forum[]>([]);
    const [postLikeCount, setPostLikeCount] = useState(null);
    const [threadLikeCount , setThreadLikeCount] = useState(null);
    const [subscribedForumCount, setSubscribedForumCount] = useState(null);
    const selectedProfile = useStoreState((s) => s.profile.selectedProfile);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        
        const fetchData = async() => {
            setLoading(true);
            try{
                const res = await api.get(`/api/account/activity/${id}`)
                const d: any = res.data;
                setPosts(d.posts);
                setThreads(d.threads)
                setForums(d.forums)
                setPostLikeCount(d.totalPostLikeCount);
                setThreadLikeCount(d.totalThreadLikeCount);
                setSubscribedForumCount(d.totalSubscribedForumCount);
            }catch(err: any){
                setError(err);
            }finally{
                setLoading(false);
            }
        }
        fetchData();
        
    },[]);
    useEffect(() => {
        if(id)
            fetchProfileById(id);
    },[id])
    const badges1 = [
        {name: "Iron", icon: "https://lolg-cdn.porofessor.gg/img/s/league-icons-v3/160/1.png?v=9", points: 10},
        {name: "Bronze", icon: "/badges/bronze.png", points: 50},
        {name: "Silver", icon: "https://lolg-cdn.porofessor.gg/img/s/league-icons-v3/160/3.png?v=9", points: 100},
        {name: "Gold", icon: "https://i.namu.wiki/i/TI2BGk5sLXtNrvv3Hyf9MK_cKw82C6S0UFIVrf6owcqcWRntupBUGftmek8Dj2bK9wwhC_7-qkJXZfIDLLj-Bg.webp", points: 200},
        {name: "Platinum", icon : "https://www.proguides.com/guides/wp-content/uploads/2023/06/Season_2022_-_Platinum.webp", points: 500}
    ]
    const getAchievements = (points: number) => {
        const achievements = [];

        if(points >= 10){
            achievements.push({ name: "Iron", icon: "https://lolg-cdn.porofessor.gg/img/s/league-icons-v3/160/1.png?v=9"})
        }
        if(points >= 50){
            achievements.push({name: "Bronze", icon: "/badges/bronze.png"})
        }
        if(points >= 100){
            achievements.push({ name: "Silver", icon: "https://lolg-cdn.porofessor.gg/img/s/league-icons-v3/160/3.png?v=9"})
        }
        if(points >= 200){
            achievements.push({name: "Gold", icon: "https://i.namu.wiki/i/TI2BGk5sLXtNrvv3Hyf9MK_cKw82C6S0UFIVrf6owcqcWRntupBUGftmek8Dj2bK9wwhC_7-qkJXZfIDLLj-Bg.webp"})
        }
        if(points >= 500){
            achievements.push({ name: "Platinum", icon: "https://www.proguides.com/guides/wp-content/uploads/2023/06/Season_2022_-_Platinum.webp"})
        }
        return achievements;
    }
    const reputation = selectedProfile?.reputation;
    const badges = getAchievements(reputation!);
    const latestUnlocked = badges1.filter( b => reputation! >= b.points)
                                 .sort((a,b) => b.points - a.points)[0];
    if(loading) return <p>Loading data..</p>
    if(error) return <p>Error: {error}</p>
    const bg = darkMode ? "#212529" : "#ffffff";
    const color = darkMode ? "white": "black";
    return(
        <div className="container">
        <div className="row mt-3">
            <div className="col card shadow-sm" style={{maxHeight: "100%"}}>
                <div >
                <p className="text-center fs-4">Activity</p>
                </div>
                <h5>Threads:</h5>
                <br/>
                <ul className="list-group">
                    {threads.map((thread) => (
                        <Link
                            to={`/threads/${thread.id}`}
                            key={thread.id}
                            className="list-group-item list-group-item-action thread-link"
                            style={{textDecoration: "none", color: color, backgroundColor: bg}}
                        >
                                {thread.videoKey && (
                                    <div className="d-flex justify-content-center">
                                    <video src={thread.videoUrl!} controls width="400">

                                    </video>
                                    </div>
                                )}
                                {thread.imageKey && (
                                    <div className="d-flex justify-content-center">
                                        <img src={thread.imageUrl!} style={{maxWidth: "400px"}}/>
                                    </div>
                                )}
                             
                                <p><strong>Author: </strong>{thread.authorUsername ?? "Unknown"}</p>
                                <p>{thread.title}</p>
                                <small className="">{new Date(thread.createdAt).toLocaleString()}</small>
                        </Link>
                    ))}
                </ul>
                <br/>
                <h5>Posts:</h5>
                <br/>
                <ul className="list-group">
                    {posts.map((post) => (
                        <Link to={`/threads/${post.threadId}`} 
                        key={post.threadId} className="list-group-item list-group-item-action thread-link " style={{ textDecoration: "none", color: color, backgroundColor: bg}}>
                                              
                        <li key={post.id} className="list-unstyled">
                            {post.imageKey && (
                                <div className="d-flex justify-content-center">
                                    <img src={post.imageUrl!} style={{maxWidth: "400px"}}/>
                                </div>
                            )}
                            {post.videoKey && (
                                <div className="d-flex justify-content-center">
                                    <video src={post.videoUrl!} controls width="400">

                                    </video>
                                </div>
                            )}
                            <p><strong>Author: </strong> {post.authorUsername ?? "Unknown"}</p>
                            <p>{post.content}</p>
                            <small className="">{new Date(post.createdAt).toLocaleString()}</small>
                        </li>
                        </Link>
                    ))}
                </ul>
            </div>
            <div className="col card shadow-sm" style={{maxHeight: "100%", height: "70vh"}}>
                <div>
                <p className="text-center fs-1 font-monospace">Welcome {selectedProfile!.username}</p>
                </div>
                <div>
                     <p className="text-center font-monospace fs-4">Subscribed in {subscribedForumCount} Forums</p>
                     <p className="text-center font-monospace fs-5">Has {threadLikeCount} thread like counts</p>
                     <p className="text-center font-monospace fs-6">Has {postLikeCount} post like counts</p>
                </div>
                <div className="d-flex justify-content-center flex-wrap gap-2 mt-3">
                            {badges.map((badge) => (
                                <div key={badge.name} className="text-center"
                                    style={{cursor: "pointer",
                                        border: badge.name === latestUnlocked?.name ? "2px solid #0d6efd" : "2px solid transparent"
                                    }}
                                >
                                    <img src={badge.icon}
                                        alt={badge.name}
                                        title={badge.name}
                                        style={{ width: "140px", height: '140px', backgroundColor: "transparent",backgroundBlendMode: "multiply"}}
                                    />
                                    <div style={{fontSize: '0.75rem'}}>{badge.name}</div>
                                </div>
                            ))}    
                        
                </div> 
                <div className="mt-3">
                    <p className="text-center">Bio: {selectedProfile?.bio}</p>
                </div>
            </div>
        </div>
        </div>
    )
}
export default ActivityPage;