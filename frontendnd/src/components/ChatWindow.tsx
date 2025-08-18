import React, {useEffect, useState} from 'react';
import { Form, Button} from 'react-bootstrap';
import {useStoreActions, useStoreState} from "../interface/hooks";
import { useTheme } from './ThemeContext';
const ChatWindow = ({recipientId } : {recipientId: string}) => {
    const messages = useStoreState((s) => s.user.Messages);
    const currentUser = useStoreState((s) => s.user.Profile);
    const deleteMessage = useStoreActions((a) => a.message.removeMessage);
    const sendMessage = useStoreActions((a) => a.message.sendMessage);
    const fetchMessages = useStoreActions((a) => a.user.fetchMessages);
    const updateMessage = useStoreActions((a) => a.message.editMessage);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState('');
    const {darkMode} = useTheme();
    const [text, setText] = useState('')
    useEffect(() => {
        fetchMessages();
    },[fetchMessages]);

    const filteredMessages = messages.filter(
        (msg) => 
        (msg.senderId === currentUser!.id && msg.recipientId === recipientId) ||
        (msg.senderId === recipientId && msg.recipientId === currentUser!.id)
    );
    const handleDelete = async(id: number) => {
        await deleteMessage(id);
        fetchMessages();
    } 
    const handleSend = async(e: React.FormEvent) => {
        e.preventDefault();
        if(!text.trim()) return;
        await sendMessage({recipientId, content: text});
        setText('');
        fetchMessages();
    }
    const handleUpdate = async() => {
        if(!editContent.trim() || editingId === null) return;
        await updateMessage({id: editingId, content: editContent})
        setEditingId(null);
        setEditContent('')
        fetchMessages();
    }
    const bg = darkMode ? "#1a1a1b" : "#ffffff";
    const color = darkMode ? "white": "black";
    return (
        <div className="d-flex flex-column h-100 border-3 mt-1" style={{backgroundColor: bg, color: color}}>
            <div className="flex-grow-1 overflow-auto p-3 flex-column justify-content-end " style={{maxHeight: 'calc(100vh- 120px)'}}>
                {[...filteredMessages].reverse().map((msg) => (
                    <div key={msg.id} className={`mb-2 d-flex ${msg.senderId === currentUser!.id ? 'justify-content-end' : 'justify-content-start'}`}
                    >
                    <img src={msg.senderProfileImageUrl} alt="avatar" style={{ width: "50px", height: "50px", borderRadius: "50%"}}/>
                    <div className={`p-2 rounded ${msg.senderId === currentUser!.id ? 'bg-primary text-white' : 'bg-light text-dark'}`} style={{ maxWidth: '70%' }}>
                        
                    {editingId === msg.id ? (
                        <>
                        <Form.Control
                            as="textarea"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={2}
                            className="mb-1"
                        />
                        <div className="d-flex justify-content-end gap-2">
                            <Button size="sm" variant="success" onClick={handleUpdate}>
                                Save
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => setEditingId(null)}>
                               Cancel
                            </Button>
                        </div>
                        </>
                    ) : (
                        <>
                            <div>{msg.content}</div>
                            <div className="text-muted small">{new Date(msg.sentAt).toLocaleTimeString()}</div>
                        
                            
                            {msg.senderId === currentUser!.id && (
                            <div className="d-flex gap-1 justify-content-end mt-1">
                            <Button size="sm" variant="outline-light" onClick={() => {
                                setEditingId(msg.id);
                                setEditContent(msg.content)
                            }}>
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
                        </>
                    )}
                    </div>
                    </div>
                ))}
            </div>
            <Form onSubmit={handleSend} className="border-top p-0 m-0 w-100 d-flex bg-dark" style={{ minHeight: '60px' }}>
                <Form.Control
                    type="text"
                    placeholder="Type a message..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="flex-grow-1 border-0 m-0"
                    
                    style={{outline: 'none', boxShadow: 'none',backgroundColor: 'transparent', color: color}}
                    />
                <Button type="submit">Send</Button>
            </Form>
        </div>
    )
}
export default ChatWindow