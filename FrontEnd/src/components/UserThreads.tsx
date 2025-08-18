import React, {useState, useEffect} from "react";
import {Container, Row, Col, Card, Button} from "react-bootstrap";
import { useStoreActions, useStoreState } from "../interface/hooks";
import { Link } from "react-router-dom";
import UserSidebar from "./UserSidebar";
import { Post } from "../interface/PostModel";
import EditPostModal from "./EditPostModal";
import PostItem from "./PostItem";
import ThreadItem from "./ThreadItem";
const UserThreads = () => {
    const activity = useStoreState((s) => s.user.Activity);
    const fetchActivity = useStoreActions((a) => a.user.fetchActivity);
    const [selectedPost , setSelectedPost] = useState<Post | null>(null);
    const [showModal, setShowModal] = useState(false);
    useEffect(() => {
        fetchActivity();
    },[])

    return (
        <Container fluid className="mt-5">
    <Row>
      <Col md={2}>
        <UserSidebar active="threads" />
      </Col>

      <Col md={10}>
        <h2 className="mt-4">Modify Threads</h2>

        <div className="mt-4">
          <h4 className="border-bottom pb-2">Threads</h4>
          
            {activity.threads.map((thread) => 
            <ThreadItem key={thread.id} thread={thread} />
            )}
           
        </div>

        
      </Col>
    </Row>
  </Container>
    )
}
export default UserThreads;