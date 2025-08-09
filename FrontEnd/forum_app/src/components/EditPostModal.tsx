import React, {useState, useEffect} from "react";
import {Modal, Button, Form} from "react-bootstrap"
import { useStoreActions } from "../interface/hooks";
import { EditPostDto } from "../interface/PostModel";
interface EditPostModalProps{
    post: {
        id: number;
        content: string;
        imageUrl?: string | null;
    };
    show: boolean;
    onClose: () => void;
}
const EditPostModal: React.FC<EditPostModalProps> = ({post,show,onClose}) => {
    const editPost = useStoreActions((a) => a.post.EditPost);
    const [content, setContent] = useState(post.content)
    const [id, setId] = useState(post.id)
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [removeImage, setRemoveImage] = useState(false);
    useEffect(() => {
        setContent(post.content)
        setRemoveImage(false)
        setId(post.id)
        if(post.imageUrl){
            const loadImage = async() => {
                const res = await fetch(`http://localhost:5220${post.imageUrl}`)
                const blob = await res.blob();
                const previewURL = URL.createObjectURL(blob);
                setImagePreview(previewURL)
                const file = new File([blob], "post-image.jpg", {type: blob.type})
                setImage(file);
            }
            loadImage();
        }else{
            setImage(null);
        }
    },[post])
    const handleSubmit = async(e: React.FormEvent) => {
        e.preventDefault();
        const dto: EditPostDto = {
            id: post.id,
            content: content,
            image: image,
            removeImage: removeImage
        }
        await editPost(dto)
        onClose();
    }
    return (
        <Modal show={show} onHide={onClose} centered>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Post</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Content</Form.Label>
                        <Form.Control as="textarea" rows={4} value={content} onChange={(e) => setContent(e.target.value)} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Change Image</Form.Label>
                        <Form.Control type="file" onChange={(e) => {
                            const file = (e.target as HTMLInputElement).files?.[0] ?? null;
                            setImage(file);
                            if(file){
                                const previewURL = URL.createObjectURL(file);
                                setImagePreview(previewURL)
                            }else{
                                setImagePreview(null);
                            }
                        }} />
                        <br/>
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
export default EditPostModal;