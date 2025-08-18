import {Action, Thunk, Computed, action, thunk} from "easy-peasy"
import api from "../api/forums"
export interface Profile{
    id: string,
    firstName: string,
    lastName: string,
    username: string,
    email: string,
    bio : string,
    profileImageUrl : string | null,
    profileImageKey: string | null
    dateJoined: Date,
    postCount: number,
    reputation: number,
    isModerator: boolean,
    isBanned: boolean,
    bannedAt: Date,
}
export interface EditProfileDto{
    firstName: string,
    lastName: string,
    bio: string,
    profileImageUrl: string,
}
export interface ProfileModel{
    profile: Profile[],
    loading: boolean,
    error: string | null,

    setLoading: Action<ProfileModel, boolean>,
    setError: Action<ProfileModel, string| null>,
    selectedProfile : Profile | null,
    setSelectedProfile: Action<ProfileModel, Profile>,
    SetProfiles: Action<ProfileModel, Profile[]>,
    fetchProfiles: Thunk<ProfileModel>,
    fetchSelectedProfile: Thunk<ProfileModel, string>,
}
export const profileModel: ProfileModel = {
    profile: [],
    selectedProfile: null,
    loading: false,
    error: "",

    setLoading: action((state, loading) => {
        state.loading = loading
    }),
    setError: action((state, error) => {
        state.error = error
    }),
    setSelectedProfile: action((state, profile) => {
        state.selectedProfile = profile
    }),
    SetProfiles: action((state, profiles) => {
        state.profile = profiles
    }),
    fetchProfiles: thunk(async(actions) => {
        actions.setLoading(true);
        try{
            const response = await api.get<Profile[]>("/api/profile")
            actions.SetProfiles(response.data)
            actions.setError(null);
        }catch(error){
            console.error("Failed to fetch profiles", error)
            actions.setError("Failed to fetch profiles");
        }finally{
            actions.setLoading(false);
        }
    }),
    fetchSelectedProfile: thunk(async(actions, user_id) => {
        actions.setLoading(true);
        try{
            const response = await api.get<Profile>(`/api/profile/${user_id}`)
            actions.setSelectedProfile(response.data)
            actions.setError(null);
        }catch(error){
            console.error(`Failed to fetch selected profile with user_id: ${user_id}`)
            actions.setError(`Failed to fetch selected profile with user_id: ${user_id}`)
        }finally{
            actions.setLoading(false);
        }
    })
}