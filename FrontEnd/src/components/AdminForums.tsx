import React, {useState, useEffect} from "react";
import {Container, Row, Col,Card, Button } from "react-bootstrap";
import { useStoreActions, useStoreState } from "../interface/hooks";
import { Link } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { Forum } from "../interface/ForumModel";
import EditForumModal from "./EditForumModal";
const AdminForums = () => {
    const forums = useStoreState((s) => s.forum.forums)
    const forum = useStoreState((s) => s.forum.selectedForum);
    const {GetAllForums, GetForumById, DeleteForum, EditForum} = useStoreActions((a) => a.forum)
    const [selectedForum, setSelectedForum] = useState<Forum | null>(null);
    const [showModal ,setShowModal] = useState(false);
    useEffect(() => {
        GetAllForums();
    },[])
    return (
        <Container fluid className="mt-5">
            <Row>
                <Col md={2}>
                    <AdminSidebar active="forums" />
                </Col>
                <Col md={10}>
                    <h2 className="mt-4">Modify Forums</h2>
                    <Row className="mt-4" md={2}>
                        <Col md={6}>
                            {forums.map(forum =>
                                <>
                                <Link to={`/forum/${forum.id}`} style={{textDecoration: "none"}}>
                                <Card className="p-3 text-center mt-2">
                                <span>Forum Title </span>
                                <h3>{forum.title}</h3>
                                <hr/>
                                <span className="small">Forum Description</span>
                                <p>{forum.description}</p>
                                <hr/>
                                <span>Members </span>
                                <h3>{forum.users.length}</h3>
                                </Card>
                                </Link>
                                <div className="d-flex align-items-center justify-content-center mt-3">
                                <Button size="sm" variant="outline-danger" onClick={() => {
                                    if(window.confirm("Are you sure you want to delete this item?")){
                                        DeleteForum(forum.id)
                                    }
                                }} className="rounded-pill px-3 mx-3 bg-danger fs-6 fw-bold text-white border border-danger">Delete</Button>
                                <Button size="sm" variant="outline-primary" onClick={() => {
                                    setSelectedForum(forum)
                                    setShowModal(true);
                                }} className="rounded-pill bg-success text-white border border-success px-3 ">Edit</Button>
                                </div>
                                </>
                            )}
                        </Col>
                    </Row>
                </Col>
            </Row>
        {selectedForum && (
            <EditForumModal
                forum={{
                    id: selectedForum.id.toString(),
                    title: selectedForum.title,
                    description: selectedForum.description,
                    iconUrl: selectedForum.iconUrl,
                    bannerUrl: selectedForum.bannerUrl
                }}
                show={showModal}
                onClose={() => setShowModal(false)}
            />
        )}
        </Container>
    )
}
export default AdminForums