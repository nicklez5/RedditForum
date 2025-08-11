import React, { useEffect, useState } from "react";
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
  const [threadId, setThreadId] = useState<number>(parseInt(id!))
  const [parentPostId, setParentPostId] = useState<number | null>(null);
  const [postVoteCount, setPostVoteCount] = useState<Record<number,number>>({});
  const [postUserVotes, setPostUserVotes] = useState<Record<number, number>>({});
  const [EditPostId, setEditPostId] = useState(0)
  const [EditContent, setEditContent] = useState('')
  const [EditPostImage, setEditPostImage] = useState<File | null>(null);
  const [EditRemoveImage, setEditRemoveImage] = useState(false);

  const [EditThreadId, setEditThreadId] = useState(0)
  const [EditThreadContent, setEditThreadContent] = useState('')
  const [EditThreadTitle, setEditThreadTitle] = useState('');
  const [EditThreadImage, setEditThreadImage] = useState<File | null>(null);
  const [EditThreadImagePreview , setEditThreadImagePreview] = useState<string | null>(null);
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
  useVisitTracker({type: "thread", id: Number(id)});
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
      setEditThreadImagePreview(`http://localhost:5220/${Thread.imageUrl}`)
    }
  },[Thread])
  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    const dto: CreatePostDto = {
      content,
      threadId,
      parentPostId,
      image
    }
    await createPost(dto);
    await fetchThread(parseInt(id!))
  }
  const handleEditReply = async(replyId: number, newContent: string, editRemoveImage: boolean, editImage: File | null) => {
    const dto: EditPostDto = {
      id: replyId,
      content: newContent,
      removeImage: editRemoveImage,
      image: editImage
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
      image: EditThreadImage
    }
    await editThread(dto)
    await fetchThread(parseInt(id!));
  }
  const getImageUrl = (image: File | null): string | null => {
    if(image){
      return URL.createObjectURL(image);
    }
    return null;
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
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if(file) setImage(file);
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
  const handlePost = async(threadId: number, content:string ) => {
    try{
      await createPost({content: content, threadId: Thread!.id, parentPostId: null})
      if(id) fetchThread(parseInt(id));
    }catch(err){
      console.error("Post failed:", err);
    }
  }
  const handleReply = async (parentId: number, content: string, image: File | null) => {
    try {
        await submitReply({ parentPostId: parentId, content, image});
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
    if (!reply?.text.trim()) return;

    try {
      await submitReply({ parentPostId: postId, content: reply.text });
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
        <div className="d-flex flex-row align-items-center gap-1">
          <img src={`http://localhost:5220/${Thread.forumIconUrl}`} className="avatar"/>
          <span className="small flex-col"><strong>r/{Thread.forumTitle} • {formatted}</strong></span>
        </div>
        <div className="fw-bold ms-lg-5 small"><Link to="/profile" className="no-hover">{Thread.authorUsername}</Link></div>
        </div>
        <Card.Body >
          <Card.Title >{Thread.title}</Card.Title>
          <br/>
          {Thread.imageUrl && (
            <div className="mb-3">
              <img
                src={`http://localhost:5220/${Thread.imageUrl}`}
                alt="Thread Image"
                style={{ maxWidth: "100%", borderRadius: "8px" }}
              />
            </div>
          )}
          <Card.Subtitle className="mb-2">
          </Card.Subtitle>
          <Card.Text>{Thread.content}</Card.Text>
          <div>
          <div className="d-flex gap-2 mt-2">
            <div className={`rounded-pill align-items-center gap-2 px-3 py-1 vote-box d-flex ${userVote === 1 ? "upvoted" : userVote === -1 ? "downvoted" : ""}`}>
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
                    accept="image/*"
                    className="d-none"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setEditThreadImage(file);
                      setEditThreadRemoveImage(false);
                      if(file){
                        const previewURL = URL.createObjectURL(file);
                        setEditThreadImagePreview(previewURL)
                      }else{
                        setEditThreadImagePreview(null);
                      }
                    }}
                    />
                    <br/>
                    {EditThreadImagePreview && (
                      <div>
                      <img
                        src={EditThreadImagePreview}
                        alt="Preview"
                        style={{maxWidth: "200px" , borderRadius: "5px" }}
                      />
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => {
                          setEditThreadImage(null);
                          setEditThreadRemoveImage(true);
                          setEditThreadImagePreview(null);
                        }}
                        className="ms-2"
                        >
                          Remove Image
                        </Button>
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
            <div className="d-flex flex-row align-items-center gap-1">
                <img src={post.profileImageUrl} className="avatar"/>
                <span className="medium flex-col"><strong>{post.authorUsername}</strong> <small className="text-secondary">• {formatted2(post.createdAt)}</small></span>
              </div>
              <p>{post.content}</p>
              {post.imageUrl && (
                <img src={`http://localhost:5220/${post.imageUrl}`} alt="Uploaded" style={{ maxWidth: "100%" }} />
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
                      accept="image/*"
                      onChange={(e) => {
                        setEditPostImage(e.target.files?.[0] ?? null);
                        setEditRemoveImage(false);
                      }}
                      />
                      <span className={`${darkMode ? 'text-white' : 'text-dark'}`}>Aa</span>
                      {EditPostImage && (
                      <img
                        src={URL.createObjectURL(EditPostImage)}
                        alt="Preview"
                        style={{ maxWidth: "200px" }}
                      />
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
                      <img src={`http://localhost:5220/${post.imageUrl}`} alt="Current" width="100" />
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
                      onReplySubmit={(parentId, content,image) =>
                        handleReply(parentId, content, image)
                      }
                      onLikeReply={(replyId, voteValue) => likePost({postId: replyId, voteValue})}
                      onEditReply={(replyId, newContent, editRemoveImage, editImage) => 
                        handleEditReply(replyId, newContent, editRemoveImage, editImage)
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
