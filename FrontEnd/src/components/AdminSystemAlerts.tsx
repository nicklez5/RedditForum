import React, {useState} from "react";
import {Button, Col, Container, Form, Row} from "react-bootstrap";
import api from "../api/forums";
import AdminSidebar from "./AdminSidebar";

const AdminSystemAlert = () => {
    const [message, setMessage] = useState("");
    const handleSendAlert = async() => {
        try{
            await api.post("/api/admin/alert", {
                message: message
            })
            alert("System alert sent!");
            setMessage("");
        }catch(err){
            alert("Failed to send system alert");
        }
    }
    return (
        <>
        <Container fluid className="mt-5">
        <Row>
            <Col md={2} className="p-0">
                <AdminSidebar active="systemalerts" />
            </Col>
            <Col md={10} className="p-4">
                <div className="d-flex align-items-center justify-content-center" style={{minHeight: "50vh"}}>
                <div  style={{width: "700px"}} className="mt-5">
                    <h3>Send System Alert</h3>
                    <Form.Control 
                        as="textarea"
                        rows={8}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type system alert here.."
                        className="mb-3"
                    />
                    <Button variant="primary" onClick={handleSendAlert}>
                        Send Alert
                    </Button>
                </div>
            </div>
            </Col>
        </Row>
        </Container>
        </>
    )
}
export default AdminSystemAlert;