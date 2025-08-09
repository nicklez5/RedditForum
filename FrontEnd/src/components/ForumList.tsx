import { useEffect, useState} from "react";
import { useStoreActions, useStoreState} from "../interface/hooks"
import { useNavigate, Link} from "react-router-dom"
import {Spinner, Card, Dropdown} from "react-bootstrap";
import api from "../api/forums";
import ForumCard from "./ForumCard";
import { useTheme } from "./ThemeContext";
const ForumList = () => {
    const {darkMode} = useTheme();
    const forums = useStoreState((s) => s.forum.forums);
    const loading = useStoreState((s) => s.forum.loading);
    const error = useStoreState((s) => s.forum.error)
    const fetchForums = useStoreActions((a) => a.forum.GetAllForums);
    useEffect(() => {
        fetchForums()
    },[fetchForums])
    const bg = darkMode ? "#212529" : "#ffffff";
    const color = darkMode ? "white": "black"
    if(loading) return <Spinner animation="border"/>
    if(error) return <div className="text-danger">Error: {error}</div>
    return (
        <div style={{backgroundColor: bg, color: color, minHeight: "100vh", marginTop: "45px"}}>
            <div className="container" style={{ maxWidth: "700px" }}>
                {forums.map(forum => (
                    <ForumCard key={forum.id} forum={forum} darkMode={darkMode} />
                ))}
                </div>
        </div>
    )
}
export default ForumList;