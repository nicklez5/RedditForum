import React, { useEffect, useRef, useState } from "react";
import { useParams, Link, Navigate, useNavigate } from "react-router-dom";
import { useStoreActions, useStoreState } from "../interface/hooks";
import { Spinner, Card, ListGroup, Button, Form } from "react-bootstrap";
import { CreatePostDto, Post , EditPostDto} from "../interface/PostModel";
import ReplyItem from "./ReplyItem";
import { useTheme } from "./ThemeContext";
import { formatDistanceToNow, previousMonday } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown, faComment, faEllipsis, faImage} from "@fortawesome/free-solid-svg-icons"
import CommentForm from "./CommentForm";
import { EditThreadDto } from "../interface/ThreadModel";
import useVisitTracker from "../hooks/useVisitTracker";
import { clear } from "console";
import e from "express";
import api from "../api/forums";
const ThreadPage = () => {
  const {darkMode} = useTheme();
  const loggedIn = useStoreState((s) => s.user.loggedIn);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useStoreState((state) => state.user.Profile?.username);

  const Thread = useStoreState((s) => s.thread.selectedThread);
  const fetchThread = useStoreActions((a) => a.thread.GetThreadById);
  const submitReply = useStoreActions((a) => a.post.ReplyToPost);
  const createPost = useStoreActions((a) => a.post.CreatePost);
  const likePost = useStoreActions((a) => a.post.votePost);
  const likeThread = useStoreActions((a) => a.thread.voteThread);
  const loading = useStoreState((s) => s.thread.loading);
  const error = useStoreState((s) => s.thread.error);
  const deletePost = useStoreActions((a) => a.post.DeletePost)
  const editPost = useStoreActions((a) => a.post.EditPost);
  const deleteThread = useStoreActions((a) => a.thread.DeleteThread);
  const editThread = useStoreActions((a) => a.thread.EditThread);

  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview , setImagePreview] = useState< string | null> (null);
  const [video,setVideo] = useState<File | null>(null);
  const [ videoPreview, setVideoPreview] = useState<string | null>(null);
  const revokeImgRef = useRef<string | null>(null);
  const revokeVidRef = useRef<string|null>(null);
  const revokePostImgRef = useRef<string | null>(null);
  const revokePostVideoRef = useRef<string | null>(null);
  const revokeThreadImgRef = useRef<string | null>(null);
  const revokeThreadVideoRef = useRef<string | null>(null);
  const [threadId, setThreadId] = useState<number>(parseInt(id!))
  const [parentPostId, setParentPostId] = useState<number | null>(null);
  const [postVoteCount, setPostVoteCount] = useState<Record<number,number>>({});
  const [postUserVotes, setPostUserVotes] = useState<Record<number, number>>({});
  const [EditPostId, setEditPostId] = useState(0)
  const [EditContent, setEditContent] = useState('')
  const [EditPostImage, setEditPostImage] = useState<File | null>(null);
  const [EditPostImagePreview, setEditPostImagePreview] = useState<string | null>(null);
  const [EditPostVideoPreview, setEditPostVideoPreview] = useState<string | null>(null);
  const [EditRemoveImage, setEditRemoveImage] = useState(false);
  const [EditPostVideo, setEditPostVideo] = useState<File | null>(null);
  const [EditPostRemoveVideo, setEditPostRemoveVideo] = useState(false);
  const [EditThreadId, setEditThreadId] = useState(0)
  const [EditThreadContent, setEditThreadContent] = useState('')
  const [EditThreadTitle, setEditThreadTitle] = useState('');
  const [EditThreadImage, setEditThreadImage] = useState<File | null>(null);
  const [EditThreadImagePreview , setEditThreadImagePreview] = useState<string | null>(null);
  const [EditThreadVideoPreview, setEditThreadVideoPreview] = useState<string | null>(null);
  const [EditThreadVideo, setEditThreadVideo] = useState<File | null>(null);
  const [EditThreadRemoveVideo, setEditThreadRemoveVideo] = useState(false);
  const [EditThreadRemoveImage, setEditThreadRemoveImage] = useState(false);
  const [ShowThreadEditModal, setShowThreadEditModal] = useState(false);
  const [ShowEditModal, setShowEditModal] = useState(false)

  const [voteCount, setVoteCount] = useState(0);
  const [userVote, setUserVote] = useState(0);
  const [showCommentBox, setShowCommentBox] = useState(false);
  // Track reply text and visibility per post
  const [replyStates, setReplyStates] = useState<Record<number, { show: boolean; text: string }>>({});
  const bg = darkMode ? "#212529" : "#ffffff";
  const color = darkMode ? "white": "black";
  const buttonColor = darkMode ? "black": "white";
  const API_BASE = (process.env.REACT_APP_API_BASE_URL || '').replace(/\/$/, '');

  const toAbs = (u: string) =>
    /^https?:\/\//i.test(u) ? u : `${API_BASE}/${u}`.replace(/([^:]\/)\/+/g, '$1');
  useVisitTracker({type: "thread", id: Number(id)});
  const clearPreviews = () => {
    if (revokeImgRef.current) { URL.revokeObjectURL(revokeImgRef.current); revokeImgRef.current = null; }
    if (revokeVidRef.current) { URL.revokeObjectURL(revokeVidRef.current); revokeVidRef.current = null; }
    setImage(null); setImagePreview(null);
    setVideo(null); setVideoPreview(null);
};
  const clearPostPreviews = () => {
    if(revokePostImgRef.current) { URL.revokeObjectURL(revokePostImgRef.current); revokePostImgRef.current = null;}
    if(revokePostVideoRef.current) { URL.revokeObjectURL(revokePostVideoRef.current); revokePostVideoRef.current = null;}
    setEditPostImage(null); setEditPostImagePreview(null);
    setEditPostVideo(null); setEditPostVideoPreview(null);
  }
  const clearThreadPreviews = () => {
    if(revokeThreadImgRef.current) { URL.revokeObjectURL(revokeThreadImgRef.current); revokeThreadImgRef.current = null;}
    if(revokeThreadVideoRef.current) {URL.revokeObjectURL(revokeThreadVideoRef.current); revokeThreadVideoRef.current = null;}
    setEditThreadImage(null); setEditThreadImagePreview(null);
    setEditThreadVideo(null); setEditThreadVideoPreview(null);
  }
  useEffect(() => {
  if (id) {
    fetchThread(parseInt(id));
  }
  }, [id, fetchThread]);
  useEffect(() => {
    if(Thread?.likeCount != null){
      setVoteCount(Thread.likeCount);
    }
    if (Thread && Thread.posts) {
      const votes: Record<number, number> = {};
      const counts: Record<number, number> = {};
      Thread.posts.forEach(post => {
        votes[post.id] = 0; // or post.userVote if you add that later
        counts[post.id] = post.likeCount;
      });
      setPostUserVotes(votes);
      setPostVoteCount(counts);
    }
  }, [Thread]);
  useEffect(() => {
    if(Thread?.imageUrl){
      setEditThreadImagePreview(toAbs(Thread.imageUrl))
    }
    if(Thread?.videoUrl){
      setEditThreadVideoPreview(toAbs(Thread.videoUrl))
    }
  },[Thread])
  useEffect(() => () => {clearPreviews(); clearPostPreviews(); clearThreadPreviews()}, []);
  const handleReplyFileChange = (file: File | null) => {
    clearPreviews();
    if (!file) return;

    const url = URL.createObjectURL(file);

    if (file.type.startsWith("image/")) {
      setImage(file);
      setImagePreview(url);
      revokeImgRef.current = url;
    } else if (file.type.startsWith("video/")) {
      setVideo(file);
      setVideoPreview(url);
      revokeVidRef.current = url;
    } else {
      // optional: show a toast/error “Only images or videos are allowed”
      URL.revokeObjectURL(url);
    }
  };
  const handlePostFileChange = (file: File | null) => {
      clearPostPreviews();
      if(!file) return;
      const url = URL.createObjectURL(file);

      if (file.type.startsWith("image/")) {
        setEditPostImage(file);
        setEditPostImagePreview(url);
        revokePostImgRef.current = url;
      } else if (file.type.startsWith("video/")) {
        setEditPostVideo(file);
        setEditPostVideoPreview(url);
        revokePostVideoRef.current = url;
      } else {
        // optional: show a toast/error “Only images or videos are allowed”
        URL.revokeObjectURL(url);
      }
  }
  const handleThreadFileChange = (file: File | null) => {
    clearThreadPreviews();
    if(!file) return;
    const url = URL.createObjectURL(file);

    if (file.type.startsWith("image/")) {
      setEditThreadImage(file);
      setEditThreadImagePreview(url);
      revokeThreadImgRef.current = url;
    } else if (file.type.startsWith("video/")) {
      setEditThreadVideo(file);
      setEditThreadVideoPreview(url);
      revokeThreadVideoRef.current = url;
    } else {
      // optional: show a toast/error “Only images or videos are allowed”
      URL.revokeObjectURL(url);
    }
  }
  const fetchId = async(username: string) => {
    try{
      const { data} = await api.get(`/api/account/${username}`);
      navigate(`/activity/${data.id}`)
    }catch(err){
      console.error("Failed to resolve user:", err);
    }
  }
  const handleEditReply = async(replyId: number, newContent: string, editRemoveImage: boolean, editImage: File | null, editRemoveVideo: boolean, editVideo: File|null) => {
    const dto: EditPostDto = {
      id: replyId,
      content: newContent,
      removeImage: editRemoveImage,
      image: editImage,
      video: editVideo,
      removeVideo: editRemoveVideo
    }
    await editPost(dto);
    await fetchThread(parseInt(id!));
  }
  const handlePostEditSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    const dto: EditPostDto = {
      id: EditPostId,
      content: EditContent,
      removeImage: EditRemoveImage,
      image: EditPostImage,
      removeVideo: EditPostRemoveVideo,
      video: EditPostVideo,
    }
    await editPost(dto)
    await fetchThread(parseInt(id!))
  }
  const handleThreadEditSubmit = async(e : React.FormEvent) => {
    e.preventDefault();
    const dto: EditThreadDto = {
      id: EditThreadId,
      content: EditThreadContent,
      title: EditThreadTitle,
      removeImage: EditThreadRemoveImage,
      image: EditThreadImage,
      video: EditThreadVideo,
      removeVideo: EditThreadRemoveVideo,
    }
    await editThread(dto)
    await fetchThread(parseInt(id!));
  }

  const handlePostVote = async(postId: number, vote: number) => {
    if (!loggedIn) return;
    const currentVote = postUserVotes[postId] || 0;
    const newVote = currentVote === vote ? 0 : vote;

    try {
      await likePost({postId, voteValue: vote}); // just fire the action
      setPostUserVotes(prev => ({
        ...prev,
        [postId]: newVote,
      }));

      // re-fetch the thread to get updated likeCount from backend
      if (id) fetchThread(parseInt(id));
    } catch (err) {
      console.error("Vote failed", err);
    }

    // Optimistically update vote count
  }

  const handleVote = async (vote: number) => {
    if (!loggedIn || !id) return;

    await likeThread({threadId: parseInt(id), voteValue: vote});

    if (userVote === vote) {
      setUserVote(0);
      setVoteCount(voteCount - 1);
    } else {
      const diff = vote - userVote;
      setUserVote(vote);
      setVoteCount(voteCount + diff);
    }
    fetchThread(parseInt(id))
  };

  const handleReply = async (parentId: number, content: string, image: File | null, video: File| null) => {
    try {
        await submitReply({ parentPostId: parentId, content, image,video});
        if (id) fetchThread(parseInt(id));
    } catch (err) {
        console.error("Reply failed:", err);
    }
    };
  const handleReplyToggle = (postId: number) => {
    setReplyStates((prev) => ({
      ...prev,
      [postId]: { show: !prev[postId]?.show, text: prev[postId]?.text || "" },
    }));
  };

  const handleReplyTextChange = (postId: number, text: string) => {
    setReplyStates((prev) => ({
      ...prev,
      [postId]: { ...prev[postId], text },
    }));
  };

  const handleReplySubmit = async (postId: number, e: React.FormEvent) => {
    e.preventDefault();
    const reply = replyStates[postId];
    try {
      await submitReply({ parentPostId: postId, content: reply.text, image: image, video: video});
      setReplyStates((prev) => ({
        ...prev,
        [postId]: { show: false, text: "" },
      }));
      if (id) fetchThread(parseInt(id));
    } catch (err) {
      console.error("Failed to submit reply", err);
    }
  };
  const handleEdit = async(postId: number, currentContent: string, currentImage : File | null | undefined) => {
    setEditPostId(postId)
    setEditContent(currentContent);
    setEditPostImage(currentImage!);
    setShowEditModal(true)
  }
  const handleEditThread = async(threadId: number) => {
    setEditThreadId(Thread!.id);
    setEditThreadContent(Thread!.content);
    setEditThreadTitle(Thread!.title);
    setEditThreadImage(Thread!.image!);
    setShowThreadEditModal(true);
  }
  const handleDelete = async(postId: number) => {
    await deletePost(postId);
    if(id)
      await fetchThread(parseInt(id))
  }
  const handleDeleteThread = async(threadId: number) => {
    await deleteThread(threadId);
    if(id)
      navigate("/home")
  }
  if (loading) return <Spinner animation="border" />;
  if (error) return <div className="text-danger">Error: {error}</div>;
  if (!Thread) return <div>No thread found.</div>;
  const formatted = formatDistanceToNow(new Date(Thread.createdAt), {addSuffix: true})
  const formatted2 = (date: Date) => formatDistanceToNow(new Date(date), {addSuffix: true})
  return (
    <div className="container mt-4">
      <Card style={{backgroundColor: bg, color: color}}>
        <div className="p-3 rounded">
        <div className="d-flex align-items-start gap-2">
          <img src={toAbs(Thread.forumIconUrl)} className="avatar"/>
          <div className="d-flex flex-column">
          
          <span className="small flex-column">
            <strong>r/{Thread.forumTitle} • {formatted}</strong></span>
          <div className="fw-bold small d-flex flex-row">
          <button type="button" className="border-0 rounded-pill  btn-outline-primary pe-1 align-baseline fw-bold " style={{backgroundColor: bg, color: color}} onClick={() => fetchId(Thread.authorUsername)}>
            {Thread.authorUsername}
            </button>
          </div>
        </div>
        
        
        </div>
        </div>
        <Card.Body >
          <Card.Title >{Thread.title}</Card.Title>
          <br/>
          {Thread.imageUrl && (
            <div className="mb-3 justify-content-center d-flex">
              <img
                src={toAbs(Thread.imageUrl)}
                alt="Thread Image"
                style={{ maxWidth: "400px", borderRadius: "8px" }}
              />
            </div>
          )}
          {Thread.videoUrl && (
            <div className="ms-3 justify-content-center d-flex">
              <video width="400" controls>
                <source src={toAbs(Thread.videoUrl)} type={Thread.videoContentType ?? 'video/mp4'} />
              </video>
            </div>
          )}
          <Card.Subtitle className="mb-2">
          </Card.Subtitle>
          <Card.Text>{Thread.content}</Card.Text>
          <div>
          <div className="d-flex gap-2 mt-2">
            <div className={`rounded-pill align-items-center gap-2 px-2 py-1 vote-box d-flex ${userVote === 1 ? "upvoted" : userVote === -1 ? "downvoted" : ""}`}>
            <button className={`vote-btn ${userVote === 1 ? "upvoted" : ""}`} onClick={() => handleVote(1)}><FontAwesomeIcon icon={faArrowUp} style={{color: color}} /></button>
            <span className="vote-count">{voteCount}</span>
            <button className={`vote-btn ${userVote === -1 ? "downvoted" : ""}`} onClick={() => handleVote(-1)}><FontAwesomeIcon icon={faArrowDown} style={{color: color}}/></button>
            </div>
            <div className="align-items-center d-flex py-1 px-3 gap-2 comment-box rounded-pill ms-3">
            
            <button className="comment-btn rounded-pill align-items-center border-0" onClick={() =>setShowCommentBox(!showCommentBox)}><span className="me-3">{Thread.postCount}</span><FontAwesomeIcon icon={faComment} /></button>
            </div>
            {Thread.authorUsername === currentUser && (
            <div className="align-items-center vote-box d-flex py-1 px-1 gap-2 rounded-pill ms-3 comment-box">
              <button className="rounded-pill align-items-center comment-btn dropdown-toggle px-5 py-2 border-0" type="button" data-bs-toggle="dropdown" aria-expanded="false" style={{color: color}} >
                <FontAwesomeIcon icon={faEllipsis} />
              </button>
              <ul className="dropdown-menu">
                <li><button className="dropdown-item" onClick={() => handleEditThread(Thread.id)}>Edit</button></li>
                <li><button className="dropdown-item" onClick={() => handleDeleteThread(Thread.id)}>Delete</button></li>
              </ul>
            </div>
            )}
          </div>
          {showCommentBox && (
            <CommentForm threadId = {Thread.id} parentPostId={null}/>
          )}
          </div>
          {ShowThreadEditModal && (
            <Form onSubmit={(e) => {
              e.preventDefault();
              handleThreadEditSubmit(e)
              setShowThreadEditModal(false)
            }} className={`p-3 rounded mt-2 ${darkMode ? 'bg-dark text-white' : 'bg-light text-dark'}`} encType="multipart/form-data" method="post">
              <div className="d-flex flex-column gap-2">
                <Form.Group>
                  <Form.Label>Edit Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={EditThreadTitle}
                    onChange={(e) => setEditThreadTitle(e.target.value)}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Edit Content</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={EditThreadContent}
                    onChange={(e) => setEditThreadContent(e.target.value)}
                    />
                </Form.Group>
                <div className="position-relative d-inline-block mt-2">
                  <label htmlFor="thread-upload" style={{cursor: "pointer"}}>
                    <FontAwesomeIcon icon={faImage} />
                  </label>
                  <input 
                    id="thread-upload"
                    type="file"
                    accept="image/*,video/*"
                    className="d-none"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const file = e.target.files?.[0] ?? null;
                      handleThreadFileChange(file);
                    }}
                    />
                    <br/>
                    {EditThreadImagePreview && (
                      <div className="mt-2">
                      <img
                        src={EditThreadImagePreview}
                        alt="Preview"
                        style={{maxWidth: "200px" , borderRadius: "5px" }}
                      />
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={clearThreadPreviews}
                        className="ms-2"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                    {EditThreadVideoPreview  && (
                      <div className="mt-2">
                        <video src={EditThreadVideoPreview} controls preload="metadata" style={{maxWidth: "400px", maxHeight: 320}} />
                        <Button size="sm" variant="outline-secondary" className="mb-3 ms-2" onClick={clearThreadPreviews}>Remove</Button>
                      </div>
                    )}
                    <div className="d-flex justify-content-end gap-2">
                      <button type="submit">Save</button>
                      <button type="button" className="btn btn-secondary" onClick={() => setShowThreadEditModal(false)}>Cancel</button>
                    </div>
                </div>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>

      <h5 className="mt-4">Posts:</h5>
      <div className="container mt-4">
      <Card style={{backgroundColor: bg, color: color}}>
        {Thread.posts.map((post: Post) => {
          const replyState = replyStates[post.id] || { show: false, text: "" };
          const userVote = postUserVotes[post.id] || 0;
          const voteCount = postVoteCount[post.id] ?? post.likeCount;
          return (
            <div className="p-3 rounded">
            <div className="d-flex flex-row align-items-start gap-1">
                <img src={post.profileImageUrl} className="avatar"/>
                <div className="d-flex flex-column">
                <span className="medium flex-col"><button className="border-0 rounded-pill btn-outline-primary fw-bold" style={{backgroundColor: bg, color: color}} onClick={() => fetchId(post.authorUsername)}>{post.authorUsername}</button> <small className="text-secondary">• {formatted2(post.createdAt)}</small></span>
                </div>
              </div>
              <p>{post.content}</p>
              {post.imageUrl && (
                <img src={toAbs(post.imageUrl)} alt="Uploaded" style={{ maxWidth: "100%" }} />
              )}
              {post.videoUrl && (
                <video src={toAbs(post.videoUrl)} controls preload="metadata" style={{maxWidth: "400px", maxHeight: 320}} />
              )}
              <div className="d-flex align-items-center gap-3 mt-1">
                <div className="d-flex align-items-center gap-2">
                <button
                  className={`vote-btn ${userVote === 1 ? "upvoted" : ""}`}
                  onClick={() => handlePostVote(post.id, 1)}
                  >
                    <FontAwesomeIcon icon={faArrowUp} />
                  </button>
                  <span>{voteCount}</span>
                <button
                  className={`vote-btn ${userVote === -1 ? "downvoted" : ""}`}
                  onClick={() => handlePostVote(post.id, -1)}
                >
                  <FontAwesomeIcon icon={faArrowDown} />
                </button>
              </div>
                <Button
                  size="sm"
                  variant="outline-primary"
                  className="rounded-pill my-2 mx-1"
                  onClick={() => handleReplyToggle(post.id)}
                >
                  {replyState.show ? "Cancel" : <><FontAwesomeIcon icon={faComment} className="me-1"/> Reply </>}
                </Button>
                {post.authorUsername === currentUser && (
                <div className="dropdown">
                  <button className="btn btn-sm bg-gradient dropdown-toggle"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false">
                  <FontAwesomeIcon icon={faEllipsis} />        
                  </button>
                  <ul className="dropdown-menu">
                    <li><button className="dropdown-item" onClick={() => handleEdit(post.id, post.content,post.image )}>Edit</button></li>
                    <li><button className="dropdown-item" onClick={() => handleDelete(post.id)}>Delete</button></li>
                  </ul>
                </div>
                )}
              </div>
              {EditPostId === post.id && ShowEditModal && (
                <Form onSubmit={(e) => {
                  handlePostEditSubmit(e)
                  setShowEditModal(false)
                  }} className={`p-3 rounded mt-2 ${darkMode ? 'bg-dark text-white' : 'bg-light text-dark'}`} encType="multipart/form-data" method="post">
                  <div className="d-flex flex-column gap-2">
                    <div className="d-flex align-items-center gap-3">
                      <label htmlFor="upload" style={{cursor: "pointer"}}>
                                              <FontAwesomeIcon icon={faImage} />
                      </label>
                    <input
                      id="upload"
                      type="file"
                      accept="image/*,video/*"
                      className="mt-1"
                      onChange={(e:React.ChangeEvent<HTMLInputElement>) => {
                        const file = e.currentTarget.files?.[0] ?? null;
                        handlePostFileChange(file)
                      }}
                      />
                      <span className={`${darkMode ? 'text-white' : 'text-dark'}`}>Aa</span>
                      {EditPostImagePreview && (
                        <div className="mt-2">
                          <img
                            src={EditPostImagePreview}
                            alt="Preview"
                            style={{ maxWidth: "200px" }}
                          />
                          <Button size="sm" variant="outline-secondary" className="ms-2" onClick={clearPostPreviews}>Remove</Button>
                        </div>
                      
                    )}
                    {EditPostVideoPreview && (
                      <div className="mt-2">
                        <video src={EditPostVideoPreview} controls preload="metadata" style={{maxWidth: "400px", maxHeight: 320}}/>
                        <Button size="sm" variant="outline-secondary" className="ms-2" onClick={clearPostPreviews}>Remove</Button>
                       </div>
                    )}
                      </div>
                    <textarea 
                      className={`form-control ${darkMode ? 'bg-dark text-white' : 'bg-light text-dark'}`}
                      placeholder="Add a comment"
                      value={EditContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                    />
                    {post.imageUrl && (
                      <div className="position-relative" style={{maxWidth: "200px"}}>
                      <img src={toAbs(post.imageUrl)} alt="Current" width="100" />
                      <label>
                        <input 
                          type="checkbox"
                          checked={EditRemoveImage}
                          onChange={(e) => {
                            setEditRemoveImage(e.target.checked);
                            if (e.target.checked) setEditPostImage(null);
                          }}
                          />
                          Remove Image
                      </label>
                      </div>
                    )}
                    {post.videoUrl && (
                      <div className="position-relative" style={{maxWidth: "200px"}}>
                        <video src={toAbs(post.videoUrl)} controls preload="metadata" style={{maxWidth: "400px", maxHeight: 320}}/>
                        <label>
                        <input 
                          type="checkbox"
                          checked={EditPostRemoveVideo}
                          onChange={(e) => {
                            setEditPostRemoveVideo(e.target.checked);
                            if (e.target.checked) setEditPostVideo(null);
                          }}
                          />
                          Remove Video
                      </label>
                      </div>
                    )}
                    <div className="d-flex justify-content-end gap-2">
                    <button type="submit">Save</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                    </div>
                    
                    </div>
                </Form>
              )}
              {replyState.show && (
                <Form onSubmit={(e) => handleReplySubmit(post.id, e)} className="mt-2">
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={replyState.text}
                    onChange={(e) => handleReplyTextChange(post.id, e.target.value)}
                    placeholder="Write your reply..."
                  />
                  <Form.Control
                      type="file"
                      accept="image/*,video/*"
                      className="mt-1"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const file = e.currentTarget.files?.[0] ?? null;
                        handleReplyFileChange(file)}
                      }
                    />

                    {/* Preview area */}
                    {imagePreview && (
                      <div className="mt-2">
                        <img src={imagePreview} alt="preview" style={{ maxWidth: "400px", maxHeight: 240 }} />
                        <Button size="sm" variant="outline-secondary" className="ms-2" onClick={clearPreviews}>Remove</Button>
                      </div>
                    )}
                    {videoPreview && (
                      <div className="mt-2">
                        <video src={videoPreview} controls preload="metadata" style={{ maxWidth: "400px", maxHeight: 320 }} />
                        <Button size="sm" variant="outline-secondary" className="ms-2" onClick={clearPreviews}>Remove</Button>
                      </div>
                    )}

                  <Button type="submit" variant="primary" size="sm" className="mt-1">
                    Submit Reply
                  </Button>
                </Form>
              )}

              {post.replies.length > 0 && (
                <ul className="mt-2 ms-3 list-unstyled">
                  {post.replies.map((reply) => (
                    <ReplyItem
                      key={reply.id}
                      reply={reply}
                      onReplySubmit={(parentId, content,image,video) =>
                        handleReply(parentId, content, image,video)
                      }
                      onLikeReply={(replyId, voteValue) => likePost({postId: replyId, voteValue})}
                      onEditReply={(replyId, newContent, editRemoveImage, editImage, editRemoveVideo, editVideo) => 
                        handleEditReply(replyId, newContent, editRemoveImage, editImage, editRemoveVideo, editVideo)
                      }
                    />
                  ))}
                </ul>
              )}
            </div>
          );
        })}
        
      </Card>
      </div>
    </div>
  );
};

export default ThreadPage;
