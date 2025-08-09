import {Action, Thunk, Computed} from "easy-peasy"
export interface RefreshToken{
    Id: number,
    Token: string,
    ExpiryDate: Date,
    UserId: string
}
