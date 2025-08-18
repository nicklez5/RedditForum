import {useEffect, useState} from "react";
import { Profile } from "../interface/ProfileModel";
import api from "../api/forums";
import { useTheme } from "./ThemeContext";
declare function fetchProfile(username : string) : Promise<Profile | undefined>;

export function UserReputation({username} : {username : string}) {
    const [rep, setRep] = useState<number | null>(null);
    const [posts, setPosts] = useState<number | null>(null);
    const [mod, setMod] = useState(false);
    const fetchProfile = async(username: string) => {
        try{
            const {data} = await api.get(`/api/account/${username}`,{allowAnonymous: true, suppressRedirect : true})
            const user_id = data.id;
            const response = await api.get<Profile>(`/api/profile/${user_id}`, {suppressRedirect:true})
            return response.data
        }catch(err){
            console.error("Failed to retrive data:",err);
        }
    }
    const {darkMode} = useTheme();
    const color = darkMode ? "white" : "black";
    useEffect(() => {
        let cancelled = false;
        if(!username) return;

        fetchProfile(username).then((p) => {
            if(!cancelled) {
                setRep(p?.reputation ?? 0)
                setPosts(p?.postCount ?? 0);
                setMod(p?.isModerator ?? false)
            };
        })
        return () => {cancelled = true;}
    },[username]);
    const getAchievements = (points: number) => {
        if(points >= 10){
            return "Iron"
        }
        if(points >= 50){
            return "Bronze"
        }
        if(points >= 100){
            return "Silver"
        }
        if(points >= 200){
            return "Gold"
        }
        if(points >= 500){
            return "Platinum"
        }
    }
    return (
        <div className="d-flex flex-column align-items-start justify-content-start" style={{lineHeight: "0.4", color: color}}>
            <div className="d-flex ">
            <p className="fs-6">Reputation: </p>
            <span className="d-flex flex-column fs-6 ms-2">
                {rep !== null ? getAchievements(rep!) : rep}
            </span>
           
            </div>
            <div className="d-flex">
                <p className="fs-6">Posts: </p>
            <span className="d-flex fs-6 ms-5">
                {posts !== null ? 0 : posts}
            </span>

        </div>
        <div className="d-flex">
                {mod && (
                    <p className="fs-6">Moderator</p>
                )}
                
            </div>
        </div>
    )
}