import {useEffect, useState} from "react";
import {Container, Row, Col, Card, Spinner} from "react-bootstrap";
import AdminSidebar from "./AdminSidebar";
import api from "../api/forums";

const AdminDashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading , setLoading] = useState(true);
    useEffect(() => {
        api.get("/api/admin/stats")
        .then(res => setStats(res.data))
        .catch(err => console.error("Failed to fetch stats", err))
        .finally(() => setLoading(false)); 
    },[])
    if(loading){
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" />
            </div>
        )
    }
    return (
        <Container fluid>
            <Row>
                <Col md={2} className="p-0">
                    <AdminSidebar active="dashboard" />
                </Col>
                <Col md={10} className="p-4">
                    <h2>Admin Dashboard</h2>
                    <Row className="mt-4">
                        <Col md={3}>
                            <Card className="p-3 text-center">
                                <h5>Users</h5>
                                <h3>{stats.usersCount}</h3>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="p-3 text-center">
                                <h5>Forums</h5>
                                <h3>{stats.forumsCount}</h3>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="p-3 text-center">
                                <h5>Threads</h5>
                                <h3>{stats.threadsCount}</h3>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="p-3 text-center">
                                <h5>Posts</h5>
                                <h3>{stats.postsCount}</h3>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="p-3 text-center">
                                <h5>Messages</h5>
                                <h3>{stats.messagesCount}</h3>
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    )
}
export default AdminDashboard;