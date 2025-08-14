import React, {useState} from "react"
import {Button, Form} from 'react-bootstrap';
import { Reply } from "../interface/ReplyModel";
import { useStoreActions } from "../interface/hooks";
import { formatDistanceToNow } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown, faComment, faEllipsis, faImage} from "@fortawesome/free-solid-svg-icons"
import { useTheme } from "./ThemeContext";
interface Props{
    reply: Reply;
    onReplySubmit: (parentPostId: number, content: string, image: File | null, video: File| null) => void;
    onLikeReply: (replyId: number, voteValue: number) => void;
    onEditReply: (replyId: number, newContent: string, editRemoveImage: boolean, editImage: File | null, editRemoveVideo: boolean, editVideo: File | null) => void;
}
const ReplyItem = ({reply, onReplySubmit, onLikeReply, onEditReply} : Props) => {
    const {darkMode} = useTheme();
    const [showReplyBox, setShowReplyBox] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [userVote, setUserVote] = useState(0);
    const likeReply = useStoreActions((a) => a.post.votePost);
    const deletePost = useStoreActions((a) => a.post.DeletePost);
    const [voteCount ,setVoteCount] = useState(reply!.likeCount);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState<string>(reply.content ?? "");
    const [editImage, setEditImage] = useState<File | null>(null);
    const [editRemoveImage, setEditRemoveImage] = useState(false);
    const [image, setImage] = useState<File | null>(null);
    const [video,setVideo] = useState<File | null>(null);
    const [editVideo, setEditVideo] = useState<File| null>(null);
    const [editRemoveVideo, setEditRemoveVideo] = useState(false);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const [removeImage, setRemoveImage] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const hasText = replyText.trim().length > 0;
        const hasImage = !!image;

        if (!hasText && !hasImage) return;

        onReplySubmit(reply.id, replyText, image,video )
        setReplyText("");
        setImage(null);
        setImagePreview(null);
        setRemoveImage(false);
        setShowReplyBox(false);
    }
    const handleLike = async (vote : number) => {
        await likeReply({postId : reply.id, voteValue : vote})
        if(userVote === vote){
            setUserVote(0);
            setVoteCount(voteCount - 1);
        }else{
            const diff = vote - userVote;
            setUserVote(vote);
            setVoteCount(voteCount + diff);
        }
    }
    const handleEditSubmit = async (e : React.FormEvent) => {
        e.preventDefault();
        const newText = editText.trim();

        const hadImage = !!reply.imageUrl;
        const hadVideo = !!reply.videoUrl;

        // What the reply will have after this edit
        const willHaveImage = editImage
            ? true                    // user picked a new image
            : editRemoveImage
            ? false                 // user removed existing image
            : hadImage;             // keep existing as-is

        const willHaveVideo = editVideo
            ? true
            : editRemoveVideo
            ? false
            : hadVideo;

        const shouldDelete = newText.length === 0 && !willHaveImage && !willHaveVideo;

        try {
            if (shouldDelete) {
            await deletePost(reply.id);
            window.location.href = `/threads/${reply.threadId}`
            } else {
            onEditReply(
                    reply.id,
                    newText,
                    editRemoveImage,
                    editImage,
                    editRemoveVideo,
                    editVideo
                );
            }
            setIsEditing(false);
        } catch (err) {
            console.error("Edit/Remove failed", err);
            // optionally show a toast/error state here
        }
    }
    const formatted = (date: Date) => formatDistanceToNow(new Date(date), {addSuffix: true})
    const API_BASE = (process.env.REACT_APP_API_BASE_URL || '').replace(/\/$/, '');

    const toAbs = (u: string) =>
    /^https?:\/\//i.test(u) ? u : `${API_BASE}/${u}`.replace(/([^:]\/)\/+/g, '$1');
    return (
        <div className="ms-4 mt-2 border-start ps-3">
            <div className="d-flex flex-row align-items-center gap-1">
            <img src={reply.profileImageUrl} className="avatar"/>
            <span className="medium flex-col"><strong>{reply.authorUsername} </strong><small className="text-secondary">• {formatted(reply.createdAt)}</small></span>
            </div>
            {isEditing ? (
                <Form onSubmit={handleEditSubmit}>
                    <Form.Control 
                        as="textarea"
                        rows={2}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                    />
                    <div className="d-flex flex-column gap-2">
                    <div className="d-flex align-items-center gap-3">
                        <label htmlFor="post-upload" style={{cursor: "pointer"}}>
                            <FontAwesomeIcon icon={faImage} />
                        </label>
                        <input id="post-upload" type="file" accept="image/*,video/*" className="d-none" onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            if(file?.type.startsWith("image/")){
                                setEditImage(file);
                                setEditRemoveImage(false);
                                const previewURL = URL.createObjectURL(file);
                                setImagePreview(previewURL)
                                
                            }else if(file?.type.startsWith("video/")){
                                setEditVideo(file);
                                setEditRemoveVideo(false);
                                const previewURL = URL.createObjectURL(file);
                                setVideoPreview(previewURL)
                                
                            }else{
                                setImagePreview(null);
                                setVideoPreview(null);
                            }
                            
                        }} />
                        <span className={`${darkMode ? 'text-white' : 'text-dark'}`}>Aa</span>
                        {imagePreview && (
                            <div>
                                <img src={imagePreview}
                                alt="Preview"
                                style={{maxWidth: "200px", borderRadius: "5px"}}
                                />
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => {
                                        setImage(null);
                                        setRemoveImage(true);
                                        setImagePreview(null)
                                    }}
                                    className="ms-2"
                                    >Remove Image</Button>
                            </div>
                        )}
                        {videoPreview && (
                            <div>
                                <video src={videoPreview} controls preload="metadata" style={{maxWidth: "400px", maxHeight: 320}} />
                                <Button size="sm" variant="outline-secondary" className="mb-3 ms-2" onClick={() => {
                                setVideo(null);
                                setEditRemoveVideo(true);
                                setVideoPreview(null);
                            }}>Remove Video</Button>
                            </div>
                        )}
                    </div>
                    {reply.imageUrl && (
                        <div className="position-relative" style={{maxWidth: "200px"}}>
                            <img src={toAbs(reply.imageUrl)} alt="Current" width="100"/>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={editRemoveImage}
                                    onChange={(e) => {
                                        setEditRemoveImage(e.target.checked);
                                        if(e.target.checked) setEditImage(null);
                                    }}/>
                                    Remove Image
                            </label>
                        </div>
                    )}
                    {reply.videoUrl && (
                        <div className="position-relative" style={{maxWidth: "200px"}}>
                            <video src={toAbs(reply.videoUrl)} controls preload="metadata" style={{maxWidth: "400px", maxHeight: 320}}/>
                            <label>
                                <input 
                                type="checkbox"
                                checked={editRemoveVideo}
                                onChange={(e) => {
                                setEditRemoveVideo(e.target.checked);
                                if (e.target.checked) setEditVideo(null);
                                }}
                                />
                                Remove Video
                            </label>
                        </div>
                    )}
                    <div className="d-flex justify-content-end gap-2 mt-1">
                        <Button size="sm" type="submit" variant="outline-success">Save</Button>
                        <Button size="sm" variant="outline-secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                    </div>
                    </div>
                </Form>
            ) : (
                <div className="position-relative" >
                {reply.imageUrl ? <img src={toAbs(reply.imageUrl)} alt="Current" width="500"/> : null}
                {reply.videoUrl ? <video src={toAbs(reply.videoUrl)} controls preload="metadata" style={{maxWidth: "400px", maxHeight: 320}} /> : null}
                <p className="mb-1">{reply.content}</p>
                </div>
            )}
            <div className="d-flex align-items-center gap-3 mt-1">
                <div className="d-flex align-items-center gap-2">
                <button className={`vote-btn ${userVote === 1 ? "upvoted" : ""}`}
                    onClick={() => handleLike(1)}>
                <FontAwesomeIcon icon={faArrowUp} />
                </button>
                <small>{voteCount}</small>
                <button
                    className={`vote-btn ${userVote === -1 ? "downvoted" : ""}`}
                    onClick={() => handleLike(-1)}
                >
                    <FontAwesomeIcon icon={faArrowDown} />
                </button>
                <Button
                    size="sm"
                    variant="outline-primary"
                    className="rounded-pill my-2 mx-2"
                    onClick={() => setShowReplyBox(!showReplyBox)}
                >{showReplyBox ? "Cancel" : <><FontAwesomeIcon icon={faComment} className="me-1"/> Reply </>}</Button>
                <div className="dropdown">
                                  <button className="btn btn-sm bg-gradient dropdown-toggle"
                                          type="button"
                                          data-bs-toggle="dropdown"
                                          aria-expanded="false">
                                  <FontAwesomeIcon icon={faEllipsis} />        
                                  </button>
                                  <ul className="dropdown-menu">
                                    <li><button className="dropdown-item" onClick={() => setIsEditing(true)}>Edit</button></li>
                                    <li><button className="dropdown-item" onClick={async (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        try{
                                            await deletePost(reply.id)
                                            window.location.href = `/threads/${reply.threadId}`
                                        }catch(err){
                                            console.error("Delete failed:",err)
                                        }
                                        }}>Delete</button></li>
                                  </ul>
                                </div>
                </div>
            </div>
            {showReplyBox && (
                <Form onSubmit={handleSubmit} className="mt-2">
                    <Form.Control
                        as="textarea"
                        rows={2}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your reply..."
                        />
                        <div className="d-flex flex-column gap-2">
                            <div className="d-flex align-items-center gap-3">
                                <label htmlFor="post-upload" style={{cursor: "pointer"}}>
                                    <FontAwesomeIcon icon={faImage} />
                                </label>
                                <input id="post-upload" type="file" accept="image/*,video/*" className="d-none" onChange={(e) => {
                                    const file = e.target.files?.[0] ?? null;
                                    if(file?.type.startsWith("image/")){{
                                        setImage(file);
                                        setRemoveImage(false);
                                        const previewURL = URL.createObjectURL(file);
                                        setImagePreview(previewURL);
                                    }}else if(file?.type.startsWith("video/")){
                                        setEditVideo(file);
                                        setEditRemoveVideo(false);
                                        const previewURL = URL.createObjectURL(file);
                                        setVideoPreview(previewURL);
                                    }else{
                                        setImagePreview(null);
                                        setVideoPreview(null);
                                    }

                                }} />
                                <span className={`${darkMode ? 'text-white' : 'text-dark'}`}>Aa</span>
                                {imagePreview && (
                                    <div>
                                    <img src={imagePreview}
                                    alt="Preview"
                                    style={{maxWidth: "200px" , borderRadius: "5px"}}
                                    />
                                    <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => {
                                        setImage(null);
                                        setRemoveImage(true);
                                        setImagePreview(null)
                                    }}
                                    className="ms-2"
                                    >Remove Image</Button>
                                    </div>
                                    
                                )}
                                {videoPreview && (
                                    <div>
                                        <video src={videoPreview} controls preload="metadata" style={{maxWidth: "400px", maxHeight: 320}} />
                                        <Button size="sm" variant="outline-secondary" className="mb-3 ms-2" onClick={() => {
                                        setVideo(null);
                                        setVideoPreview(null);
                                    }}>Remove Video</Button>
                                    </div>
                                )}
                            </div>
                            
                        </div>
                        <Button size="sm" variant="outline-primary" type="submit" className="mt-1">
                            Submit Reply
                        </Button>
                </Form>
            )}
            {reply.replies.map((childReply) => (
                <ReplyItem key={childReply.id} reply={childReply}
                onReplySubmit={onReplySubmit} onLikeReply={onLikeReply} onEditReply={onEditReply}/>
            ))}
        </div>
    )
}
export default ReplyItem;