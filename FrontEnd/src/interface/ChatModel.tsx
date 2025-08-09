import {Action, action} from "easy-peasy"

export interface FloatingChat{
    userId: string,
    username: string;
    profileImageUrl: string;
}
export interface ChatStoreModel{
    openChats: FloatingChat[],
    addChat: Action<ChatStoreModel, FloatingChat>;
    closeChat: Action<ChatStoreModel, string>;
}
export const chatStoreModel: ChatStoreModel = {
    openChats: [],
    addChat: action((state, chat) => {
        if(!state.openChats.find(c => c.userId === chat.userId)){
            state.openChats.push(chat);
        }
    }),
    closeChat: action((state, userId) => {
        state.openChats = state.openChats.filter(c => c.userId !== userId)
    })
}