import React, {useEffect, useState} from "react";
import { Post } from "../interface/PostModel";
import { Link } from "react-router-dom";
import { Button, Card } from "react-bootstrap";
import { useStoreActions, useStoreState } from "../interface/hooks";
import EditPostModal from "./EditPostModal";
const PostItem = ({post} : {post : Post}) => {
    const posts = useStoreState((s) => s.post.posts);
    const {DeletePost, GetAllPosts} = useStoreActions((a) => a.post)
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [showModal, setShowModal] = useState(false);
    //const replies = posts.filter(p => p.parentPostId === post.id);

    return (
        <div >
        <Link to={`/posts/${post.id}`} style={{textDecoration: "none"}}>
        <Card className="p-3 text-center mt-2">
            <span className="small">Post Content</span>
            <p>{post.content}</p>
            <hr/>
            <span className="small">Post Image</span>
            <div className="d-flex align-items-center justify-content-center">
            
            <img src={`http://localhost:5220${post.imageUrl}`} alt="" width="300" className=""/>
            </div>
            <hr/>
            <span className="small">Post Date</span>
            <p>{new Date(post.createdAt).toLocaleString()}</p>
            <hr/>
            <span className="small">Post Author</span>
            <p>{post.authorUsername}</p>
        </Card> 
        </Link>
        <div className="d-flex align-items-center justify-content-center mt-3">
            <Button size="sm" variant="outline-danger" onClick={() => {
                if(window.confirm("Are you sure you want to delete this post")){
                    DeletePost(post.id)
                }
            }} className="rounded-pill px-3 mx-3 bg-danger fs-6 fw-bold text-white border border-danger">Delete</Button>
            <Button size="sm" variant="outline-primary" onClick={() => {
                setSelectedPost(post)
                setShowModal(true)
            }} className="rounded-pill bg-success text-white border border-success px-3">Edit</Button>
        </div>
         
        {selectedPost && (
            <EditPostModal 
                post={{
                    id: post.id,
                    content: post.content,
                    imageUrl: post.imageUrl
                }}
                show={showModal}
                onClose={() => setShowModal(false)}
            />
        )}
        </div>
        
    )
}
export default PostItem;