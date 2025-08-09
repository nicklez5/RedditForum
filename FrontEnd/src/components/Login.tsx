import { useState} from "react"
import api from "../api/forums"
import {useNavigate, Link, Navigate} from "react-router-dom"
import { useStoreActions, useStoreState } from "../interface/hooks"
import styles from "../modules/LoginPage.module.css";
import { useTheme } from "./ThemeContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTurnDown } from "@fortawesome/free-solid-svg-icons";

const LoginPage = () => {
    const {darkMode} = useTheme();
    const navigate = useNavigate()
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const login = useStoreActions(actions => actions.user.login)
    const loading = useStoreState(s => s.user.loading)
    const error = useStoreState(s => s.user.error);
    const token = useStoreState(s => s.user.token) || null;
    const handleLogin = async(e: any) => {
        e.preventDefault();
        try{
            const success = await login({ username, password})
            if(error === null){
                navigate("/home");
            }else{
                navigate("/")
            }
        }catch(err){
            console.error(err);
        }
    }
    
    if(token){
        return <Navigate to='/home' replace />
    }
    const bg = darkMode ? "#3E4B58" : "#ffffff";
    const color = darkMode ? "white": "black";
    const bg2 = darkMode ? "rgb(9,15,17)" : "rgb(248,248,248)";
    const bg3 = darkMode ? "#131717" : "rgb(248,248,248)";
    return (
        <>
        <div className="d-flex flex-column w-100 bg-dark text-white overflow-auto text-break">
            <div className="loginPage" style={{ backgroundColor: bg2, colorScheme: color}}></div>
        </div>
        <div className="container">
            <div className="row justify-content-center align-items-center" style={{minHeight: "100vh", width: "100%"}}>
                <div className="col-12 col-md-6 col-lg-4 position-relative">
                <form className="shadow-lg rounded-5  position-absolute top-50 start-50 translate-middle " style={{backgroundColor: bg3, padding: "60px", width: "60vh",height: "55vh" ,fontFamily: "Optima, sans-serif",colorScheme: color}} onSubmit={handleLogin}>
                    <h2 className="mb-3 text-center fs-3 fw-medium"><strong style={{color: color }}>Log in</strong></h2>
                    <div className="mt-4 mb-4">
                        
                        <input
                            type="text" 
                            className="form-control rounded-4 ms-xxl-5 mt-xxl-5 no-border" 
                            id="inputEmail" 
                            style={{backgroundColor: bg , color: color, padding: "20px", margin: 0, width: "40vh", height: "6.5vh",fontSize: "17px", textAlign: "left"}} 
                            aria-describedby="emailHelp" 
                            required 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            placeholder="Email or Username"
                        />
                        
                    </div>
                    <div className="mb-4 mt-4">
                        <input type="password" 
                        className="form-control rounded-4 ms-xxl-5 mt-xxl-5 no-border" 
                        id="inputPassword" 
                        style={{backgroundColor: bg, color: color, padding: "20px", margin: 0, width: "40vh" ,height: "6.5vh",fontSize: "17px"}} 
                        required 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="Password"/>
                    </div>
                    <div className="text-start ms-xxl-5 ps-3">
                        <small className="text-muted fs-6 ">
                            <Link to="/forgotPassword" className="text-decoration-none text-primary">
                                Forgot Password?
                            </Link>
                        </small>
                    </div>
                    <div className="text-start ms-xxl-5 ps-3 mt-4">
                        <small className="fs-6" style={{color:color, fontSize: "15px"}}>
                            New to Reddit? {' '}
                            <Link to="/register" className="text-decoration-none text-primary fs-6 ps-1">
                                Sign Up
                            </Link>
                        </small>
                    </div>
                    <div className="d-flex justify-content-center mt-3">
                    <button type="submit" className="rounded-4 p-2 mb-3 mt-3 w-75" style={{backgroundColor : "#f6603f", height: "60px"}}>Log in</button>
                    </div>
                    
                    
                </form>
                </div>
            </div>
        </div>
        </>
    )
}
export default LoginPage