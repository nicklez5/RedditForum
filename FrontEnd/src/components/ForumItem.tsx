import React, {useEffect, useState} from "react";
import { Forum } from "../interface/ForumModel";
import { Link } from "react-router-dom";
import { Button, Card } from "react-bootstrap";
import { useStoreActions, useStoreState } from "../interface/hooks";
import EditForumModal from "./EditForumModal";

const ForumItem = ({Forum} : {Forum: Forum}) => {
    const Forums = useStoreState((s) => s.forum.forums);
    const {DeleteForum} = useStoreActions((a) => a.forum);
    const [selectedForum, setSelectedForum] = useState<Forum | null>(null);
    const [showModal, setShowModal] = useState(false);
    return(
        <div>
            <Link to={`/Forums/${Forum.id}`} style={{textDecoration: "none"}}>
                <Card className="p-3 text-center mt-2">
                    <span className="small">Forum Title</span>
                    <h4>{Forum.title}</h4>
                    <hr/>
                    <span className="small">Forum Description</span>
                    <p>{Forum.description}</p>
                    <hr/>
                    <span>Members </span>
                    <h3>{Forum.users.length}</h3>
                </Card>
            </Link>
            <div className="d-flex align-items-center justify-content-center mt-3">
                <Button size="sm" variant="outline-danger" onClick={() => {
                    if(window.confirm("Are you sure you want to delete this Forum")){
                        DeleteForum(Forum.id)
                    }
                }} className="rounded-pill px-3 mx-3 bg-danger fs-6 fw-bold text-white border border-danger">Delete</Button>
            <Button size="sm" variant="outline-primary" onClick={() => {
                setSelectedForum(Forum)
                setShowModal(true);
            }} className="rounded-pill bg-success text-white border border-success px-3">Edit</Button>
            </div>
            {selectedForum && (
                <EditForumModal
                    forum={{
                        id: selectedForum.id.toString(),
                        title: selectedForum.title,
                        description: selectedForum.description,
                        iconUrl: selectedForum.iconUrl,
                        bannerUrl: selectedForum.bannerUrl
                    }}
                    show={showModal}
                    onClose={() => setShowModal(false)}
                    />
            )}
        </div>
    )
}
export default ForumItem;