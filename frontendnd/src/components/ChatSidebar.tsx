import React from "react";
import { ListGroup } from "react-bootstrap";
import { useStoreState, useStoreActions } from "../interface/hooks";
import { useTheme } from "./ThemeContext";
interface ChatSidebarProps {
    activeUser: string | null;
    onSelectUser: (userId : string) => void;
}
const ChatSidebar = ({activeUser, onSelectUser} : ChatSidebarProps) => {
    const messages = useStoreState((s) => s.user.Messages);
    const currentUser = useStoreState((s) => s.user.Profile);
    const addChat = useStoreActions((a) => a.chat.addChat);

    const {darkMode} = useTheme();
    const chatsMap = new Map();

    messages.forEach((msg: any) => {
        const isSender = msg.senderId === currentUser!.id;
        const otherId = isSender ? msg.recipientId : msg.senderId;
        const otherName = isSender ? msg.recipientUsername: msg.senderUsername;
        const otherAvatar = isSender ? msg.recipientProfileImageUrl : msg.senderProfileImageUrl;
        if (!chatsMap.has(otherId)) {
            chatsMap.set(otherId, { userId: otherId, username: otherName, last: msg.sentAt, profileImageUrl: otherAvatar, lastMessage: msg.content});
        }
        });
    const conversations = Array.from(chatsMap.values());
    return (
        <div className="ms-1 px-xxl-5">
            <h5 className="ms-xxl-2 px-5">Chats</h5>
            <ListGroup variant="flush">
                {conversations.map((chat : any) => (
                    <ListGroup.Item
                        key={chat.userId}
                        action
                        className={`${darkMode ? 'bg-dark text-white border-0' : 'bg-white text-dark border-0'}`}
                        onClick={() => addChat({userId: chat.userId, username: chat.username, profileImageUrl: chat.profileImageUrl})}
                    >
                    <div className="d-flex align-items-start gap-1" key={chat.userId}
                        style={{
                            cursor: "pointer",
                            border: activeUser === chat.userId ? "2px solid #0d6efd" : "2px solid transparent",
                            transition: "border-color 0.2s ease-in-out"
                        }}
                        onClick={() => onSelectUser(chat.userId)}
                    >
                        <img
                            src={chat.profileImageUrl}
                            alt="avatar"
                            style={{ width: '65px', height: '65px', borderRadius: "50%"}}
                            className=""
                        />
                    <div className={`${darkMode ? 'bg-dark text-white border-0 flex-grow-1' : 'bg-white text-dark border-0 flex-grow-1'}  d-block me-5  pe-5`}>
                    <div className="fw-bold ms-5">{chat.username}</div>
                    <div className="small text-truncate ms-5">{chat.lastMessage}</div>
                    <div className="small ms-5">{new Date(chat.last).toLocaleDateString()}</div> 
                    </div> 
                    </div>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </div>
    )
}
export default ChatSidebar;