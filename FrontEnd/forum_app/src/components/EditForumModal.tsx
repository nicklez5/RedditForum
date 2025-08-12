import React, {useState, useEffect} from "react";
import { Modal, Button, Form, Alert} from "react-bootstrap";
import {useStoreActions, useStoreState} from '../interface/hooks'
import { BooleanLiteral } from "typescript";
import { EditForumDto } from "../interface/ForumModel";

interface EditForumModalProps{
    forum: {
        id: string;
        title: string;
        description: string;
        iconUrl? : string | null,
        bannerUrl? : string | null,
    };
    show: boolean;
    onClose: () => void;
}

const EditForumModal: React.FC<EditForumModalProps> = ({ forum, show, onClose}) => {
    const editForum = useStoreActions((a) => a.forum.EditForum);
    const fetchForum = useStoreActions((a) => a.forum.GetAllForums);
    const [title, setTitle] = useState(forum.title)
    const [description ,setDescription] = useState(forum.description);
    const [icon, setIcon] = useState<File | null>(null);
    const [removeIcon, setRemoveIcon] = useState(false);
    const [showError, setShowError] = useState(false);
    const [banner, setBanner] = useState<File | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [iconPreview , setIconPreview] = useState<string | null>(null);
    const [removeBanner, setRemoveBanner] = useState(false);
    const error = useStoreState((s) => s.forum.error);
    const API_BASE = process.env.REACT_APP_API_BASE_URL || "";
    const imageIconSrc = /^https?:\/\//i.test(forum.iconUrl!)
    ? forum.iconUrl                 // already absolute
    : `${API_BASE}/${forum.iconUrl}`.replace(/([^:]\/)\/+/g, '$1');
    const imageBannerSrc = /^https?:\/\//i.test(forum.bannerUrl!)
        ? forum.bannerUrl                 // already absolute
        : `${API_BASE}/${forum.bannerUrl}`.replace(/([^:]\/)\/+/g, '$1');
    useEffect(() => {
        setTitle(forum.title);
        setDescription(forum.description);
        setRemoveIcon(false);
        setRemoveBanner(false);
        
        
    },[forum])
    useEffect(() => { setShowError(!!error); }, [error]);
    const handleSubmit = async(e: React.FormEvent) => {
        e.preventDefault();
        setShowError(false);
        const dto: EditForumDto = {
            id: forum.id,
            title: title,
            description: description,
            icon: icon,
            removeIcon: removeIcon,
            banner: banner,
            removeBanner: removeBanner
        }
        await editForum(dto);
        //await fetchForum()
        //window.location.href = `/forum/${forum.id}`
        onClose();
    }
    return(
        <Modal show={show} onHide={onClose} centered>
            {error && <Alert variant="danger" dismissible  show={showError}  onClose={() => setShowError(false)} className="mt-3">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Forum</Modal.Title>
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
                        <Form.Label>Description</Form.Label>
                        <Form.Control as="textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Change Icon</Form.Label>
                        <Form.Control type="file" onChange={(e) => {
                            const file = (e.target as HTMLInputElement).files?.[0] ?? null
                            setIcon(file)
                            if(file){
                                const previewUrl = URL.createObjectURL(file);
                                setIconPreview(previewUrl);
                            }else{
                                setIconPreview(null);
                            }}}/>
                            <br/>
                            {iconPreview && (
                                <div>
                                    <img 
                                        src={iconPreview}
                                        alt="Preview"
                                        style={{maxWidth: "200px", borderRadius: "5px"}}
                                    />
                                    <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => {
                                        setIcon(null);
                                        setRemoveIcon(true)
                                        setIconPreview(null)
                                    }}
                                    className="ms-2"
                                >Remove Image</Button>
                                </div>
                            )}
                        {forum.iconUrl && <img src={imageIconSrc!} alt="icon" style={{maxHeight: "200px", marginBottom: "10px"}} />}
                    </Form.Group>
                    <Form.Check type="checkbox" label="Remove current image" checked={removeIcon} onChange={(e) => setRemoveIcon(e.target.checked)} />
                    <Form.Group className="mb-3">
                        <Form.Label>Change Banner</Form.Label>
                        <Form.Control type="file" onChange={(e) => {
                            const file = (e.target as HTMLInputElement).files?.[0] ?? null
                            setBanner(file)
                            if(file){
                                const previewUrl = URL.createObjectURL(file);
                                setBannerPreview(previewUrl)
                            }else{
                                setBannerPreview(null);
                            }
                        }} />
                        <br/>
                        {bannerPreview && (
                            <div>
                                <img
                                    src={bannerPreview}
                                    alt="Preview"
                                    style={{maxWidth: "200px", borderRadius: "5px"}}
                                />
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => {
                                        setBanner(null);
                                        setRemoveBanner(true)
                                        setBannerPreview(null)
                                    }}
                                    className="ms-2"
                                >Remove Image</Button>
                            </div>
                        )}
                        {forum.bannerUrl && <img src={imageBannerSrc!} alt="icon" style={{maxHeight: "200px",maxWidth: "450px", marginBottom: "10px"}}/>}
                    </Form.Group>
                    <Form.Check type="checkbox" label="Remove current banner" checked={removeBanner} onChange={(e) => setRemoveBanner(e.target.checked)} />
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
export default EditForumModal;