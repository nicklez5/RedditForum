import React, {useEffect} from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useStoreActions, useStoreState } from "../interface/hooks";
import { useTheme } from "./ThemeContext";

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const {darkMode} = useTheme();
    const searchForums = useStoreActions((actions) => actions.forum.SearchForum)
    const results = useStoreState((s) => s.forum.searchResults);

    useEffect(() => {
        if(query.trim()){
            searchForums(query);
        }
    },[query,searchForums])
    const bg = darkMode ? "#212529" : "#ffffff";
    const color = darkMode ? "white": "black";
    return (
        <div className="container mt-4" style={{maxWidth:"700px"}}>
            <h3>Search Results for "{query}"</h3>
            <br/>
            {results.threads.length === 0 && results.posts.length === 0 ? (
                <p>No results found.</p>
            ): (
                <>
                {results.threads.length > 0 && (
                    <div>
                    <h5>Threads:</h5>
                    <br/>
                    <ul className="list-group">
                        {results.threads.map((thread) => (
                            <Link 
                                to={`/threads/${thread.id}`}
                                key={thread.id}
                                className="list-group-item list-group-item-action thread-link"
                                style={{ textDecoration: "none", color: color , backgroundColor: bg}}
                            >
                                <p><strong>Author: </strong>{thread.authorUsername ?? "Unknown"}</p>
                                <p>{thread.title}</p>
                                <small className="">{new Date(thread.createdAt).toLocaleString()}</small>
                            </Link>
                        ))}
                    </ul>
                    </div>
                )}
                {results.posts.length > 0 && (
                    <div>
                    <h5>Posts:</h5>
                    <ul className="list-group" >
                        {results.posts.map((post) => (
                            <Link to={`/threads/${post.threadId}`} key={post.threadId} className="list-group-item list-group-item-action thread-link" style={{ textDecoration: "none", color: color, backgroundColor: bg}}>
                                
                            <li key={post.id} className="list-unstyled">
                                <p><strong>Author: </strong> {post.authorUsername ?? "Unknown"}</p>
                                <p>{post.content}</p>
                                <small className="text-muted">{new Date(post.createdAt).toLocaleString()}</small>
                            </li>
                            </Link>
                            
                        ))}
                    </ul>
                    </div>
                )}
                </>
            )}
        </div>
    )
}
export default SearchPage