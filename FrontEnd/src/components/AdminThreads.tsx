import React, {useState, useEffect} from "react";
import {Container, Row, Col, Card, Button} from "react-bootstrap"
import { useStoreActions,useStoreState } from "../interface/hooks";
import { Link } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { Thread } from "../interface/ThreadModel";
import EditThreadModal from "./EditThreadModal";
import ThreadItem from "./ThreadItem";
const AdminThreads = () => {
    const threads = useStoreState((s) => s.thread.threads);
    const {GetAllThreads, GetThreadById, DeleteThread, EditThread} = useStoreActions((a) => a.thread)
    const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
    const [showModal, setShowModal] = useState(false);
    useEffect(() => {
        GetAllThreads();
    },[])
    return (
        <Container fluid className='mt-5'>
            <Row>
                <Col md={2}>
                    <AdminSidebar active="threads" />
                </Col>
                <Col md={10}>
                <h2 className="mt-4">Modify Threads</h2>
                <Row className="mt-4" md={2}>
                    <Col md={12}>
                    {threads.map(thread => 
                        <ThreadItem key={thread.id} thread={thread} />
                    )}
                    </Col>
                </Row>
                </Col>
            </Row>
        </Container>
    )
}
export default AdminThreads;