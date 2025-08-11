import {useEffect, useState} from "react"
import api from "../api/forums"
import {useNavigate, Link, Navigate} from "react-router-dom"
import {useStoreActions, useStoreState} from "../interface/hooks"
import { useTheme} from "./ThemeContext"
import { RegisterDto } from "../interface/UserModel"
import { Alert, Button, Form, ProgressBar } from "react-bootstrap"

const SignupPage = () => {
    const {darkMode} = useTheme();
    const [step, setStep] = useState(1);
    const totalSteps = 6;
    const progress = (step / totalSteps) * 100; 
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("")
    const [role, setRole] = useState<"User" | "Admin">("User");
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const clearAlerts  = useStoreActions(a => a.user.clearAlerts);
    const [showError, setShowError] = useState(false);
    const [showMsg,   setShowMsg]   = useState(false);
    const register = useStoreActions((a => a.user.register));
    const registerAdmin = useStoreActions((a) => a.user.registerAsAdmin);
    useEffect(() => {
            clearAlerts();
        },[clearAlerts])

    const {error, message} = useStoreState((a) => a.user);
    useEffect(() => { setShowError(!!error); }, [error]);
    useEffect(() => { setShowMsg(!!message);     }, [message]);
    const canNext = () => {
        switch (step) {
        case 1: return username.trim() !== "" && email.trim() !== "";
        case 2: return firstName.trim() !== "" && lastName.trim() !== "";
        case 3: return password.length > 0 && confirmPassword.length > 0;
        case 4: return role === "User" || role === "Admin";
        case 5: return true;
        case 6: return true;
        default: return false;
        }
    };
    const handleSignup = async(e: any) => {
        e.preventDefault();
        setShowError(false);
        setShowMsg(false);
        clearAlerts();
        if (step < totalSteps) return; 
        try{
            const dto: RegisterDto = {
                email: email,
                username: username,
                firstName: firstName,
                lastName: lastName,
                password: password,
                confirmPassword: confirmPassword,
                role: role,
            }
            const success = await register(dto)
            if(success){
                window.location.href = "/"
            }else{
                alert(error);
            }
            if(error === null){
                //window.location.href = "/"
            }else{
                alert(error);
            }
        }catch(err : any){
            alert(err.message);
        }
    }
    const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps));
    const prevStep = () => setStep((prev) => Math.max(prev - 1 , 1));
    const bg = darkMode ? "#56687a76" : "#ffffff";
    const color = darkMode ? "white": "black";
    const bg2 = darkMode ? "rgb(9,15,17)" : "rgb(248,248,248)";
    const bg3 = darkMode ? "#131717" : "rgb(248,248,248)";
    return (
        <>
        <div className="d-flex flex-column w-100 bg-dark text-white overflow-auto text-break">
            <div className="loginPage" style={{backgroundColor: bg2, colorScheme: color}}></div>
        </div>
        <div className="container">
            {message && <Alert variant="success" dismissible show={showMsg}  onClose={() => setShowMsg(false)}>{message}</Alert>}
            {error && <Alert variant="danger" dismissible  show={showError}  onClose={() => setShowError(false)}>{error}</Alert>}
            <div className="row justify-content-center align-items-center" style={{minHeight: "100vh", width: "100%"}}>
                <div className="col-12 col-md-6 col-lg-4 position-relative">

                    <Form className="shadow-lg rounded-5 position-absolute top-50 start-50 translate-middle" style={{backgroundColor: bg3, padding: "60px", width: "60vh",height: "62.5vh" ,fontFamily: "Optima, sans-serif",colorScheme: color}} onSubmit={handleSignup}
                    onSubmitCapture={(e) => {
                        // hard guard: never submit until the last step
                        if (step === totalSteps ) e.preventDefault();
                    }}
                    onKeyDown={(e) => {
                        // prevent Enter from submitting until the final step
                        if (e.key === "Enter" && step < totalSteps) e.preventDefault();
                    }}>
                    <ProgressBar now={progress} label={`${Math.round(progress)}%`}  />
                    <h2 className="text-center mb-3 fs-3 fw-medium mt-5"><strong style={{color: color}}>Sign Up</strong></h2>
                    {step === 1 && (
                        <>
                        <Form.Group className="mb-3 mt-5">
                            <Form.Control
                                type="text"
                                name="username"
                                style={{backgroundColor: bg, color: color}}
                                className="rounded-4 ms-xxl-1 py-4"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                required
                                />
                        </Form.Group>
                        <Form.Group className="mb-3 mt-5">
                            <Form.Control
                                type="text"
                                name="email"
                                style={{backgroundColor: bg, color: color}}
                                className="rounded-4 ms-xxl-1 py-4"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                />
                        </Form.Group>
                        </>
                    )}
                    {step === 2 && (
                        <>
                        <Form.Group className="mb-3 mt-5">
                            <Form.Control 
                                type="text"
                                name="firstName"
                                style={{backgroundColor: bg, color: color}}
                                className="rounded-4 ms-xxl-1 py-4"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="Enter your first name"
                                required
                                />
                        </Form.Group>
                        <Form.Group className="mb-3 mt-5">
                            <Form.Control 
                                type="text"
                                name="lastName"
                                style={{backgroundColor: bg, color: color}}
                                className="rounded-4 ms-xxl-1 py-4"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Enter your last name"
                                required
                                />
                        </Form.Group>
                        </>
                    )}
                    {step === 3 && (
                        <>
                        <Form.Group className="mb-3 mt-5">
                            <Form.Control 
                                type="password"
                                name="password"
                                style={{backgroundColor: bg, color: color}}
                                className="rounded-4 ms-xxl-1 py-4"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                />
                        </Form.Group>
                        <Form.Group className="mb-3 mt-5">
                            <Form.Control 
                                type="password"
                                name="confirmPassword"
                                style={{backgroundColor: bg , color: color}}
                                className="rounded-4 ms-xxl-1 py-4"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm password"
                                required
                                />
                        </Form.Group>
                        </>
                    )}
                    {step === 4 && (
                        <>
                        <Form.Group className="mb-3 mt-5" controlId="roleSelect">
                            <Form.Label>Select Role</Form.Label>
                            <Form.Control 
                                as="select"
                                value={role}
                                onChange={(e) => setRole(e.target.value as "User" | "Admin")}
                            >
                                <option value="User">User</option>
                                <option value="Admin">Admin</option>
                            </Form.Control>

                        </Form.Group>
                        </>
                    )}
                    {step === 5 && (
                        <div>
                        <h5>Review</h5>
                        <ul>
                            <li>Username: {username}</li>
                            <li>Email: {email}</li>
                            <li>Name: {firstName} {lastName}</li>
                            <li>Role: {role}</li>
                        </ul>
                        </div>
                    )}
                    <div className="d-flex justify-content-between mt-4">
                        <Button type="button" variant="secondary" onClick={prevStep}>Back</Button>

                        {step < totalSteps ? (
                        <Button
                            type="button"                 // <-- IMPORTANT
                            variant="primary"
                            onClick={nextStep}
                            disabled={!canNext()}
                        >
                            Next
                        </Button>
                        ) : (
                        <Button
                            type="submit"                 // <-- only at the last step
                            variant="success"
                            disabled={!canNext()}
                        >
                            Sign Up
                        </Button>
                        )}
                    </div>
                    </Form>
                </div>
            </div> 
        </div>
        </>
    )
}
export default SignupPage;