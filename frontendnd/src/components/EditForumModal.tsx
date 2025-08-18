import {useEffect, useMemo, useState} from "react";
import {Modal, Form, Button, Image, Spinner} from "react-bootstrap";
import { urlToFile } from "./PostCard";
type EditForumModalProps = {
    show: boolean;
    onClose: () => void;
    onSubmit : (data : {title: string, description: string; iconFile? : File | null;  removeIcon : boolean; }) => Promise<void> | void;
    initial? : {
        title? : string;
        description?: string;
        iconUrl? : string | null;
    }
}
export default function EditForumModal({show, onClose, onSubmit, initial} : EditForumModalProps) {
    const [description, setDescription] = useState(initial?.description ?? "");
    const [iconFile, setIconFile] = useState<File | null>(null);
    const [removeIcon , setRemoveIcon] = useState(false);
    const [title, setTitle] = useState(initial?.title ?? "");
    const collectData = async () => {
        const file = initial?.iconUrl
            ? await urlToFile(initial.iconUrl).catch(() => null)
            : null;

        setIconFile(file);
    }
    useEffect(() => {
        if(show){
            setTitle(initial?.title ?? "");
            setDescription(initial?.description ?? "");
            collectData();
            setRemoveIcon(false);

        }
    },[show, initial?.description, initial?.title]);

    const submit = async(e : React.FormEvent) => {
        e.preventDefault();
        await onSubmit({title: title.trim(), description: description.trim(), iconFile, removeIcon})
        
        onClose();
    }
    return (
        <Modal show={show} onHide={onClose} centered size="lg" backdrop="static">
            <Form onSubmit={submit}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Thread</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                            type="text"
                            size="lg"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Edit title"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={6}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Write something"
                        />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                        <Form.Label className="form-label">Icon</Form.Label>
                        {iconFile ? (
                            <div className="d-flex align-items-center gap-2">
                                <img src={URL.createObjectURL(iconFile)} style={{maxHeight: 400}} />
                                <button type="button" className="btn btn-sm btn-outline-secondary"
                                    onClick={() => setIconFile(null)}>
                                    Clear new image
                                </button>
                            </div>
                        ) : initial?.iconUrl && !removeIcon ? (
                            <div className="d-flex align-items-center gap-2">
                                <img src={initial.iconUrl} style={{maxHeight: 400}}/>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => {
                                        setRemoveIcon(true);
                                        setIconFile(null);
                                    }}
                                    >
                                        Remove current image
                                    </button>
                            </div>
                        ) : (
                            <div className="text-dark small mb-1">
                                {removeIcon ? "Image will be removed" : "No image"}
                            </div>
                        )}
                        <input 
                            type="file"
                            accept="image/*"
                            className="form-control mt-2"
                            onChange={(e) => {
                                const f = e.target.files?.[0] ?? null;
                                setIconFile(f);
                                if(f) setRemoveIcon(false);
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