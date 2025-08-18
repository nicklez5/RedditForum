import React, {useState, useEffect} from "react";
import api from "../api/forums"
import { useStoreActions, useStoreState } from "../interface/hooks";
import { useTheme } from "./ThemeContext";
import { Alert, Form } from "react-bootstrap";
import { FormLabel } from "react-bootstrap";
import { LoginDto, RegisterDto } from "../interface/UserModel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import RegisterModal from "./Signup";



const Login = () => {
    const navigate = useNavigate();
    const {darkMode} = useTheme();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const login = useStoreActions((a) => a.user.login);
    const bg2 = darkMode ? "#000000e8" : "#ffffff";
    const error = useStoreState((s) => s.user.error);
    const message = useStoreState((s) => s.user.message);
    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    }
    const [show, setShow] = useState(false);
    const open = () => setShow(true);
    const close = () => setShow(false);
    const register = useStoreActions((a) => a.user.register);
    const setMessage = useStoreActions((a) => a.user.setMessage);
    const [error2,setError] = useState("")
    const handleSubmit = async(e: React.FormEvent) => {
        e.preventDefault();
        if(!username.trim() && !password.trim()){
            setError("Please type your username and password")
            return;
        }

        const dto: LoginDto={
            username: username,
            password: password
        }
        const success = await login(dto);
        if(success){
            navigate("/");
        }
    }
    const handleSubmit2 = async(data: {username: string, email: string, firstName: string, lastName: string, password: string, confirmPassword: string, role: string }) => {
        const dto: RegisterDto ={
            username: data.username,
            email: data.email,
            firstName : data.firstName,
            lastName: data.lastName,
            password: data.password,
            confirmPassword: data.confirmPassword,
            role: data.role
        }
        await register(dto);
    }
    return(
        <div>
            
        <div className="h-1 z-1" style={{height: "95vh", background: bg2}}>
        <div className="container pt-5">
            <h2 className="text-white d-flex align-items-center justify-content-center fw-normal fs-2 ps-3" style={{backgroundColor: "#363a42", height:"7vh"}}>
                Log in
            </h2>
            {error2 && (
                <Alert variant="danger" dismissible>{String(error2)}</Alert>
            )}
            {typeof message === "string" && (
                        <Alert variant="success" dismissible onClose={() => setMessage(null)}>
                            {message}
                        </Alert>
            )}
            {error && (
                 <Alert variant="danger" dismissible>{String(error)}</Alert>
            )}
            <div className="d-flex w-100 align-items-center justify-content-center" style={{backgroundColor: "#363a42", height: "45vh"}}>
            <Form onSubmit={handleSubmit} className="w-50">
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label className="text-white d-flex align-items-start">Email Address</Form.Label>
                    <Form.Control type="email" placeholder="Enter email" onChange={(e) => setUsername(e.target.value)}/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    
                    <Form.Label className="text-white d-flex align-items-start">Password</Form.Label>
                    <div className="d-flex">
                    <Form.Control type={showPassword ? "text" : "password"} placeholder="Enter password" onChange={(e) => setPassword(e.target.value)}/>
                    <button type="button" onClick={togglePasswordVisibility} className="flex justify-content-around align-items-center border-1">
                    {showPassword ? "Hide" : "Show"}
                    </button>
                    </div>
                    
                </Form.Group>
                <button className="rounded-5 border-0 p-2 align-items-start justify-content-start d-flex " onClick={() => navigate('/forgotPassword')}>
                    Forgot Password?
                </button>
                <br/>
                <div className=' '>
                <button type="submit" className=" border-bottom rounded-1 px-3 py-2 my-1" style={{backgroundColor: "#BCCFDE"}}>
                <FontAwesomeIcon icon={faLock}/>
                    Log In
                </button>
                </div>
                <br/>
                <span className="text-white">Dont have an account? </span>
                <button className="border-1 rounded-2 px-3 py-2 mt-2 fs-6 fw-normal opacity-75" style={{color: "black"}} onClick={open}><FontAwesomeIcon icon={faPlus}/>Register Now</button>
                
            </Form>
            <RegisterModal
                        show={show}
                        onClose={close}
                        onSubmit={handleSubmit2}
            />
            </div>
        </div>
        </div>
        </div>
    )
}
export default Login;