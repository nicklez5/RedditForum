import React, {useEffect, useState} from 'react'
import { useStoreActions, useStoreState } from '../interface/hooks'
import {useNavigate, Link} from "react-router-dom"
import {Spinner, Container, Form, Button, Alert, Tab, Tabs, Card,Dropdown} from "react-bootstrap"
import api from '../api/forums'
import {Forum, ForumModel} from "../interface/ForumModel"
import { CreateForumDto } from '../interface/ForumModel'
import { useTheme } from "./ThemeContext"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faImage } from '@fortawesome/free-solid-svg-icons'
const NewForum = () => {
    const {darkMode} = useTheme();
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [icon,setIcon] = useState<File | null>(null);
    const [iconPreview, setIconPreview] = useState<string | null>(null);
    const [banner, setBanner] = useState<File | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showError , setShowError] = useState(false);
    const [imageUrl, setImageUrl] = useState('')
    const [loading , setLoading] = useState(false);
    const navigate = useNavigate();
    const createForum = useStoreActions((a) => a.forum.CreateForum);
    useEffect(() => {
        if(error && (title || description)){
            setError(null);
            setShowError(false);
        }
    },[title, description])
    const handleSubmit = async(e : React.FormEvent) => {
        e.preventDefault();
        console.log("Form submitted");
        if(!title || !description){
            setError("Title and description creation are required");
            setShowError(true);
            return;
        }
        const dto: CreateForumDto ={
            title: title,
            description: description,
            icon: icon,
            banner: banner
        }
        try{
            setLoading(true);
            setError(null);
            setShowError(false);
            await createForum(dto);
            console.log("Forum created successfully");
            navigate(`/home`)
        }catch(err: any){
            setError(err.message || "Failed to create forum.")
            setShowError(true);
        }finally{
            setLoading(false);
        }
    }
    useEffect(() => { setShowError(!!error); }, [error]);
    return (
        <>
        {error && <Alert variant="danger" className="text-center" dismissible show={!!error && showError} onClose={() => setShowError(false)}>{error}</Alert>}
        <div className="d-flex justify-content-center mt-5">
            <div className="w-100" style={{maxWidth: '600px'}}>
                <h3 className="mb-4">Create new Forum</h3>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Title</Form.Label>
                        <Form.Control type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control as="textarea" rows={6} value={description} onChange={(e) => setDescription(e.target.value)} />
                     </Form.Group>
                     <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label>Upload Icon(optional)</Form.Label>
                        <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={(e : React.ChangeEvent<HTMLInputElement>) => {
                                const file = e.target.files?.[0] || null;
                                setIcon(file);
                                if(file){
                                    setIconPreview(URL.createObjectURL(file))
                                }else{
                                    setIconPreview(null);
                                }
                            }}/>
                            {iconPreview && (
                                <div className="mt-2">
                                    <img src={iconPreview} alt="Preview" style={{maxHeight: "200px", marginBottom: "10px"}} />
                                    <div>
                                        <Button variant="outline-danger" size="sm" onClick={() => {
                                            setIcon(null);
                                            setIconPreview(null);
                                        }}>
                                            Remove Icon
                                        </Button>
                                    </div>
                                </div>
                            )}
                     </Form.Group>
                     <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label>Upload Banner(optional)</Form.Label>
                        <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={(e : React.ChangeEvent<HTMLInputElement>) => {
                                const file = e.target.files?.[0] || null;
                                setBanner(file);
                                if(file){
                                    setBannerPreview(URL.createObjectURL(file))
                                }else{
                                    setBannerPreview(null);
                                }
                            }}/>
                            {bannerPreview && (
                                <div className="mt-2">
                                    <img src={bannerPreview} alt="Preview" style={{maxHeight: "200px", marginBottom: "10px"}} />
                                    <div>
                                        <Button variant="outline-danger" size="sm" onClick={() => {
                                            setBanner(null);
                                            setBannerPreview(null);
                                        }}>
                                            Remove Banner
                                        </Button>
                                    </div>
                                </div>
                            )}
                     </Form.Group>
                     <Button type="submit" variant="primary">Post Forum</Button>
                </Form>
            </div>
        </div>
        </>
    )
}
export default NewForum;