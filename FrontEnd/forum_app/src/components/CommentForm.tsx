import { useState } from "react";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage , faFileImage, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useStoreActions } from "../interface/hooks";
import { useTheme } from "./ThemeContext";

const CommentForm = ({threadId, parentPostId} : {threadId: number, parentPostId: number | null}) => {
    const [content, setContent] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(true);

    const handleCancel = () => {
        setContent('');
        setPreviewUrl(null);
        setShowForm(false);
    }
    const createPost = useStoreActions((actions) => actions.post.CreatePost)
    const fetchThread = useStoreActions((actions) => actions.thread.GetThreadById)
    const {darkMode} = useTheme();

    const handleImageChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(file){
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    }
    const handleRemoveImage = () => {
        setImage(null);
        setPreviewUrl(null);
    }
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const hasText = content.trim().length > 0;
        const hasImage = !!image;
        if(!hasText && !hasImage) return;


        const dto = {
            content,
            threadId,
            parentPostId,
            image: image || undefined,
        };

        await createPost(dto)
        await fetchThread(threadId)
        setContent('');
        setImage(null);
        setPreviewUrl(null);
        setShowForm(false);
    };
    return (
        <>
        {showForm && (
        <form onSubmit={handleSubmit} className={`p-3 rounded mt-2 ${darkMode ? 'bg-dark text-white' : 'bg-light text-dark'}`}>
            <div className="d-flex flex-column gap-2">
                <div className="d-flex align-items-center gap-3">
                    <label htmlFor="upload" style={{cursor: "pointer"}}>
                        <FontAwesomeIcon icon={faImage} />
                    </label>
                    <input
                        id="upload"
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageChange}
                    />
                    <span className={`${darkMode} ? 'text-white' : 'text-dark'`}>Aa</span>
                </div>
                <textarea
                    className={`form-control ${darkMode ? 'bg-dark text-white' : 'bg-light text-dark'}`}
                    placeholder="Add a comment..."
                    value={content}
                    onChange={(e)=> setContent(e.target.value)}
                    rows={3}
                />
                {previewUrl && (
                    <div className="position-relative" style={{maxWidth:"200px"}}>
                        <img src={previewUrl} alt="preview" className="img-fluid rounded" />
                        <button
                            type="button"
                            className="btn btn-sm btn-danger position-absolute top-0 end-0"
                            onClick={handleRemoveImage}
                            style={{ transform: 'translate(50%, -50%)', borderRadius: '50%'}}
                        >
                            <FontAwesomeIcon icon={faXmark}/>
                        </button>
                    </div>
                )}
                <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
                    <button type="submit" className="btn btn-danger">Comment</button>
                </div>
            </div>
        </form>
        )}
        </>
    )
}
export default CommentForm;