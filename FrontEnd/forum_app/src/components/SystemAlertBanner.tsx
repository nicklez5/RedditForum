import React, {useEffect, useState} from "react";
import api from "../api/forums";
import { Alert } from "react-bootstrap";
import { useStoreState } from "../interface/hooks";
const SystemAlertBanner = () => {
    const [alert, setAlert] = useState<{id: number; message: string } | null>(null);
    const loggedIn = useStoreState((s) => s.user.loggedIn);
    useEffect(() => {
        if(!loggedIn) {
            return;
        }
        api.get("/api/notification/systemalert" ,{ allowAnonymous: true } )
            .then(res => {
                if (res.data && res.data?.length > 0) {
                    const latestAlert = res.data[0];
                    setAlert({ id: latestAlert.id, message: latestAlert.message});
                }
            })
            .catch(err => console.error("Failed to fetch system alerts", err));
    },[loggedIn])
    if(!alert) return null;
    const clearAlert = () => {
        api.patch(`/api/notification/${alert.id}`)
           .then(() => setAlert(null))
           .catch(err => console.error("Failed to clear system alert", err))
    }
    return (
        <Alert variant="warning" className="text-center m-0" dismissible onClose={clearAlert}>
            {alert.message}
        </Alert>
    )
}
export default SystemAlertBanner;