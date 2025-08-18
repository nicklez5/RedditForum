import React, {useState} from "react";
import { Container, Row, Col} from "react-bootstrap"
import ChatWindow from './ChatWindow';
import { useTheme } from "./ThemeContext";
import { useStoreActions, useStoreState } from "../interface/hooks";
import NewChatSelector from "./NewChatSelector";
import ChatSidebar from "./ChatSidebar";

const ChatPage = () => {
    const {darkMode} = useTheme();
    const [activeUser, setActiveUser] = useState<string | null>(null);
    const openChats = useStoreState((s) => s.chat.openChats);
    const closeChat = useStoreActions((a) => a.chat.closeChat);
    return (
        <Container fluid className="p-0" style={{height: '91.8vh'}}>
            <Row className="h-100 g-0">
                <Col md={3} className={`${darkMode ? 'bg-dark text-white overflow-' : 'bg-white text-black overflow-auto'}`}>
                     <div className="p-1 mt-2">
                        <NewChatSelector />
                        <hr />
                        <ChatSidebar activeUser={activeUser} onSelectUser={(userId) => setActiveUser(userId)}/>
                    </div>
                </Col>
                <Col
                md={9}
                className={`d-flex flex-column ${
                    darkMode ? "bg-dark text-white" : "bg-white text-black"
                }`}
                >
                {activeUser ? (
                    <ChatWindow recipientId={activeUser} />
                ) : (
                    <div className="d-flex flex-column h-100 p-3 justify-content-center align-items-center border border-primary border-2">
                        <h5>Select a user to start chatting</h5>
                    </div>
                )}
            </Col>
        </Row>

        {/* Floating chatboxes render here
        {openChats.map((chat, index) => (
            <FloatingChatBox
            key={chat.userId}
            recipientId={chat.userId}
            username={chat.username}
            profileImageUrl={chat.profileImageUrl}
            offset={index}
            onClose={() => closeChat(chat.userId)}
            />
        ))} */}
    </Container>
    )
}
export default ChatPage