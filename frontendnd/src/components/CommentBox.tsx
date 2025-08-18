import {useEffect, useRef, useState} from "react";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faImage, faFileImage, faXmark} from "@fortawesome/free-solid-svg-icons"
import { useStoreActions } from "../interface/hooks";
import { useTheme } from "./ThemeContext";
const CommentBox = ({forumId, authorIcon} : {forumId: number, authorIcon : string}) => {
    const [title,setTitle] = useState('')
    const [content, setContent] = useState('')
    const [image,setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
    const [video, setVideo] = useState<File | null>(null);
    const [showForm, setShowForm] = useState(true);
    const revokeImgRef = useRef<string | null>(null);
    const revokeVidRef = useRef<string | null>(null);
    const handleCancel = () => {
        setContent('');
        setPreviewUrl(null);
        setVideoPreviewUrl(null);
        setShowForm(false);
        setExpanded(false);
    }
    
    const createThread = useStoreActions((a) => a.thread.CreateThread);
    const {darkMode} = useTheme();
    const panelBg = darkMode ? "bg-dark" : "bg-body-secondary";
    const clearPreviews = () => {
        if(revokeImgRef.current) {URL.revokeObjectURL(revokeImgRef.current); revokeImgRef.current = null;}
        if(revokeVidRef.current) {URL.revokeObjectURL(revokeVidRef.current); revokeVidRef.current = null;}
        setImage(null); setPreviewUrl(null);
        setVideo(null); setVideoPreviewUrl(null);
    }
    const [expanded, setExpanded] = useState(false);
    useEffect(() => {
        clearPreviews();
    },[])
    const handleFileChange = (file: File | null) => {
        clearPreviews();
        if(!file) return;
        const url = URL.createObjectURL(file);
        if(file.type.startsWith("image/")){
            setImage(file);
            setPreviewUrl(url);
            revokeImgRef.current = url;
        }else if(file.type.startsWith("video/")){
            setVideo(file);
            setVideoPreviewUrl(url);
            revokeVidRef.current = url;
        }else{
            URL.revokeObjectURL(url);
        }
    }
    const handleSubmit = async(e : React.FormEvent) => {
        e.preventDefault();
        const hasText = content.trim().length > 0;
        const hasImage = !!image;
        const hasVideo = !!video;
        if(!hasText && !hasImage && !hasVideo) return;

        const dto = {
            content,
            forumId,
            title,
            video: video,
            image: image || undefined
        }
        await createThread(dto);
        setContent('');
        setImage(null);
        setVideo(null);
        setTitle('');
        setPreviewUrl(null);
        setVideoPreviewUrl(null);
        setShowForm(false);
    }
    if(!expanded){
        return (
            <div className={`rounded-3 home_tool2 ${panelBg} p-3 w-100`}>
                <div className="d-flex align-items-center gap-3" role="button" onClick={() => setExpanded(true)}>
                    <img src={authorIcon} className="rounded-circle avatar"/>
                    <input
                        className="form-control bg-body text-white-50"
                        placeholder="Add a thread title"
                        onFocus={() => setExpanded(true)}
                        readOnly
                    />
                </div>
            </div>
        )
    }
    return(
       
            <form onSubmit={handleSubmit} className={`p-3 rounded mt-1 ${darkMode ? 'bg-dark text-white' : 'bg-light text-dark'} w-100`}>
                <div className="d-flex  gap-2 ">
                    <img src={authorIcon} className="rounded-circle avatar"/>
                    <input className="form-control bg-body text-dark-50 "
                        placeholder="Add a thread title"
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    
                </div>
                <br/>
                <div className="d-flex ps-5 ms-2">
                    <textarea className={`form-control ${darkMode ? 'bg-body text-dark' : 'bg-light text-dark'}`}
                        placeholder="Add a comment..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={4}
                        />
                </div>
                <br/>
                <div className="d-flex ">
                    {previewUrl && (
                        <div className="d-flex position-relative ps-5 ms-2 justify-content-center align-items-center" style={{maxWidth: "300px"}}>
                            <img src={previewUrl} alt="preview" className="img-fluid rounded mt-3 "/>
                            <button
                                type="button"
                                className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                onClick={clearPreviews}
                                style={{transform: 'translate(50%, -50%)', borderRadius: '50%'}}
                            >
                                <FontAwesomeIcon icon={faXmark}/>
                            </button>
                        </div>
                    )}
                    {videoPreviewUrl && (
                        <div className="position-relative ps-5 ms-2 " style={{maxWidth: "400px"}}>
                            <video src={videoPreviewUrl} controls preload="metadata" style={{maxWidth: "400px", maxHeight: 320}} className="mt-1"/>
                            <Button size="sm" variant="outline-secondary" className="btn btn-sm btn-danger position-absolute top-0"
                                onClick={clearPreviews}
                                style={{transform: "translate(0%, -50%)", borderRadius: "50%"}}
                            ><FontAwesomeIcon icon={faXmark}/></Button>
                        </div>
                    )}
                </div>
                <div className="d-flex align-items-start justify-content-start ps-5 ms-2">
                    <div className="border px-2 py-2 border-opacity-25">
                     <label htmlFor="upload" style={{cursor: "pointer"}}>
                            <FontAwesomeIcon icon={faImage}/>
                            <span className={`${darkMode ? 'text-white' : 'text-dark'} fs-6 ps-2 fw-bold`}>Attach files</span>
                        </label>
                    <input
                        id="upload"
                        type="file"
                        accept="image/,video/*"
                        style={{display: "none"}}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const file = e.target.files?.[0] ?? null;
                            handleFileChange(file);
                        }}
                    />
                    </div>
                    
                </div>
                <div className="d-flex align-items-end justify-content-end gap-2">
                    <button type="submit" className="btn btn-success">Create Thread</button>
                    <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
                    
                </div>

            </form>
       
    )
}
export default CommentBox;