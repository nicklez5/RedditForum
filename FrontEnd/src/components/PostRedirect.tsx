import React, {useEffect} from "react";
import { useParams, useNavigate} from "react-router-dom";
import api from "../api/forums";

const PostRedirect = () => {
    const { id } = useParams<{id: string}>();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPost = async() => {
            try{
                const res = await api.get(`/api/post/${id}`);
                const threadId = res.data.threadId;

                if(threadId){
                    navigate(`/threads/${threadId}`, {replace: true});
                }else{
                    navigate('/not-found');
                }
            }catch(err){
                console.error("Post not found or failed to fetch", err);
                navigate('/not-found')
            }
        }
        fetchPost();
    },[id,navigate]);
    return <p>Redirecting to thread...</p>
}
export default PostRedirect