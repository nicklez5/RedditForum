import { Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTheme } from "./ThemeContext";
interface UserSidebarProps {
    active : string;
}
const UserSidebar = ({active} : UserSidebarProps)  => {
    const {darkMode} = useTheme();
    const getLinkClass = (isActive: boolean) => {
        if(isActive){
            return darkMode ? "fw-bold text-primary bg-secondary rounded px-2 py-1" : "fw-bold text-primary bg-light border rounded px-2 py-1";
        }
        return darkMode ? "text-white" : "text-dark"
    }
    return (
        <div className={`${darkMode ? 'bg-dark text-white' : 'bg-light text-dark'} p-3 vh-100`}>
            <h4 className="mb-4">User Panel</h4>
            <Nav className="flex-column gap-2">
                <Nav.Link as={Link} to="/user" active={active === "dashboard"} className={getLinkClass(active === "dashboard")}>Dashboard</Nav.Link> 
                <Nav.Link as={Link} to="/user/posts" active={active === "posts"} className={getLinkClass(active === "posts")}>Manage Posts</Nav.Link> 
                <Nav.Link as={Link} to="/user/forums" active={active === "forums"} className={getLinkClass(active === "forums")}>Manage Forums</Nav.Link>
                <Nav.Link as={Link} to="/user/threads" active={active === "threads"} className={getLinkClass(active === "threads")}>Manage Threads</Nav.Link> 
            </Nav>
        </div>
    )
}
export default UserSidebar;