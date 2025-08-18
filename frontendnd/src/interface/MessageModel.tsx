import {Action,Thunk,Computed,action,thunk} from "easy-peasy"
import api from "../api/forums"

export interface Message{
    id: number,
    senderId : string,
    senderUsername: string,
    senderProfileImageUrl: string,
    recipientId: string,
    recipientUsername: string,
    recipientProfileImageUrl: string,
    content: string,
    sentAt: string,
    isRead: boolean
}
export interface CreateMessageDto{
    recipientId: string,
    content: string,
}
export interface EditMessageDto{
    content: string
}
export interface MessageModel{
    messages: Message[];
    loading: boolean;
    error: string | null;

    setMessages: Action<MessageModel, Message[]>;
    addMessage: Action<MessageModel, Message>;
    deleteMessage: Action<MessageModel, number>;
    updateMessage: Action<MessageModel, {id: number, content: string}>;
    setLoading: Action<MessageModel, boolean>;
    setError: Action<MessageModel, string | null>;

    getMessages: Thunk<MessageModel, string>;
    fetchMessages: Thunk<MessageModel, void>;
    removeMessage: Thunk<MessageModel, number>;
    editMessage: Thunk<MessageModel, {id: number, content:string}>;
    sendMessage: Thunk<MessageModel, CreateMessageDto>;
}
export const messageModel: MessageModel = {
    messages: [],
    loading: false,
    error: null,

    setMessages: action((state, messages) => {
        state.messages = messages;
    }),

    addMessage: action((state,message) => {
        state.messages.push(message);
    }),

    setLoading: action((state,loading) => {
        state.loading = loading
    }),

    setError: action((state,error) => {
        state.error = error;
    }),

    deleteMessage: action((state, id) => {
        state.messages = state.messages.filter((msg) => msg.id !== id);
    }),

    updateMessage: action((state, updated) => {
        const index = state.messages.findIndex(m => m.id === updated.id);
        if(index !== -1){
            state.messages[index].content = updated.content;
        }
    }),

    getMessages: thunk(async(actions , contactId ) => {
        actions.setLoading(true);
        try{
            const response = await api.get<Message[]>(`/api/message/${contactId}`);
            actions.setMessages(response.data)
            actions.setError(null);
        }catch(error: any){
            console.error(`Failed to get messages from ${contactId}.`);
            actions.setError(error.message)
        }finally{
            actions.setLoading(false);
        }
    }),
    fetchMessages: thunk(async(actions) => {
        actions.setLoading(true);
        try{
            const response = await api.get<Message[]>("/api/message/all");
            actions.setMessages(response.data)
            actions.setError(null);
        }catch(error: any){
            console.error("Failed to fetch messages");
            actions.setError(error.message)
        }finally{
            actions.setLoading(false);
        }
    }),
    removeMessage: thunk(async(actions, id, {getState}) => {
        actions.setLoading(true);
        try{
            const response = await api.delete(`/api/message/${id}`);
            if(response.status === 200){
                const existingMessage = getState().messages.find(m => m.id === id);
                if(existingMessage){
                    actions.deleteMessage(existingMessage.id)
                }
            actions.setError(null);
            }else{
                console.error("Delete failed:", response.data);
            }
        }catch(error: any){
            console.error("Error deleting message:", error.message);
            actions.setError(error.message);
        }finally{
            actions.setLoading(false);
        }
    }),
    editMessage: thunk(async(actions, {id, content}) => {
        actions.setLoading(true);
        try{
            const response = await api.put(`/api/message/${id}`, {content});
            if(response.status === 200){
                actions.updateMessage(response.data)
            }
            actions.setError(null);
        }catch(error: any){
            console.error("Error editing message", error);
        }finally{
            actions.setLoading(false);
        }
    }),
    sendMessage: thunk(async(actions, dto: CreateMessageDto) => {
        try{
            const response = await api.post("/api/message",dto);
            if(response.status === 200){
                actions.addMessage(response.data)
            }
            actions.setError(null);
        }catch(error : any){
            console.error("Error sending message", error);
        }finally{
            actions.setLoading(false);
        }
    })
}