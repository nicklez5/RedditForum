import { useState, useEffect} from "react"
import api from "../api/forums"
import {useNavigate, Link, Navigate} from "react-router-dom"
import { useStoreActions, useStoreState } from "../interface/hooks"
import styles from "../modules/LoginPage.module.css";
import { useTheme } from "./ThemeContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTurnDown } from "@fortawesome/free-solid-svg-icons";
import { Alert, Form, Button, Spinner } from "react-bootstrap";

const ForgotPassword = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const msg = useStoreState((s) => s.user.message);
  const error = useStoreState((s) => s.user.error);
  const forgotPassword = useStoreActions((a) => a.user.forgotPassword);

  // control alert visibility
  const [showMsg, setShowMsg] = useState(false);
  const [showErr, setShowErr] = useState(false);
  const [showLocalErr, setShowLocalErr] = useState(false);

  useEffect(() => { setShowMsg(!!msg); }, [msg]);
  useEffect(() => { setShowErr(!!error); }, [error]);
  useEffect(() => { setShowLocalErr(!!localError); }, [localError]);

  // clear local error as they type
  useEffect(() => { if (username.trim()) setLocalError(null); }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setLocalError("Enter a username");
      return;
    }
    setSubmitting(true);
    try {
      // await so you don't race UI updates
      await forgotPassword({
        username: username.trim(),
        clientUrl: window.location.origin, // e.g. https://yourapp.com
      });
      // (optional) navigate to a confirmation page
      // navigate("/forgot-password/sent");
    } finally {
      setSubmitting(false);
    }
  };

     const bg = darkMode ? "#56687a76" : "#ffffff";
    const color = darkMode ? "white": "black";
    const bg2 = darkMode ? "rgb(9,15,17)" : "rgb(248,248,248)";
    const bg3 = darkMode ? "#131717" : "rgb(248,248,248)";
  return (
    <>
      <div className="d-flex flex-column w-100 bg-dark text-white overflow-auto text-break">
        <div className="loginPage" style={{ backgroundColor: bg2 , colorScheme: color, }} />
      </div>
    
      <div className="container" >
        <Alert
          variant="success"
          dismissible
          show={showMsg}
          onClose={() => setShowMsg(false)}
        >
          {msg}
        </Alert>

        <Alert
          variant="danger"
          dismissible
          show={showErr}
          onClose={() => setShowErr(false)}
        >
          {error}
        </Alert>

        <Alert
          variant="danger"
          dismissible
          show={showLocalErr}
          onClose={() => setShowLocalErr(false)}
        >
          {localError}
        </Alert>
        <div className="row justify-content-center align-items-center" style={{minHeight: "80vh", width: "100%"}}>
        <div className="col-12 col-md-6 col-lg-4 position-relative">
        

        

        <Form onSubmit={handleSubmit} className="shadow-lg rounded-5 position-absolute top-50 start-50 translate-middle" style={{backgroundColor: bg3, padding: "60px", width: "60vh",height: "35.5vh" ,fontFamily: "Optima, sans-serif",colorScheme: color}}>
        <h2 className="mt-4 mb-3 text-center fs-3 fw-medium text-white">Forgot Password</h2>
          <Form.Group className="mb-3">
            <Form.Label className="text-white">Username</Form.Label>
            <Form.Control
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your-username"
              autoComplete="username"
            />
          </Form.Group>
          <div className="d-flex justify-content-center mt-4">
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? <Spinner animation="border" size="sm" /> : "Send reset link"}
          </Button>
          </div>
        </Form>
        </div>
        </div>
      </div>
    </>
  );
};
export default ForgotPassword;