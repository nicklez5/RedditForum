import { useState, useEffect} from "react"
import api from "../api/forums"
import {useNavigate, Link, Navigate, useSearchParams} from "react-router-dom"
import { useStoreActions, useStoreState } from "../interface/hooks"
import styles from "../modules/LoginPage.module.css";
import { useTheme } from "./ThemeContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTurnDown } from "@fortawesome/free-solid-svg-icons";
import { Alert, Form, Button, Spinner } from "react-bootstrap";
const ResetPassword = () => {
    const {darkMode} = useTheme();
    const [params] = useSearchParams();
    const email = params.get("email") ?? "";
    const token = params.get("token") ?? "";

    const [newPassword, setNewPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [msg, setMsg] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);
    const [showMsg, setShowMsg] = useState(false);
    const [showErr, setShowErr] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const handleSubmit = async(e : React.FormEvent) => {
        e.preventDefault();
        setErr(null);
        setMsg(null);
        setShowErr(false);
        setShowMsg(false);
        setSubmitting(true);
        if(!newPassword || newPassword !== confirm){
            setErr("Password must match");
            return;
        }
        try{
            await api.post("/api/auth/reset-password" , {
                email,
                token,
                newPassword
            })
            setMsg("Password reset successfully. You can now log in");
            setShowMsg(true);
        }catch(error: any){
            const errorMessage =
            error.response?.data?.message || error.message || "An error occurred.";
            setErr(errorMessage);
            setShowErr(true);
        }finally{
            setSubmitting(false);
        }
    }
    const bg = darkMode ? "#56687a76" : "#ffffff";
    const color = darkMode ? "white": "black";
    const bg2 = darkMode ? "rgb(9,15,17)" : "rgb(248,248,248)";
    const bg3 = darkMode ? "#131717" : "rgb(248,248,248)";
    if(!email || !token) return <p>Invalid reset link</p>
    return(
        <>
        <div className="d-flex flex-column w-100 bg-dark text-white overflow-auto text-break">
            <div className="loginPage" style={{backgroundColor: bg2, colorScheme: color}}/>
        </div>
        <div className="container">
            <Alert
                variant="success"
                dismissible
                show={showMsg}
                onClose={() => setShowMsg(false)}
            >{msg}</Alert>
            <Alert
                variant="danger"
                dismissible
                show={showErr}
                onClose={() => setShowErr(false)}
            >{err}
            </Alert>
            <div className="row justify-content-center align-items-center" style={{minHeight: "80vh", width: "100%"}}>
                <div className="col-12 col-md-6 col-lg-4 position-relative">
                    <Form onSubmit={handleSubmit} className="shadow-lg rounded-5 position-absolute top-50 start-50 translate-middle" style={{backgroundColor: bg3, padding: "60px", width: "60vh",height: "45.5vh" ,fontFamily: "Optima, sans-serif",colorScheme: color}}>
                        <h2 className="mt-4 mb-3 text-center fs-3 fw-medium text-white">Reset Password</h2>
                        <Form.Group className="mb-3">
                            <Form.Label className="text-white">New Password</Form.Label>
                            <Form.Control 
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter your new password"
                                autoComplete="password"
                                />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="text-white">Confirm Password</Form.Label>
                            <Form.Control 
                                type="password"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                placeholder="Confirm your new password"
                                autoComplete="password"
                                />
                        </Form.Group>
                        <div className="d-flex justify-content-center mt-4">
                            <Button type="submit" variant="primary" disabled={submitting}>
                                {submitting ? <Spinner animation="border" size="sm" /> : "Reset password"}
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
        
        </>
    )
}
export default ResetPassword