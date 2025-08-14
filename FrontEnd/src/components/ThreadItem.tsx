import React, {useEffect, useState} from "react";
import { Thread } from "../interface/ThreadModel";
import { Link } from "react-router-dom";
import { Button, Card } from "react-bootstrap";
import { useStoreActions, useStoreState } from "../interface/hooks";
import EditThreadModal from "./EditThreadModal";

const ThreadItem = ({thread} : {thread: Thread}) => {
    const threads = useStoreState((s) => s.thread.threads);
    const {DeleteThread} = useStoreActions((a) => a.thread);
    const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
    const [showModal, setShowModal] = useState(false);
    const API_BASE = (process.env.REACT_APP_API_BASE_URL || '').replace(/\/$/, '');
    const ASSET_BASE = (process.env.REACT_APP_ASSET_BASE_URL ?? API_BASE).replace(/\/$/, '');
    const resolveAsset = (u?: string | null): string | undefined => {
        if (!u) return undefined;                          // don't return base by itself
        if (/^https?:\/\//i.test(u)) return u;             // already absolute
        return `${ASSET_BASE}/${u.replace(/^\/+/, '')}`    // join with asset base
                .replace(/([^:]\/)\/+/g, '$1');
        };
    const imgSrc   = resolveAsset(thread.imageUrl ?? (thread as any).imageKey);
    return(
        <div>
            <Link to={`/threads/${thread.id}`} style={{textDecoration: "none"}}>
                <Card className="p-3 text-center mt-2">
                    <span className="small">Thread Title</span>
                    <h4>{thread.title}</h4>
                    <hr/>
                    <span className="small">Thread Content</span>
                    <p>{thread.content}</p>
                    <hr/>
                    {thread.imageKey && (
                        <>
                    <span className="small">Thread Image</span>
                    <div>
                        <img src={imgSrc} style={{width: "200px"}}/>
                    </div>
                    <hr/>
                    </>
                    )}

                    <span className="small">Post Count</span>
                    <p>{thread.postCount}</p>
                    <hr/>
                    <span className="small">Like Count</span>
                    <p>{thread.likeCount}</p>
                </Card>
            </Link>
            <div className="d-flex align-items-center justify-content-center mt-3">
                <Button size="sm" variant="outline-danger" onClick={() => {
                    if(window.confirm("Are you sure you want to delete this thread")){
                        DeleteThread(thread.id)
                    }
                }} className="rounded-pill px-3 mx-3 bg-danger fs-6 fw-bold text-white border border-danger">Delete</Button>
            <Button size="sm" variant="outline-primary" onClick={() => {
                setSelectedThread(thread)
                setShowModal(true);
            }} className="rounded-pill bg-success text-white border border-success px-3">Edit</Button>
            </div>
            {selectedThread && (
                <EditThreadModal
                    thread={{
                        id: selectedThread.id,
                        title: selectedThread.title,
                        content: selectedThread.content,
                        imageUrl: selectedThread.imageUrl,
                        videoUrl: selectedThread.videoUrl,
                    }}
                    show={showModal}
                    onClose={() => setShowModal(false)}
                    />
            )}
        </div>
    )
}
export default ThreadItem;