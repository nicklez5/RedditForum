import React, {useEffect, useState} from "react";
import {Container, ListGroup, Form,Spinner, Alert, Button, Row, Col} from "react-bootstrap";
import {useNavigate} from "react-router-dom"
import api from "../api/forums";
import { Profile } from "../interface/ProfileModel";
import { CreateMessageDto, Message } from "../interface/MessageModel";
import { useStoreActions, useStoreState } from "../interface/hooks";
import { useTheme } from "./ThemeContext";
const MessageConvo = () => {
    const {darkMode} = useTheme();
    const [recipientId, setRecipientId] = useState('');
    const [editingMessageId, setEditingMessageId] = useState<number|null>(null);
    const [editContent , setEditContent] = useState('')
    const [content, setContent] = useState('');
    const loading = useStoreState((s) => s.message.loading);
    const error = useStoreState((s) => s.message.error);
    const navigate = useNavigate();
    const currentUserId = useStoreState((s) => s.user.Id);
    const fetchMessages = useStoreActions((a) => (a.message.fetchMessages));
    const fetchProfiles = useStoreActions((a) => a.profile.fetchProfiles)
    const sendMessage = useStoreActions((a) => a.message.sendMessage);
    const deleteMessage = useStoreActions((a) => a.message.removeMessage);
    const editMessage = useStoreActions((a) => a.message.editMessage);
    const profiles = useStoreState((s) => s.profile.profile);
    const messages = useStoreState((s) => s.message.messages);
    useEffect(() => {
        fetchMessages();
        fetchProfiles();
    }, [])
    const bg = darkMode ? "#3E4B58" : "#ffffff";
    const color = darkMode ? "white": "black";
    const handleDelete = async(id: number) => {
        await deleteMessage(id);
        await fetchMessages();
    }
    const handleEdit = async(id: number) => {
        await editMessage({id:id,content: editContent});
        await fetchMessages();
    }
    const handleSendMessage = async(e : React.FormEvent) => {
        e.preventDefault();
        try{
            const dto: CreateMessageDto = {
                recipientId: recipientId,
                content: content
            }
            await sendMessage(dto)
        }catch(err){
            console.log('Failed to send message ')
        }
    }
    return (
        <Container className="my-4">
            <h2>All Messages</h2>
            {loading && <Spinner animation="border" />}
            {error && <Alert variant="danger">{error}</Alert>}
            <ListGroup className="mb-4" >
                {messages.map((msg) => (
                    <ListGroup.Item key={msg.id} style={{color: color, backgroundColor: bg}}>
                        <div className="d-flex justify-content-between align-items-start">
                        <div style={{flex : 1}}>
                        <strong className={`${darkMode ? "medium text-white fw-bold" : 'medium text-black fw-bold'}`}>{msg.senderUsername}</strong>  → <strong className={`${darkMode ? "medium text-white fw-bold" : 'medium text-black fw-bold'}`}>{msg.recipientUsername}</strong>
                        <div className={`${darkMode ? "medium text-white fw-bold" : 'medium text-black fw-bold'}`}>
                        {new Date(msg.sentAt).toLocaleString()}
                        </div>
                        {editingMessageId === msg.id ? (
                            <Form 
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleEdit(msg.id);
                                }}
                            >
                                <Form.Control
                                    as="textarea"
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="my-2"
                                />
                                <Button type="submit" size="sm" variant="success" className="me-2">Save</Button>
                                <Button size="sm" variant="secondary" onClick={() => setEditingMessageId(null)}>Cancel</Button>
                            </Form>
                        ): (
                            <p className="medium font-monospace">{msg.content}</p>
                        )}
                        </div>
                         {msg.senderId === currentUserId && ( // Optional: restrict edit/delete to sender
                        <div className="ms-3 d-flex flex-column">
                            <Button
                            size="sm"
                            variant="outline-primary"
                            className="mb-2"
                            onClick={() => {
                                setEditingMessageId(msg.id);
                                setEditContent(msg.content);
                            }}
                            >
                            ✏️
                            </Button>
                            <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDelete(msg.id)}
                            >
                            🗑
                            </Button>
                        </div>
                         )}
                        </div>
                    </ListGroup.Item>
                    
                ))}
            </ListGroup>
            <h4>Send a Message</h4>
            <Form onSubmit={handleSendMessage} >
                <Row>
                    <Col md={4}>
                        <Form.Select 
                            value={recipientId}
                            onChange={(e) => setRecipientId(e.target.value)}
                            required
                        >
                            <option value="">Select recipient</option>
                            {profiles.map((profile) => (
                                <option key={profile.id} value={profile.id}>
                                    {profile.username}
                                </option>
                            ))}
                        </Form.Select>
                    </Col>
                    <Col md={6}>
                        <Form.Control
                            type="text"
                            placeholder="Enter your message..."
                            value={content}
                            style={{ padding: '0.5rem 0.75rem', lineHeight: '1.5', color: color, backgroundColor: bg}}
                            onChange={(e) => setContent(e.target.value)}
                            required
                        />
                    </Col>
                    <Col md={2}>
                        <Button type="submit" variant="primary" disabled={!recipientId || !content.trim()}>
                            Send
                        </Button>
                    </Col>
                </Row>
            </Form>
        </Container>
    )
}
export default MessageConvo