import React, {useState, useEffect} from "react";
import {Modal, Button, Form} from "react-bootstrap"
import { useStoreActions } from "../interface/hooks";
import { EditPostDto } from "../interface/PostModel";
interface EditPostModalProps{
    post: {
        id: number;
        content: string;
        imageUrl?: string | null;
        videoUrl?: string | null;
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
    const [video, setVideo] = useState<File | null>(null);
    const [removeVideo, setRemoveVideo] = useState(false);
    const [videoPreview , setVideoPreview] = useState<string | null>(null);
    const API_BASE = (process.env.REACT_APP_API_BASE_URL || '').replace(/\/$/, '');
    const toAbs = (u: string) =>
    /^https?:\/\//i.test(u) ? u : `${API_BASE}/${u}`.replace(/([^:]\/)\/+/g, '$1');

    const src = toAbs(post.imageUrl!);
    useEffect(() => {
        let revokeImg: string | undefined
        let revokeVid: string | undefined
        const ac = new AbortController();
        setContent(post.content)
        setRemoveImage(false)
        setRemoveVideo(false);
        setId(post.id)
        const loadImage = async() => {
            if(!post.imageUrl) { setImage(null); return; }
            const url = toAbs(post.imageUrl)
            const res = await fetch(url, {signal: ac.signal})
            if(!res.ok) throw new Error(`Image fetch failed: ${res.status}`)
            const blob = await res.blob();
            const previewURL = URL.createObjectURL(blob);
            revokeImg = previewURL;
            setImagePreview(previewURL);
            setImage(new File([blob], 'post-image.jpg', { type: blob.type }));
        }
        const loadVideo = async () => {
            if (!post.videoUrl) { setVideo(null); setVideoPreview(null); return; }
            const url = toAbs(post.videoUrl);
            const res = await fetch(url, { signal: ac.signal });
            if (!res.ok) throw new Error(`Video fetch failed: ${res.status}`);
            const blob = await res.blob();
            // S3 may return application/octet-stream for some videos; allow it
            // (Optional) sanity check: if (!blob.type.startsWith("video/") && blob.type !== "application/octet-stream") throw new Error("Not a video");
            const previewURL = URL.createObjectURL(blob);
            revokeVid = previewURL;
            setVideoPreview(previewURL);
            const ext = blob.type.split("/")[1] ? `.${blob.type.split("/")[1]}` : "";
            setVideo(new File([blob], `post-video${ext || ".mp4"}`, { type: blob.type || "video/mp4" }));
        };
        Promise.allSettled([loadImage(), loadVideo()]).catch(() => {});
        return() => {
            ac.abort();
            if(revokeImg) URL.revokeObjectURL(revokeImg);
            if (revokeVid) URL.revokeObjectURL(revokeVid);
        }
    },[post])
    const handleSubmit = async(e: React.FormEvent) => {
        e.preventDefault();
        const dto: EditPostDto = {
            id: post.id,
            content: content,
            image: image,
            removeImage: removeImage,
            video: video,
            removeVideo: removeVideo

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
                    <Form.Group className="mt-3">
                        <Form.Label>Change Video</Form.Label>
                        <Form.Control type="file" onChange={(e) => {
                            const file = (e.target as HTMLInputElement).files?.[0] ?? null;
                            setVideo(file);
                            if(file){
                                const previewUrl = URL.createObjectURL(file);
                                setVideoPreview(previewUrl)
                            }else{
                                setVideoPreview(null);
                            }
                        }} />
                        <br/>
                        {videoPreview && (
                            <div>
                                <video width="400" controls>
                                    <source src={videoPreview} />
                                </video>
                                <Button variant="outline-danger"
                                    size="sm"
                                    onClick={() => {
                                        setVideo(null);
                                        setRemoveVideo(true);
                                        setVideoPreview(null)
                                    }} className="ms-2">
                                        Remove Video
                                    </Button>
                            </div>
                        )}
                    </Form.Group>
                    <Form.Check type="checkbox" label="Remove current video" checked={removeVideo} onChange={(e) => setRemoveVideo(e.target.checked)} />
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