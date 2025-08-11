import { useEffect, useMemo, useState} from "react";
import { useStoreActions, useStoreState} from "../interface/hooks"
import { useNavigate, Link} from "react-router-dom"
import {Spinner, Card, Dropdown} from "react-bootstrap";
import api from "../api/forums";
import dayjs from "dayjs";
import ThreadCard from "./ThreadCard";
import { useTheme } from "./ThemeContext";
import { VisitItemDto, PageVisit, dedupeConsecutive, mapVisitToItem } from "./types";
interface HomeProps {
    SortBy: string
}
type Visit = {
    id: number;
    entityType: number;
    path: string;
    entityId?: number;
    referrerPath? : string;
    startedAt: string;
    durationMs? : number;
}
const typeLabel = (t: number) => ["Route", "Forum", "Thread", "Profile"][t] ?? "Route";
const Home: React.FC<HomeProps>= ({SortBy}) => {
    const [items, setItems] = useState<VisitItemDto[]>([]);
    const [loading2, setLoading] = useState(false);
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
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        api.get<VisitItemDto[]>("/api/activity/history", { withCredentials: true })
            .then(res => { if (!cancelled) setItems(res.data); })
            .catch(console.error)
            .finally(() => !cancelled && setLoading(false));
        return () => { cancelled = true; };
    }, []);
    const items123 = useMemo(() => {
        //const mapped = items.map(mapVisitToItem);
        return dedupeConsecutive(items); // remove consecutive repeats
    }, [items]);
    const handleSortChange = (sort: string | null) => {
        if(!sort) return;
        setSortBy(sort);
    }
    const handleDelete = async() => {
        setLoading(true);
        try{
            api.delete("/api/activity/history", {withCredentials : true})
            setItems([]);
        }catch(err : any){
            console.error(err);
        }finally{
            setLoading(false);
        }
    }
    const bg = darkMode ? "#212529" : "#ffffff";
    const color = darkMode ? "white" : "black";
    const timeAgo = (iso: string) => {
            const diffMs = Math.max(0, Date.now() - new Date(iso).getTime()); // clamp to 0
            const s = Math.floor(diffMs / 1000);
            if (s < 60) return `${s}s`;
            const m = Math.floor(s / 60);
            if (m < 60) return `${m}m`;
            const h = Math.floor(m / 60);
            if (h < 24) return `${h}h`;
            return `${Math.floor(h / 24)}d`;
    };
    if(loading) return <Spinner animation="border" />
    if(error) return <div className="text-danger text-center">Error: {error}</div>
    return (
        <div style={{backgroundColor: bg, color: color, minHeight: "100vh", marginTop: "45px"}}>
        
        <div className="container" >
            <div className="row g-2">
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
                
                <div className="container col-lg-9" >
                {threads.map(thread => (
                    <ThreadCard key={thread.id} thread={thread} darkMode={darkMode} />
                ))}
                </div>
            )}
        <div className="col-lg-3 ">
            <div className="position-sticky" style={{top:"80px"}}>
                <div className="card shadow-sm">
                    <div className="card-body recent-activity">
                        <button onClick={handleDelete} className="align-items-end justify-content-center d-flex ms-5">Clear History</button>
                        <h5 className="card-title mb-3">Recent Activity</h5>
                        {loading2 && <p>Loading...</p>}
                        <ul className="list-group">
                            {items123.map(v => (
                                <li key={v.id} className="list-group-item d-flex justify-content-between">
                                    <div>
                                        <a href={v.url} className="activity-item text-decoration-none">
                                            <div className="kind fw-semibold">{v.kind}</div>
                                            <div className="title">{v.title}</div>
                                        </a>
                                        <div className="meta text-muted ms-2">{timeAgo(v.startedAt)}</div>
                                    </div>
                        
                                </li>
                            ))}
                            
                        </ul>
                    </div>
                </div>
            </div>

        </div>
        </div>
        </div>

        </div>

    )
}
export default Home