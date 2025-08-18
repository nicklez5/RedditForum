import {useEffect, useMemo, useState} from "react";
import {Modal, Form, Button, Image, Spinner} from "react-bootstrap";
type EditPostModalProps = {
    show: boolean;
    onClose: () => void;
    onSubmit : (data : {content: string; image? : File | null; video? : File | null; removeImage : boolean; removeVideo : boolean;}) => Promise<void> | void;
    initial? : {
        content?: string;
        imageUrl? : string | null;
        videoUrl?: string | null;
    }
}
export default function EditPostModal({show, onClose, onSubmit, initial} : EditPostModalProps) {
    const [content, setContent] = useState(initial?.content ?? "");
    const [image, setImage] = useState<File | null>(null);
    const [video, setVideo] = useState<File | null>(null);
    const [removeImage , setRemoveImage] = useState(false);
    const [removeVideo, setRemoveVideo] = useState(false);

    useEffect(() => {
        if(show){
            setContent(initial?.content ?? "");
            setImage(null);
            setVideo(null);
            setRemoveImage(false);
            setRemoveVideo(false);
        }
    },[show, initial?.content]);

    const submit = async(e : React.FormEvent) => {
        e.preventDefault();
        await onSubmit({content: content.trim(), image, video, removeImage, removeVideo})
        onClose();
    }
    return (
        <Modal show={show} onHide={onClose} centered size="lg" backdrop="static">
            <Form onSubmit={submit}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Post</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Content</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={6}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write something"
                        />
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
                        ) : initial?.imageUrl && !removeImage ? (
                            <div className="d-flex align-items-center gap-2">
                                <img src={initial.imageUrl} style={{maxHeight: 400}}/>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => {
                                        setRemoveImage(true);
                                        setImage(null);
                                    }}
                                    >
                                        Remove current image
                                    </button>
                            </div>
                        ) : (
                            <div className="text-dark small mb-1">
                                {removeImage ? "Image will be removed" : "No image"}
                            </div>
                        )}
                        <input 
                            type="file"
                            accept="image/*"
                            className="form-control mt-2"
                            onChange={(e) => {
                                const f = e.target.files?.[0] ?? null;
                                setImage(f);
                                if(f) setRemoveImage(false);
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
                        ): initial?.videoUrl && !removeVideo ? (
                            <div className="d-flex align-items-center gap-2">
                                <video src={initial.videoUrl} style={{maxHeight: 400, maxWidth: 400}} controls/>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => {setRemoveVideo(true); setVideo(null)}}
                                >
                                    Remove current video
                                </button>
                            </div>
                        ): (
                            <div className="text-black small mb-1">
                                {removeVideo ? "Video will be removed" : "No video"}
                            </div>
                        )}
                        <input type="file"
                            accept="video/*"
                            className="form-control mt-2"
                            onChange={(e) => {
                                const f = e.target.files?.[0] ?? null;
                                setVideo(f)
                                if(f) setRemoveVideo(false);
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