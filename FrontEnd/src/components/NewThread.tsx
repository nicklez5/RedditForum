import {useEffect, useState} from "react";
import {useStoreActions, useStoreState} from "../interface/hooks"
import { useNavigate, Link, useParams } from "react-router-dom";
import {Spinner, Container, Form, Button, Alert, Tab, Tabs, Card, Dropdown} from "react-bootstrap"
import api from "../api/forums";
import { Forum, ForumModel } from "../interface/ForumModel";
import { CreateThreadDto } from "../interface/ThreadModel";
import { useTheme } from "./ThemeContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
const NewThread = () => {
    const { id} = useParams();
    const {darkMode} = useTheme();
    const [title,setTitle] = useState('')
    const [forumId, setForumId] = useState<number | null>(null);
    const [content, setContent] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [video, setVideo] = useState<File | null>(null);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const [error,setError] = useState<string | null>(null);
    const [showError, setShowError] = useState(false);
    const [selectedForum , setSelectedForum] = useState<Forum | null>(null);
    const [activeTab, setActiveTab] = useState('text');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const upload = useStoreActions((a) => a.upload.upload);
    const {lastUrl, lastKey, lastContentType} = useStoreState((s) => s.upload);
    const forums = useStoreState((state) => state.forum.forums)
    const fetchForums = useStoreActions((a) => a.forum.GetAllForums);
    const createThread = useStoreActions((a) => a.thread.CreateThread)
    const getThreadById = useStoreActions((a) => a.thread.GetThreadById);
    useEffect(() => {
        fetchForums()
    },[fetchForums])
    useEffect(() => {
        if(!selectedForum && forums.length > 0 && id){
            const matchedForum = forums.find(f => f.id === Number(id));
            if(matchedForum){
                setSelectedForum(matchedForum);
            }
        }
    },[forums,id])
    useEffect(() => {
        if (error && (title || selectedForum)) {
        setError(null);
        setShowError(false);
        }
    }, [title, selectedForum]);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form submitted");
        if(!title || !selectedForum){
            console.log("Title and forum selection are required.")
            setError("Title and forum selection are required.");
            setShowError(true);
            return;
        }
        console.log("Sending thread:", {
            title,
            forumId: selectedForum?.id,
            content,
            image,
            });
        const dto: CreateThreadDto = {
            title : title,
            content: content,
            forumId: selectedForum!.id,
            image: image,
            video: video
        }
        try{
            setLoading(true);
            setError(null);
            setShowError(false);
            await createThread(dto);
            
            console.log("Thread created successfully");
            navigate(`/home`)
        }catch(err: any){
            setError(err.message || "Failed to create thread.");
            setShowError(true);
        }finally{
            setLoading(false);
        }
    }
    useEffect(() => { setShowError(!!error); }, [error]);
    const API_BASE = (process.env.REACT_APP_API_BASE_URL || '').replace(/\/$/, '');

    const toAbs = (u: string) =>
    /^https?:\/\//i.test(u) ? u : `${API_BASE}/${u}`.replace(/([^:]\/)\/+/g, '$1');
    return (
        <>
        {error && <Alert variant="danger" className="text-center" dismissible show={!!error && showError} onClose={() => setShowError(false)}>{error}</Alert>}
     <div className="d-flex justify-content-center mt-5 container-fluid">
        <div className="w-100" style={{ maxWidth: '600px' }}>
        <h3 className="mb-4">Create New Thread</h3>
        <Form onSubmit={handleSubmit}>
        {/* Title */}
        <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        </Form.Group>

        {/* Forum Select */}
        <Form.Group className="mb-3">
            <Form.Label>Choose a community</Form.Label>
            <Dropdown onSelect={(forumId) => {
            const forum = forums.find(f => f.id === Number(forumId));
            setSelectedForum(forum || null);
            }}>
            <Dropdown.Toggle variant="light" className="w-100">
                {selectedForum ? (
                <>
                    <img
                    src={toAbs(selectedForum.iconUrl)}
                    alt=""
                    style={{ width: '20px', height: '20px', borderRadius: '50%', marginRight: '8px' }}
                    />
                    {selectedForum.title}
                </>
                ) : "Select forum"}
            </Dropdown.Toggle>

            <Dropdown.Menu className="w-100">
                {forums.map((forum) => (
                <Dropdown.Item eventKey={forum.id} key={forum.id}>
                    <img
                    src={toAbs(forum.iconUrl)}
                    alt=""
                    style={{ width: '20px', height: '20px', borderRadius: '50%', marginRight: '8px' }}
                    />
                    {forum.title}
                </Dropdown.Item>
                ))}
            </Dropdown.Menu>
            </Dropdown>
            </Form.Group>

        {/* Image Upload */}
        <Form.Group controlId="formFile" className="mb-3">
            <Form.Label>Upload Image (optional)</Form.Label>
            <Form.Control
            type="file"
            accept="image/*"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0] || null;
                setImage(file);
                if (file) {
                    setImagePreview(URL.createObjectURL(file));
                } else {
                    setImagePreview(null);
                }
            }}
            />
            {imagePreview && (
            <div className="mt-2 container">
                <img src={imagePreview} alt="Preview" style={{ maxWidth: "400px", marginBottom: "10px" }} />
                <div className="col-md-6 mx-auto">
                <Button variant="outline-danger" size="sm" onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                }}>
                    Remove Image
                </Button>
                </div>
            </div>
            )}
        </Form.Group>
        <Form.Group controlId="formVideo" className="mb-3">
            <Form.Label>Upload Video (optional)</Form.Label>
            <Form.Control
                type="file"
                accept="video/*"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0] || null;
                    setVideo(file);
                    if(file){
                        const previewUrl = URL.createObjectURL(file);
                        setVideoPreview(previewUrl)
                    }else{
                        setVideoPreview(null);
                    }
                }}/>
                <br/>
                {videoPreview && (
                    <div className="container">
                        <video width="500" controls>
                            <source src={videoPreview} />
                        </video>
                        <div className="col-md-4 mx-auto">
                        <Button variant="outline-danger"
                            size="sm"
                            onClick={() => {
                                setVideo(null);
                                setVideoPreview(null)
                            }} className="mb-3">
                                Remove Video
                            </Button>
                        </div>
                    </div>
                )}
        </Form.Group>
        {/* Content */}
        <Form.Group className="mb-3">
            <Form.Label>Body text</Form.Label>
            <Form.Control as="textarea" rows={6} value={content} onChange={(e) => setContent(e.target.value)} />
        </Form.Group>

        {/* Submit */}
        <Button type="submit" variant="primary">Post Thread</Button>
        </Form>
    </div>
    </div>
    </>
    );
}
export default NewThread;