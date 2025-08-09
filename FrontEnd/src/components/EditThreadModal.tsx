import React, {useState, useEffect} from "react";
import {Modal, Button, Form} from "react-bootstrap"
import { useStoreActions } from "../interface/hooks";
import { EditThreadDto } from "../interface/ThreadModel";
interface EditThreadModalProps{
    thread: {
        id: number;
        title: string;
        content: string;
        imageUrl?: string | null;
    };
    show: boolean;
    onClose: () => void;
}
const EditThreadModal: React.FC<EditThreadModalProps> = ({thread, show, onClose}) => {
    const editThread = useStoreActions((a) => a.thread.EditThread);
    const [title, setTitle] = useState(thread.title);
    const [content, setContent] = useState(thread.content);
    const [image, setImage] = useState<File |null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [id, setId] = useState(thread.id);
    const [removeImage, setRemoveImage] = useState(false);
    const fetchThread = useStoreActions((a) => a.thread.GetThreadById);
    useEffect(() => {
        setTitle(thread.title);
        setContent(thread.content);
        setRemoveImage(false);
        if(thread.imageUrl){
            const loadImage = async() => {
                const res = await fetch(`http://localhost:5220${thread.imageUrl}`);
                const blob = await res.blob();
                const previewURL = URL.createObjectURL(blob);
                setImagePreview(previewURL);
                const file = new File([blob], "forum-image.jpg", {type: blob.type})
                setImage(file);
            }
            loadImage();
        }else{
            setImage(null);
        }
    },[thread])
    const handleSubmit = async(e: React.FormEvent) => {
        e.preventDefault();
        const dto: EditThreadDto = {
            id: thread.id,
            title: title,
            content: content,
            image: image,
            removeImage: removeImage
        }
        await editThread(dto)
        onClose();
    }
    return (
        <Modal show={show} onHide={onClose} centered>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Thread</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Content</Form.Label>
                        <Form.Control as="textarea" rows={4} value={content} onChange={(e) => setContent(e.target.value)} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Change Image</Form.Label>
                        <Form.Control type="file" onChange={(e) => {
                            const file = (e.target as HTMLInputElement).files?.[0] ?? null
                            setImage(file)
                            if(file){
                                const previewURL = URL.createObjectURL(file);
                                setImagePreview(previewURL)
                            }else{
                                setImagePreview(null);
                            }
                        }} />
                        <br />
                        {imagePreview && (
                            <div>
                                <img 
                                    src={imagePreview}
                                    alt="Preview"
                                    style={{maxWidth: "200px", borderRadius: "5px"}}
                                />
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => {
                                        setImage(null);
                                        setRemoveImage(true);
                                        setImagePreview(null)
                                    }}
                                    className="ms-2"
                                >Remove Image</Button>
                            </div>
                        )}
                    </Form.Group>
                    <Form.Check type="checkbox" label="Remove current image" checked={removeImage} onChange={(e) => setRemoveImage(e.target.checked)} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary">
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    )
}
export default EditThreadModal