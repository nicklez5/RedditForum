import React, {useState, useEffect} from "react";
import {Container, Row, Col, Card, Button} from "react-bootstrap";
import { useStoreActions, useStoreState } from "../interface/hooks";
import { Link } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { Post } from "../interface/PostModel";
import EditPostModal from "./EditPostModal";
import PostItem from "./PostItem";
const AdminPosts = () => {
    const posts = useStoreState((s) => s.post.posts);
    const {GetAllPostsFlatten, GetPostById, DeletePost, EditPost} = useStoreActions((a) => a.post);
    const [selectedPost , setSelectedPost] = useState<Post | null>(null);
    const [showModal, setShowModal] = useState(false);
    useEffect(() => {
        GetAllPostsFlatten();
    },[])

    return (
        <Container fluid className="mt-5">
    <Row>
      <Col md={2}>
        <AdminSidebar active="posts" />
      </Col>

      <Col md={10}>
        <h2 className="mt-4">Modify Posts</h2>

        <div className="mt-4">
          <h4 className="border-bottom pb-2">Posts</h4>
          
            {posts.map((post) => <PostItem key={post.id} post={post} />)}
           
        </div>

        
      </Col>
    </Row>
  </Container>
    )
}
export default AdminPosts;