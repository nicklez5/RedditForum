import { createStore, persist } from "easy-peasy";
import {userModel, UserModel} from "./UserModel";
import {adminModel, AdminModel} from "./AdminModel";
import {postModel, PostModel} from "./PostModel";
import {threadModel, ThreadModel} from "./ThreadModel";
import {forumModel, ForumModel} from "./ForumModel";
import { notificationModel, NotificationModel } from "./Notification";
import { MessageModel, messageModel } from "./MessageModel";
import { profileModel, ProfileModel } from "./ProfileModel";
import { chatStoreModel, ChatStoreModel } from "./ChatModel";
import { uiModel, UIModel } from "./UIModel";
import { uploadModel, UploadModel } from "./UploadModel";
export interface StoreModel {
    user: UserModel;
    admin: AdminModel;
    post: PostModel;
    thread: ThreadModel;
    forum: ForumModel;
    notification: NotificationModel;
    message: MessageModel;
    profile: ProfileModel;
    ui: UIModel;
    chat: ChatStoreModel
    upload: UploadModel;
}
const store = createStore<StoreModel>(
    persist({
        user: userModel,
        admin: adminModel,
        post: postModel,
        thread: threadModel,
        forum: forumModel,
        ui: uiModel,
        notification: notificationModel,
        message: messageModel,
        profile: profileModel,
        chat: chatStoreModel,
        upload: uploadModel,
    },
    {
        storage: localStorage
    })
)
export default store;