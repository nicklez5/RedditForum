import React, {useEffect, useState} from "react";
import {Container, Form, Button, Row, Col, Alert, Spinner, Card} from "react-bootstrap"
import api from "../api/forums";
import { useStoreActions, useStoreState } from "../interface/hooks";
import { Profile } from "../interface/ProfileModel";
import { useParams } from "react-router-dom";
import { useTheme } from "./ThemeContext";

const Settings = () => {
    const Profile = useStoreState((s) => s.user.Profile);
    const {darkMode} = useTheme();
    const error = useStoreState((s) => s.user.error);
    const loading = useStoreState((s) => s.user.loading)
    const message = useStoreState((s) => s.user.message);
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [error1, setError] = useState<string | null>(null);
    const [newUsername, setNewUsername] = useState('')
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState("")
    const {changePassword, changeUsername, changeEmail,fetchProfile} = useStoreActions((a) => a.user)
    useEffect(() => {
        const load = async () => {
            await fetchProfile();
        };
        load();
    }, []);

    useEffect(() => {
        if (Profile?.email) {
            setEmail(Profile.email);
        }
        if(Profile?.username){
            setUsername(Profile.username);
        }
    }, [Profile]);
    const handleSubmitPassword = async(e : React.FormEvent) => {
        e.preventDefault();
        if(!newPassword || !currentPassword){
            setError("New Password  and Current Password is required")
            return;
        }
        const result = await changePassword({currentPassword, newPassword});
        if(result?.success){
            setNewPassword("");
            setCurrentPassword("");
        }
    }
    const handleSubmitEmail = async(e: React.FormEvent) => {
        e.preventDefault();
        if(!newEmail){
            setError("Email is required")
            return;
        }
        const result = await changeEmail(newEmail);
        if(result?.success){
            setNewEmail("")
            setEmail(newEmail);
        }
    }
    const handleSubmitUsername = async(e: React.FormEvent) => {
        e.preventDefault();
        if(!newUsername){
            setError("Username is required")
            return;
        }
        const result = await changeUsername(newUsername);
        if(result?.success){
            setNewUsername("")
            setUsername(newUsername);
        }
    }
    if(error) return <div className="text-danger">Error: {error}</div>
    return (
        <div className="d-flex justify-content-center mt-2">
        <div className="w-100 mt-2" style={{maxWidth: "600px"}}>
        {message && <Alert variant="success" dismissible>{message}</Alert>}
        {error && <Alert variant="danger" dismissible>{error}</Alert>}
        {error1 && <Alert variant="danger" dismissible>{error1}</Alert>}
        <h2 className="mb-4 text-start">Settings</h2>
        <div className="card py-2">
            <p className="ms-2">Email: {email}</p>
            <hr/>
            <p className="ms-2">Username: {username}</p>
        </div>

        <Form onSubmit={handleSubmitEmail}>
            <Form.Group className="mt-5 ms-2 ">
                <Form.Label>Change Email</Form.Label>
                <Form.Control type="text" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder={email} />
            </Form.Group>
            <Button type="submit" variant="primary" className="mt-3 ms-2">Submit</Button>
        </Form>
        <div className="mt-5 ">
        <Form onSubmit={handleSubmitUsername}>
            <Form.Group className="mt-3 ms-2">
                <Form.Label>Change Username</Form.Label>
                <Form.Control type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder={username}/>
            </Form.Group>
            <Button type="submit" variant="primary" className="mt-3 ms-2">Submit</Button>
        </Form>
        </div>
        <div className="mt-5 card">
            <Form onSubmit={handleSubmitPassword}>
                <h4 className="py-2 ms-5 font-monospace">Change Password</h4>
                <Form.Group className="mt-3 ms-2">
                    <Form.Label>Current Password</Form.Label>
                    <Form.Control type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder='Enter your current password' />
                </Form.Group>
                <Form.Group className="mt-3 ms-2">
                    <Form.Label>New Password</Form.Label>
                    <Form.Control type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" />
                </Form.Group>
                <Button type="submit" variant="primary" className="mt-3 ms-2">Submit</Button>
            </Form>
        </div>
        </div>
        </div>
    )
}
export default Settings;