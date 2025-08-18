import {useEffect, useMemo, useState} from "react";
import {Modal, Form, Button, Image, Spinner, Dropdown} from "react-bootstrap";
import { Forum } from "../interface/ForumModel";
import { useStoreActions, useStoreState } from "../interface/hooks";
import { useParams } from "react-router-dom";
type CreateThreadModalProps = {
    show: boolean;
    onClose: () => void;
    onSubmit : (data : {title: string, content: string; image? : File | null; video? : File | null; forumId: number}) => Promise<void> | void;

}
export default function CreateThreadModal({show, onClose, onSubmit} : CreateThreadModalProps) {
    const {id} = useParams();
    const [content, setContent] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [video, setVideo] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [forumID, setForumId] = useState(0);
    const [selectedForum, setSelectedForum] = useState<Forum | null>(null);
    const fetchForums = useStoreActions((a) => a.forum.GetAllForums);
    const forums = useStoreState((s) => s.forum.forums);
    useEffect(() => {
        if(show){
            setTitle("");
            setContent("");
            setImage(null);
            setVideo(null);
        }
    },[show]);
    useEffect(() => {
        if(!selectedForum && forums.length > 0 && id){
            const matchedForum = forums.find(f => f.id === Number(id))
            if(matchedForum){
                setSelectedForum(matchedForum);
            }
        }
    })
    console.log(id);
    const submit = async(e : React.FormEvent) => {
        e.preventDefault();
        await onSubmit({title: title.trim(), content: content.trim(), image, video, forumId: selectedForum?.id!})
        onClose();
    }
    return (
        <Modal show={show} onHide={onClose} centered size="lg" backdrop="static">
            <Form onSubmit={submit}>
                <Modal.Header closeButton>
                    <Modal.Title>Create Thread</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                            type="text"
                            size="lg"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter title"
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Content</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={6}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Enter content"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Forum</Form.Label>
                        <Dropdown onSelect={(forumId) => {
                            const forum = forums.find(f => f.id === Number(forumId))
                            setSelectedForum(forum || null);
                        }}>
                            <Dropdown.Toggle variant="light" className="w-100">
                                {selectedForum ? (
                                    <>
                                    {selectedForum.title}
                                    </>
                                ):
                                "Select forum"
                                }
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="w-100 h-100 ">
                                {forums.map((forum) => (
                                    <Dropdown.Item eventKey={forum.id} key={forum.id} className="w-100 text-black bg-light">
                                        {forum.title}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="form-label">Image</Form.Label>
                        {image ? (
                            <div className="d-flex align-items-center gap-2">
                                <img src={URL.createObjectURL(image)} style={{maxHeight: 400}} />
                                <button type="button" className="btn btn-sm btn-outline-secondary"
                                    onClick={() => setImage(null)}>
                                    Clear new image
                                </button>
                            </div>
                        ) : <></>}
                        <input 
                            type="file"
                            accept="image/*"
                            className="form-control mt-2"
                            onChange={(e) => {
                                const f = e.target.files?.[0] ?? null;
                                setImage(f);
                            }}
                            />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Video</Form.Label>
                        {video ? (
                            <div className="d-flex align-items-center gap-2">
                                <video src={URL.createObjectURL(video)} style={{maxHeight: 400, maxWidth: 400}} controls/>
                                <button type="button" className="btn btn-sm btn-outline-secondary"
                                    onClick={() => setVideo(null)}>
                                        Clear new video
                                    </button>
                            </div>
                        ): <></>}
                        <input type="file"
                            accept="video/*"
                            className="form-control mt-2"
                            onChange={(e) => {
                                const f = e.target.files?.[0] ?? null;
                                setVideo(f)
                            }}
                            />
                    </Form.Group>
                    <div className="d-flex justify-content-end gap-2">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save</button>
                    </div>
                </Modal.Body>
            </Form>
        </Modal>
    )
}