import React, {useEffect, useState} from "react";
import {Container, Form, Button, Row, Col, Alert, Spinner, Card} from "react-bootstrap"
import api from "../api/forums";
import { useStoreActions, useStoreState } from "../interface/hooks";
import { Profile } from "../interface/ProfileModel";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useTheme } from "./ThemeContext";
interface ProfileProps{
    EditMode: boolean
}
const ProfilePage: React.FC<ProfileProps> = ({EditMode}) => {
    const {id} = useParams();
    const viewedProfile = useStoreState((s) => s.profile.selectedProfile);
    const fetchProfileById = useStoreActions((a) => a.profile.fetchSelectedProfile)
    const currentUser = useStoreState((s) => s.user.Profile);
    const updateProfile = useStoreActions((a) => a.user.updateProfile);
    const [editMode, setEditMode] = useState(EditMode);
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [bio, setBio] = useState('')
    const [file, setFile] = useState<File | null>(null);
    const [profileImageUrl, setProfileImageUrl] = useState('');
    const [preview , setPreview] = useState<string | null>(null);
    const {darkMode} = useTheme();
    const loading = useStoreState((s) => s.profile.loading);
    const isOwnProfile = !id || id === currentUser!.id
    const bg2 = darkMode ? "#000000e8" : "#ffffff";
    const color = darkMode ? "white": "black";
    useEffect(() => {
        if(id){
            fetchProfileById(id!);
        }
    },[])
    useEffect(() => {
        if(viewedProfile){
            setFirstName(viewedProfile.firstName);
            setLastName(viewedProfile.lastName);
            setBio(viewedProfile.bio);
            setProfileImageUrl(viewedProfile.profileImageUrl!);
        }
    },[viewedProfile])
    const getAchievements = (points: number) => {
        const achievements = [];

        if(points >= 10){
            achievements.push({ name: "Iron", icon: "https://lolg-cdn.porofessor.gg/img/s/league-icons-v3/160/1.png?v=9"})
        }
        if(points >= 50){
            achievements.push({name: "Bronze", icon: "/badges/bronze.png"})
        }
        if(points >= 100){
            achievements.push({ name: "Silver", icon: "https://lolg-cdn.porofessor.gg/img/s/league-icons-v3/160/3.png?v=9"})
        }
        if(points >= 200){
            achievements.push({name: "Gold", icon: "https://i.namu.wiki/i/TI2BGk5sLXtNrvv3Hyf9MK_cKw82C6S0UFIVrf6owcqcWRntupBUGftmek8Dj2bK9wwhC_7-qkJXZfIDLLj-Bg.webp"})
        }
        if(points >= 500){
            achievements.push({ name: "Platinum", icon: "https://www.proguides.com/guides/wp-content/uploads/2023/06/Season_2022_-_Platinum.webp"})
        }
        return achievements;
    }
    const reputation = viewedProfile?.reputation;
    const badges = getAchievements(reputation!);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if(selected){
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
        }
    }
    const getDims = async(file: File) => {
                try{ const bmp = await createImageBitmap(file); return { w: bmp.width, h: bmp.height}}
                catch{ return undefined;}
    }
    const handleUpload = async(): Promise<string | null> => {
        if(!file) return null;

        const formData = new FormData();
        formData.append('file', file);
        const f = file;
        const {data: pre} = await api.post("/api/profile/presign-avatar", null,{
            params: {contentType: f.type, fileName: f.name}
        });
        await axios.put(pre.url, f,{headers: {"Content-Type": f.type}});
        const dims = await getDims(f);
        await api.post("/api/profile/avatar" ,{
            key: pre.key, url: pre.publicUrl, contentType: f.type, sizeBytes: f.size, width: dims?.w, height: dims?.h
        })
        return pre.publicUrl as string;
        
    }
    const handleSave = async() => {
        const uploadedUrl = await handleUpload()
        if(!uploadedUrl && file){
            alert("Image upload failed.")
            return;
        }
        await updateProfile({
            firstName: firstName,
            lastName: lastName,
            bio: bio,
            profileImageUrl : uploadedUrl || profileImageUrl
        })
        setProfileImageUrl(uploadedUrl ||  profileImageUrl);
        setEditMode(false);
        if(id){
            fetchProfileById(id)
        }
    }
    if(loading || !viewedProfile){
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" />
            </div>
        )
    }
    return (
        <div style={{background: bg2,}}>
        <Container className="min-vh-100" >
            <Row className="justify-content-center">
                <Col md={6}>
                <Card className="p-0 mt-4">
                {!editMode ? (
                    <div className="text-center" style={{color: color, background: bg2}}>
                        <img 
                            src={viewedProfile.profileImageUrl || 'https://www.redditstatic.com/avatars/avatar_default_02_FF4500.png'}
                            alt="avatar"
                            className="rounded-circle mb-3"
                            style={{ width: '100px', height: '100px', objectFit: 'cover'}}
                            />
                        <h3>{viewedProfile.username}</h3>
                        <p>{viewedProfile.bio || 'No bio set.'} </p>
                        <p>
                            {viewedProfile.firstName} {viewedProfile.lastName}
                        </p>
                        <p>
                            Date Joined {new Date(viewedProfile.dateJoined).toLocaleDateString()} 
                        </p>
                        <p>
                            {viewedProfile?.reputation} Points
                        </p>
                        <p>Rank</p>
                        <div className="d-flex justify-content-center flex-wrap gap-2 mt-3">
                            {badges.map((badge) => (
                                <div key={badge.name} className="text-center">
                                    <img src={badge.icon}
                                        alt={badge.name}
                                        title={badge.name}
                                        style={{ width: "140px", height: '140px', backgroundColor: "transparent",backgroundBlendMode: "multiply"}}
                                    />
                                    <div style={{fontSize: '0.75rem'}}>{badge.name}</div>
                                </div>
                            ))}    
                        
                        </div> 
                        {isOwnProfile && (
                            <Button variant="primary" onClick={() => setEditMode(true)} className="mt-4">
                                Edit Profile
                            </Button>
                        )}
                    </div>
                    ):(
                        <div className="mt-3">
                        <Form className="mt-3">
                            <Form.Group className="mb-3">
                                <Form.Label>First Name</Form.Label>
                                <Form.Control
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder= "First Name"
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Last Name</Form.Label>
                                <Form.Control
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Last Name"
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Bio</Form.Label>
                                <Form.Control 
                                    as="textarea"
                                    rows={5}
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Your bio..."
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Profile Image</Form.Label>
                                <Form.Control
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </Form.Group>
                            {preview && (
                            <img
                                src={preview}
                                alt="preview"
                                className="mt-3 rounded-circle"
                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                            />
                            )}
                            <div className="d-flex justify-content-end gap-2">
                                <Button variant="success" onClick={handleSave}>
                                    Save
                                </Button>
                                <Button variant="secondary" onClick={()=> setEditMode(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </Form>
                        </div>
                    )}


                </Card>
                </Col>
            </Row>
        </Container>
        </div>
    )
}
export default ProfilePage;