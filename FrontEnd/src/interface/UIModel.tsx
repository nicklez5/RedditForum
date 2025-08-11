import { action, Action } from "easy-peasy";

export interface UIModel{
    alert: string | null;
    alertType: 'success' | 'danger' | 'warning' | null;
    showAlert: boolean;
    setAlert: Action<UIModel, {message: string; type?: "success" | "danger" | "warning" | null}>,
    clearAlert: Action<UIModel>;
}
export const uiModel: UIModel = {
    alert: null,
    alertType: null,
    showAlert: false,

    setAlert: action((state, { message, type = 'danger' }) => {
        state.alert = message;
        state.alertType = type;
        state.showAlert = true;
    }),

    clearAlert: action((state) => {
        state.alert = null;
        state.alertType = null;
        state.showAlert = false;
    }),
}