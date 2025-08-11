import { Alert } from "react-bootstrap";
import { useStoreActions, useStoreState } from "../interface/hooks";
export default function GlobalAlert(){
    const {alert, alertType, showAlert} = useStoreState((s) => s.ui);
    const clearAlert = useStoreActions((a) => a.ui.clearAlert);
    if(!showAlert) return null;
    return (
        <Alert
        variant={alertType || 'danger'}
        dismissible
        onClose={() => clearAlert()}
        className="m-0 text-center"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}
        >
        {alert}
    </Alert>
  );
}