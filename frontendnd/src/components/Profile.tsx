import React, {useEffect, useState} from "react";
import {Container, Form, Button, Row, Col, Alert, Spinner, Card, Modal} from "react-bootstrap"
import api from "../api/forums";
import { useStoreActions, useStoreState } from "../interface/hooks";
import { Profile } from "../interface/ProfileModel";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useTheme } from "./ThemeContext";
import { ActivityPayload } from "../interface/UserModel";
import { Post } from "../interface/PostModel";
import { Thread } from "../interface/ThreadModel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { formatWhen } from "../utils/dates";
type Props = {threads : Thread[]};
function ThreadPane({threads} : Props){

    return (
    <div className="container text-start">
        <div>
        {threads.map(t => (
            <>
            <Link to={`/threads/${t.id}`} className="text-decoration-none">
            <div className="row border p-2">
            <div className="">
                Title: {t.title}
                
            </div>
            
            <div className="">
                Content: {t.content}
            </div>
            <div>
                Likes : {t.likeCount}
            </div>
            <div>
                Replies : {t.postCount}
            </div>
            </div>
            </Link>
            </>
        ))}
        </div>
    </div>
    )
}
type Props2 = {posts: Post[]};
function ActivityPane({posts} : Props2){
    return (
        <div className="container text-start">
            <div>
            {posts.map(p => (
                <>
                <Link to={`/threads/${p.threadId}`} className='text-decoration-none'>
                <div className="row border p-2">
                    <div className="">
                        Content: {p.content}
                    </div>
                    <div className="">
                        {p.imageKey && (
                            <>
                            Image: <img src={p.imageUrl!} width="400" height="400"/>
                            </>

                        )}

                    </div>
                    <div className="">
                        {p.videoKey && (
                            <>
                            Video: <video src={p.videoUrl!} controls width="400" height="400"/>
                            </>
                        )}
                    </div>
                    <div>
                        Likes: {p.likeCount}
                    </div>
                    
                </div>
                </Link>
                </>
            ))}
            </div>
        </div>
    )
}
type Props3 = {author : Profile}
function AboutPane({author} : Props3){
    return (
        <div className="d-flex flex-column text-start border p-3 align-items-start justify-content-start container">
            <div>
              <span className="fw-bold">Name:</span> {author.firstName} {author.lastName}
            </div>
            <div>
             <span className="fw-bold">Username: </span>{author.username}
            </div>
            <div>
             <span className="fw-bold">Bio: </span>{author.bio}
            </div>
            <div>
             <span className="fw-bold">Email:</span> {author.email}
            </div>
            <div>
                <span className="fw-bold">Moderator:</span> {author.isModerator ? "Yes" : "No"}
            </div>
            <div>
                <span className="fw-bold">Banned:</span> {author.isBanned ? "Yes" : "No"}
            </div>
            <div>
                <span className="fw-bold">Posts Count:</span> {author.postCount}
            </div>
        </div>
    )
}
type TabKey = "thread" | "activity" | "about";
const NewProfilePage = () => {
    const navigate = useNavigate();
    const {id} = useParams();
    const viewedProfile = useStoreState((s) => s.profile.selectedProfile);
    const fetchProfileById = useStoreActions((a) => a.profile.fetchSelectedProfile);
    const {darkMode} = useTheme();
    const loading = useStoreState((s) => s.profile.loading);
    const bg2 = darkMode ? "#000000e8" : "#ffffff";
    const color = darkMode ? "white" : "black"
    const bg3 = darkMode ? "#363a42" : "#ffffff";
    const [posts, setPosts] = useState<Post[]>([]);
    const [threads, setThreads] = useState<Thread[]>([]);
    const [totalPostLikeCount, setTotalPostLikeCount] = useState<number | undefined>(undefined);
    const [totalThreadLikeCount, setTotalThreadLikeCount] = useState<number | undefined>(undefined);
    const updateProfile = useStoreActions((a) => a.user.updateProfile);
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [bio, setBio] = useState('')
    const [file, setFile] = useState<File | null>(null);
    const [profileImageUrl, setProfileImageUrl] = useState('');
    const [preview , setPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const user_id = useStoreState((s) => s.user.Id);
    const [tab, setTab] = useState<TabKey>("thread")
    useEffect(() => {
            if(viewedProfile){
                setFirstName(viewedProfile.firstName);
                setLastName(viewedProfile.lastName);
                setBio(viewedProfile.bio);
                setProfileImageUrl(viewedProfile.profileImageUrl!);
            }
        },[viewedProfile])
    useEffect(() => {
        if(id){
            fetchProfileById(id!)
        }
    },[id])
    const reputation = viewedProfile?.reputation;
    const getIron = (points: number) => {
        let xyz = "";
        if(points >= 500){
            xyz = "Platinum"
        }
        else if(points >= 200){
            xyz = "Gold"
        }
        else if(points >= 100){
            xyz = "Silver"
        }
        else if(points >= 50){
            xyz = "Bronze"
        }
        else if(points >= 10){
            xyz = "Iron"
        }
        return xyz;
    }
    const [show, setShow] = useState(false);
    const open = () => setShow(true);
    const close = () => setShow(false);
    useEffect(() => {
        const fetchData = async() => {
            try{
                const response = await api.get<ActivityPayload>(`/api/account/activity/${id}`)
                const data = response.data;
                setPosts(data.posts);
                setThreads(data.threads);
                setTotalPostLikeCount(data.totalPostLikeCount)
                setTotalThreadLikeCount(data.totalThreadLikeCount);
            }catch(error : any){
                setError(error.message);
            }
        }
        fetchData();
    },[id])
    function formatDate(d?: string | Date | null, opts?: Intl.DateTimeFormatOptions) {
        if (!d) return '';
        const date = d instanceof Date ? d : new Date(d);
        if (Number.isNaN(date.getTime())) return '';
        return date.toLocaleDateString(undefined, opts ?? { year:'numeric', month:'short', day:'numeric' });
        }
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if(selected){
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
        }
    }
    const getDims = async(file: File) => {
                try{ const bmp = await createImageBitmap(file); return { w: bmp.width, h: bmp.height}}
                catch{ return undefined;}
    }
    const handleUpload = async(): Promise<string | null> => {
        if(!file) return null;

        const formData = new FormData();
        formData.append('file', file);
        const f = file;
        const {data: pre} = await api.post("/api/profile/presign-avatar", null,{
            params: {contentType: f.type, fileName: f.name}
        });
        await axios.put(pre.url, f,{headers: {"Content-Type": f.type}});
        const dims = await getDims(f);
        await api.post("/api/profile/avatar" ,{
            key: pre.key, url: pre.publicUrl, contentType: f.type, sizeBytes: f.size, width: dims?.w, height: dims?.h
        })
        return pre.publicUrl as string;
        
    }
    const handleSave = async() => {
        const uploadedUrl = await handleUpload()
        if(!uploadedUrl && file){
            alert("Image upload failed.")
            return;
        }
        await updateProfile({
            firstName: firstName,
            lastName: lastName,
            bio: bio,
            profileImageUrl : uploadedUrl || profileImageUrl
        })
        setProfileImageUrl(uploadedUrl ||  profileImageUrl);
        setShow(false);
        if(id){
            fetchProfileById(id)
        }
    }
    return(
        <>
        <div className="min-vh-100" style={{background: bg2, color: color}}>
            <div className="container text-dark">
               <div className="d-flex justify-content-between text-white  fs-5 mx-auto  container pt-4"  >
                <div className="border-1 border  home_tool w-100 align-items-start d-flex ps-3">
                <p className="fs-5 fw-normal  mt-2">
                    <Link to="/" className="a123 text-decoration-none bg-gradient ">Home </Link>
                    <FontAwesomeIcon icon={faChevronRight}  /><Link to="/" className="a123 text-decoration-none bg-gradient">Members </Link>
                    </p>
                </div>
                
            </div>
            <br/>
            <div className="d-flex container  mx-auto " >
            <div className="border-1 w-100 d-flex p-4 gap-3 border-bottom" style={{background: bg3, color: color}}>
                <img src={viewedProfile?.profileImageUrl!} style={{height: "165px", width: "165px", borderRadius: "60%"}}/>
                <div className="d-flex flex-column align-content-center justify-content-between w-100 ">
                    <p className="fs-4  text-start">{viewedProfile?.username}</p>
                    <p className="fs-5 text-start text-nowrap ">Joined {formatDate(viewedProfile?.dateJoined)}</p>
                    <hr/>
                    <div className="d-flex flex-column w-100">
                    <div  className="d-flex flex-row w-100 ">
                        <p className="mb-0 text-start fs-6">
                            Reputation 
                        </p>
                     <p className="mb-0 text-center fs-6 text-nowrap justify-content-center align-items-center d-flex w-100 ">Reaction Score</p>
                     <p className="mb-0  fs-6 text-nowrap justify-content-end align-items-end d-flex w-0 ">Points</p>
                    </div>
                    <div style={{lineHeight: "0.8"}} className="d-flex justify-content-center align-items-center mt-3 w-100">
                        <p className="mb-0 text-start fs-6">
                            <span className="fw-bold flex-grow-1">{getIron(viewedProfile?.reputation!)}</span>
                        </p>
                     <p className="mb-0 text-center fs-6 flex-grow-1">{(totalPostLikeCount! + totalThreadLikeCount!)}</p>
                       <p className="mb-0 text-end fs-6 ">{viewedProfile?.reputation}</p>
                    </div>
                    
                    </div>
                </div>
                
                <div className="align-items-end justify-content-start w-0 d-flex flex-column">
                    {user_id === viewedProfile?.id && (
                        <button className="bg-transparent p-3 border-white text-nowrap" style={{color: color}} onClick={open}>
                        Edit Profile banner
                        </button>
                    )}
                    <Modal show={show} onHide={close}>
                        
                        <Form className="mt-3 p-3 ">
                        <Form.Group className="mb-3">
                            <Form.Label>First Name</Form.Label>
                            <Form.Control
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder= "First Name"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Last Name"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Bio</Form.Label>
                            <Form.Control 
                                as="textarea"
                                rows={5}
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Your bio..."
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Profile Image</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </Form.Group>
                        {preview && (
                        <img
                            src={preview}
                            alt="preview"
                            className="mt-3 rounded-circle"
                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                        />
                        )}
                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="success" onClick={handleSave}>
                                Save
                            </Button>
                            <Button variant="secondary" onClick={()=> setShow(false)}>
                                Cancel
                            </Button>
                        </div>
                    </Form>
                    </Modal>
                </div>
                
            </div>
            
           
            </div>
            <div className="container ">
                <div className=" d-flex " >
                 <nav aria-label="Page navigation example" className="">
                <ul className="nav nav-tabs ">
                    <li className="nav-item">
                        <button className={`nav-link ${tab === "thread" ? "active" : ""}`}
                        onClick={() => setTab("thread")}
                        type="button"
                        aria-current={tab === "thread" ? "page" : undefined}
                        >
                            Thread Posts
                        </button>
                    </li>
                    <li className="nav-item">
                        <button className={`nav-link ${tab === "activity" ? "active" : ""}`}
                         onClick={() => setTab("activity")}
                         type="button"
                         >Latest Activity</button>
                    </li>
                    <li className="nav-item">
                        <button className={`nav-link ${tab === "about" ? "active" : ""}`}
                         onClick={() => setTab("about")}
                         type="button"
                         >About me</button>
                    </li>
                </ul>
                
            </nav>
            
            </div>
            <div className="border border-top-0 p-3  text-black d-flex bg-body" style={{background: "var(--bsbody-bg)"}}>
                {tab === "thread" && <ThreadPane threads={threads}/>}
                {tab === "activity" && <ActivityPane posts={posts}/>}
                {tab === "about" && <AboutPane author={viewedProfile!}/>}
            </div>
            </div>
                    
            </div>
            
        </div>
        </>
    )
}
export default NewProfilePage;