import React, {useState, useEffect, useRef} from 'react';
import { Button, Form} from 'react-bootstrap';
import { useStoreState, useStoreActions} from '../interface/hooks';
import { useTheme } from './ThemeContext';

interface FloatingChatBoxProps{
    recipientId: string,
    username: string,
    onClose: () => void;
    profileImageUrl: string,
    offset: number;
}
const FloatingChatBox = ({recipientId, username, onClose, offset, profileImageUrl} : FloatingChatBoxProps) => {
    const messages = useStoreState((s) => s.user.Messages)
    const profile = useStoreState((s) => s.user.Profile);
    const sendMessage = useStoreActions((a) => a.message.sendMessage);
    const deleteMessage = useStoreActions((a) => a.message.removeMessage);
    const {darkMode, toggleDarkMode} = useTheme();
    const updateMessage = useStoreActions((a) => a.message.editMessage);
    const fetchMessages = useStoreActions((a) => a.user.fetchMessages)
    const [text,setText] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);
    const chatMessages = messages.filter(
        (m: any) =>
        (m.senderId === profile!.id && m.recipientId === recipientId) || 
        (m.senderId === recipientId && m.recipientId === profile!.id)
    );
    const bg = darkMode ? "#212529" : "#ffffff";
    const color = darkMode ? "white" : "black";
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth'});
    },[chatMessages]);
    const handleDelete = async(id: number) => {
        await deleteMessage(id);
        fetchMessages();
    }
    const handleSend = async(e: React.FormEvent) => {
        e.preventDefault();
        if(!text.trim()) return;
        await sendMessage({recipientId, content: text})
        setText('');
        fetchMessages();
    }
    const handleUpdate = async() => {
        if(!editContent.trim() || editingId === null) return;
        await updateMessage({id: editingId, content: editContent})
        setEditingId(null);
        setEditContent('');
        fetchMessages();
    }
    return (
        <div className="rounded shadow bg-dark text-white d-flex flex-column"
            style={{
                position: 'fixed',
                bottom: '20px',
                right: `${20 + offset * 340}px`,
                width: "320px",
                height: '420px',
                zIndex: 9999,
                border: "1px solid rgba(255,255,255,0.1)",
            }}
        >
            <div className="p-2 border-bottom d-flex justify-content-between align-items-center bg-black">
                 <div className="d-flex align-items-center gap-2">
                <img
                    src={profileImageUrl}
                    alt="avatar"
                    style={{ width: '30px', height: '30px', borderRadius: '50%' }}
                />
                <strong>{username}</strong>
                </div>
                <Button size="sm" variant="outline-light" onClick={onClose}>
                    ✕
                </Button>
            </div>
        {/* Messages */}
      <div className="flex-grow-1 p-2 overflow-auto">
        {[...chatMessages].reverse().map((msg: any) => (
          <div
            key={msg.id}
            className={`mb-2 d-flex ${msg.senderId === profile!.id ? 'justify-content-end' : 'justify-content-start'}`}
          >
            <div
              className={`p-2 rounded ${
                msg.senderId === profile!.id ? 'bg-primary text-white' : 'bg-light text-dark'
              }`}
              style={{ maxWidth: '75%', position: 'relative' }}
            >
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
                  <div className="text-muted small text-end">{new Date(msg.sentAt).toLocaleTimeString()}</div>
                  {msg.senderId === profile!.id && (
                    <div className="d-flex gap-1 justify-content-end mt-1">
                      <Button
                        size="sm"
                        variant="outline-light"
                        onClick={() => {
                          setEditingId(msg.id);
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
                </>
              )}
                </div>
            </div>
            ))}
            <div ref={bottomRef} />
        </div>

        {/* Input */}
        <Form onSubmit={handleSend} className="border-top p-2 d-flex m-0">
            <Form.Control
                type="text"
                placeholder="Type a message"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-grow-1 border-0 rounded-0 px-3 py-2"
                style={{
                    backgroundColor: bg, // optional
                    boxShadow: 'none',
                    color: color,
                }}
            />
            <Button type="submit" className="rounded-0 px-3">
                Send
            </Button>
            </Form>
        </div>
    );

}
export default FloatingChatBox;