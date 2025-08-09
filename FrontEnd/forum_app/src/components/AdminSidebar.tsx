import { Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTheme } from "./ThemeContext";
interface AdminSidebarProps {
    active : string;
}
const AdminSidebar = ({active} : AdminSidebarProps)  => {
    const {darkMode} = useTheme();
    const getLinkClass = (isActive: boolean) => {
        if(isActive){
            return darkMode ? "fw-bold text-primary bg-secondary rounded px-2 py-1" : "fw-bold text-primary bg-light border rounded px-2 py-1";
        }
        return darkMode ? "text-white" : "text-dark"
    }
    return (
        <div className={`${darkMode ? 'bg-dark text-white' : 'bg-light text-dark'} p-3 vh-100`}>
            <h4 className="mb-4">Admin Panel</h4>
            <Nav className="flex-column gap-2">
                <Nav.Link as={Link} to="/admin" active={active === "dashboard"} className={getLinkClass(active === "dashboard")}>Dashboard</Nav.Link> 
                <Nav.Link as={Link} to="/admin/users" active={active === "users"} className={getLinkClass(active === "users")}>Manage Users</Nav.Link> 
                <Nav.Link as={Link} to="/admin/forums" active={active === "forums"} className={getLinkClass(active === "forums")}>Manage Forums</Nav.Link>
                <Nav.Link as={Link} to="/admin/threads" active={active === "threads"} className={getLinkClass(active === "threads")}>Manage Threads</Nav.Link> 
                <Nav.Link as={Link} to="/admin/posts" active={active === "posts"} className={getLinkClass(active === "posts")}>Manage Posts</Nav.Link>
                <Nav.Link as={Link} to="/admin/systemalerts" active={active === "systemalerts"} className={getLinkClass(active === "systemalerts")}>Manage System Alerts</Nav.Link>
            </Nav>
        </div>
    )
}
export default AdminSidebar;