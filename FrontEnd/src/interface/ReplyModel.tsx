import {Action, Thunk, Computed} from "easy-peasy"

export interface Reply{
    id : number,
    content: string,
    authorUsername: string,
    profileImageUrl: string,
    parentPostId: number,
    threadId: number,
    likeCount: number
    replies: Reply[],
    imageUrl: string | null,
    videoUrl: string | null,
    createdAt: Date
}