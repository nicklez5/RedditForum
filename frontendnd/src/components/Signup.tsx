import {useEffect, useMemo, useState} from "react";
import {Modal, Form, Alert, Button} from "react-bootstrap"
import { useStoreActions, useStoreState } from "../interface/hooks";
type RegisterModalProps = {
    show: boolean;
    onClose: () => void;
    onSubmit : (data: {username: string; email : string; firstName: string; lastName: string; password: string; confirmPassword: string; role: string}) => Promise<void>| void;

}
type Role = "Admin" | "User";
export default function RegisterModal({show, onClose, onSubmit} : RegisterModalProps) {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [role, setRole] = useState<Role>('User');
    const [error, setError] = useState('');
    useEffect(() => {
        if(show){
            setUsername('')
            setEmail('')
            setFirstName('')
            setLastName('')
            setPassword('')
            setConfirmPassword('')
            setRole("User");
        }
    },[show])
    const submit = async(e : React.FormEvent) => {
        e.preventDefault();
        if(password !== confirmPassword){
            setError('password must match with confirm password')
            return;
        }
        await onSubmit({username: username.trim(), email: email.trim(), firstName: firstName.trim(), lastName: lastName.trim(), password: password.trim(), confirmPassword: confirmPassword.trim(), role: role.trim()})
        onClose();
    }
    return(
        <Modal show={show} onHide={onClose} centered size="lg" backdrop="static">
            {error !== "" && (
                <Alert variant="danger" dismissible>{error}</Alert>
            )}
            <Form onSubmit={submit}>
                <Modal.Header closeButton>
                    <Modal.Title>Register</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                            type="text"
                            size="lg"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="text"
                            size="lg"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email"
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                            type="text"
                            size="lg"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Enter first name"
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control
                            type="text"
                            size="lg"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Enter last name"
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            size="lg"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control
                            type="password"
                            size="lg"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Enter password again"
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="roleSelect" className="mb-3">
                        <Form.Label>Role</Form.Label>
                        <Form.Select
                            value={role}
                            onChange={(e) => setRole(e.target.value as Role)}
                            required
                        >
                            <option value="User">User</option>
                            <option value="Admin">Admin</option>
                        </Form.Select>
                    </Form.Group>
                    <div className="d-flex justify-content-center">
                        <Button type="submit" className="d-flex align-items-center justify-content-center">Submit</Button>
                    </div>
                    
                </Modal.Body>
            </Form>
        </Modal>
    )
}   