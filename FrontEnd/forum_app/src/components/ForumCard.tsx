import {Card, Badge, Button} from "react-bootstrap"
import { Forum } from "../interface/ForumModel"
import { formatDistanceToNow } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faCommentAlt, faArrowUp, faArrowDown, faComment } from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useStoreActions, useStoreState } from "../interface/hooks";

interface Props{
    forum: Forum,
    darkMode: boolean
}
const ForumCard: React.FC<Props> = ({forum, darkMode}) => {
    const color = darkMode ? "white" : "black";
    return (
        <NavLink to={`/forum/${forum.id}`} style={{textDecoration: "none", color: "inherit"}} className="card-link-wrapper">
            <div className="card border-0 shadow-sm rounded overflow-hidden mt-4" style={{width: "800px", height: "180px"}}>
                <img src={`http://localhost:5220/${forum.bannerUrl}`} className="w-100 h-100 object-fit-cover" alt="Forum"/>
                <div className="container d-flex justify-content-between align-items-center position-absolute" style={{bottom: "-36px", left: "50%", transform: 'translateX(-50%)', zIndex: 2,  paddingLeft: '1rem', maxWidth: "900px" , width: '100%', paddingRight: "1rem"}}>
                        <div className="d-flex align-items-center">
                        <img
                            src={`http://localhost:5220/${forum!.iconUrl}`}
                            alt="icon"
                            style={{
                            width: "96px",
                            height: "96px",
                            borderRadius: "50%",
                            border: "4px solid var(--bs-body-bg)",
                            backgroundColor: "white", // white ring border
                            }}
                        />
                        <h4 className=" ms-3 mb-0 fw-light " >r/{forum!.title}</h4>
                    </div>
                
            </div>
            </div>
        </NavLink>
    )
}
export default ForumCard;