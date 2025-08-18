import {useEffect, useMemo, useState} from "react";
import {Modal, Form, Button, Image, Spinner, Dropdown} from "react-bootstrap";
import { Forum } from "../interface/ForumModel";
import { useStoreActions, useStoreState } from "../interface/hooks";
import { useParams } from "react-router-dom";
type CreateForumModalProps = {
    show: boolean;
    onClose: () => void;
    onSubmit : (data : {title: string, description: string; iconFile? : File | null; }) => Promise<void> | void;

}
export default function CreateForumModal({show, onClose, onSubmit} : CreateForumModalProps) {
    const {id} = useParams();
    const [description, setDescription] = useState("");
    const [iconFile, setIcon] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const fetchForums = useStoreActions((a) => a.forum.GetAllForums);
    const forums = useStoreState((s) => s.forum.forums);
    useEffect(() => {
        if(show){
            setTitle("");
            setDescription("");
            setIcon(null);
        }
    },[show]);
    console.log(id);
    const submit = async(e : React.FormEvent) => {
        e.preventDefault();
        await onSubmit({title: title.trim(), description: description.trim(), iconFile})
        onClose();
    }
    return (
        <Modal show={show} onHide={onClose} centered size="lg" backdrop="static">
            <Form onSubmit={submit}>
                <Modal.Header closeButton>
                    <Modal.Title>Create Forum</Modal.Title>
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
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={6}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter description"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="form-label">Icon</Form.Label>
                        {iconFile ? (
                            <div className="d-flex align-items-center gap-2">
                                <img src={URL.createObjectURL(iconFile)} style={{maxHeight: 400}} />
                                <button type="button" className="btn btn-sm btn-outline-secondary"
                                    onClick={() => setIcon(null)}>
                                    Clear new icon
                                </button>
                            </div>
                        ) : <></>}
                        <input 
                            type="file"
                            accept="image/*"
                            className="form-control mt-2"
                            onChange={(e) => {
                                const f = e.target.files?.[0] ?? null;
                                setIcon(f);
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