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
    onReplySubmit: (parentPostId: number, content: string, image: File | null) => void;
    onLikeReply: (replyId: number, voteValue: number) => void;
    onEditReply: (replyId: number, newContent: string, editRemoveImage: boolean, editImage: File | null) => void;
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
    const [editText, setEditText] = useState(reply.content);
    const [editImage, setEditImage] = useState<File | null>(null);
    const [editRemoveImage, setEditRemoveImage] = useState(false);
    const [image, setImage] = useState<File | null>(null);
    const [removeImage, setRemoveImage] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const hasText = replyText.trim().length > 0;
        const hasImage = !!image;

        if (!hasText && !hasImage) return;

        onReplySubmit(reply.id, replyText, image)
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
    const handleEditSubmit = (e : React.FormEvent) => {
        e.preventDefault();
        if(editText.trim() !== ""){
            onEditReply(reply.id, editText, editRemoveImage, editImage);
            setIsEditing(false);
        }
    }
    const formatted = (date: Date) => formatDistanceToNow(new Date(date), {addSuffix: true})
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
                        <input id="post-upload" type="file" accept="image/*" className="d-none" onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            setEditImage(file);
                            setEditRemoveImage(false);
                            if(file){
                                const previewURL = URL.createObjectURL(file);
                                setImagePreview(previewURL)
                            }else{
                                setImagePreview(null);
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
                        )
                        
                        }
                    </div>
                    {reply.imageUrl && (
                        <div className="position-relative" style={{maxWidth: "200px"}}>
                            <img src={`http://localhost:5220/${reply.imageUrl}`} alt="Current" width="100"/>
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
                    <div className="d-flex justify-content-end gap-2 mt-1">
                        <Button size="sm" type="submit" variant="outline-success">Save</Button>
                        <Button size="sm" variant="outline-secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                    </div>
                    </div>
                </Form>
            ) : (
                <div className="position-relative" >
                {reply.imageUrl ? <img src={`http://localhost:5220/${reply.imageUrl}`} alt="Current" width="500"/> : null}
                
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
                                    <li><button className="dropdown-item" onClick={() => {
                                        deletePost(reply.id)
                                        window.location.href = `/threads/${reply.threadId}`
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
                                <input id="post-upload" type="file" accept="image/*" className="d-none" onChange={(e) => {
                                    const file = e.target.files?.[0] ?? null;
                                    setImage(file);
                                    setRemoveImage(false);
                                    if(file){
                                        const previewURL = URL.createObjectURL(file);
                                        setImagePreview(previewURL)
                                    }else{
                                        setImagePreview(null);
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