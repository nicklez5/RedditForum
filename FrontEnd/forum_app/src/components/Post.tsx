import { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage , faFileImage, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useStoreActions } from "../interface/hooks";
import { formatDistanceToNow } from "date-fns";
import { useTheme } from "./ThemeContext";
import { Post } from "../interface/PostModel";
const PostBox = ({post}: {post: Post}) => {
    const [content, setContent] = useState(post.content);
    const likePost = useStoreActions((a) => a.post.votePost);
    const deletePost = useStoreActions((a) => a.post.DeletePost);
    const replyToPost = useStoreActions((a) => a.post.ReplyToPost);
    const editPost = useStoreActions((a) => a.post.EditPost);
    const getPostById = useStoreActions((a) => a.post.GetPostById)
    useEffect(() => {
        getPostById(post.id);
    },[getPostById])
}