import { useEffect, useState} from "react";
import { useStoreActions, useStoreState} from "../interface/hooks"
import { useNavigate, Link} from "react-router-dom"
import {Spinner, Card, Dropdown} from "react-bootstrap";
import api from "../api/forums";
import ThreadCard from "./ThreadCard";
import { useTheme } from "./ThemeContext";
interface HomeProps {
    SortBy: string
}
const Home: React.FC<HomeProps>= ({SortBy}) => {
    const  {darkMode} = useTheme();
    const threads = useStoreState((s) => s.thread.threads);
    const loading = useStoreState((s) => s.thread.loading);
    const error = useStoreState((s) => s.thread.error);
    const [sortBy,setSortBy] = useState(SortBy);
    const fetchThreads = useStoreActions((a) => a.thread.SearchByFilterThread);
    const fetchForums = useStoreActions((a) => a.forum.GetAllForums);
    useEffect(() => {
        fetchThreads(sortBy);
    },[fetchThreads,sortBy])

    useEffect(() => {
        fetchForums()
    },[fetchForums])
    const handleSortChange = (sort: string | null) => {
        if(!sort) return;
        setSortBy(sort);
    }
    const bg = darkMode ? "#212529" : "#ffffff";
    const color = darkMode ? "white" : "black";
    if(loading) return <Spinner animation="border" />
    if(error) return <div className="text-danger">Error: {error}</div>
    return (
        <div style={{backgroundColor: bg, color: color, minHeight: "100vh", marginTop: "45px"}}>
        
        <div className="container" style={{maxWidth: "700px"}}>
            <div className="d-flex justify-content-start mb-2">
            <Dropdown onSelect={handleSortChange}>
                <Dropdown.Toggle variant={darkMode ? "dark" : "white"} id="dropdown-sort" className="position-relative top-50 start-50 translate-middle pe-xxl-5">
                    Sort: {sortBy.toUpperCase()}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    <Dropdown.Item eventKey="new">New</Dropdown.Item>
                    <Dropdown.Item eventKey="hot">Hot</Dropdown.Item>
                    <Dropdown.Item eventKey="random">Random</Dropdown.Item>
                    <Dropdown.Item eventKey="best">Best</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
            </div>
            {threads.length === 0 ? (
                <p>No threads found.</p>
            ) : (
                
                <div className="container" style={{ maxWidth: "700px" }}>
                {threads.map(thread => (
                    <ThreadCard key={thread.id} thread={thread} darkMode={darkMode} />
                ))}
                </div>
            )}
            
        </div>
        </div>
    )
}
export default Home