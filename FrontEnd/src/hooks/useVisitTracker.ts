import {useEffect, useRef} from "react";
import {useLocation} from "react-router-dom";
import api from "../api/forums";
import {v4 as uuid} from "uuid";
export default function useVisitTracker(entity? : {type: "thread" |"forum" | "profile"; id?:number | string}){
    const location = useLocation();
    const lastPath = useRef<string>("")
    const visitId = useRef<number | null>(null);
    const startTime = useRef<number>(0);
    const currentKey = useRef<string | null>(null);
    
    useEffect(() => {
        const path = location.pathname + location.search;
        const referrer = lastPath.current || document.referrer || "";
        lastPath.current = path;

        const endPrev = async() => {
            if(visitId.current && startTime.current){
                const durationMs = Date.now() - startTime.current;
                try{
                    await api.post("/api/activity/visit/end", {visitId: visitId.current, durationMs}
                        ,{withCredentials: true}
                    );
                }
                catch{}
                visitId.current = null;
            }
        }
        const start = async() => {
            startTime.current = Date.now();
            currentKey.current = uuid();
            const toPascal = (s: string) => s[0].toUpperCase() + s.slice(1);
            const payloadBase = {
                clientVisitKey: currentKey.current,
                entityType: entity?.type ? toPascal(entity.type) : ("Route" as const),
                referrerPath: referrer || null,
                startedAt: new Date().toISOString(),
                path
            };
            const payload = 
                entity?.id == null ? payloadBase : typeof entity.id === "string" ? {...payloadBase, entityId: entity.id}
                : {...payloadBase , entityIntId: entity.id};
            try{
                const res = await api.post<number>("/api/activity/visit",payload,{
                    withCredentials: true
                });
                visitId.current = res.data
            }catch{}
        };
        endPrev().then(start);
        const onBeforeUnload = () => {
            if(visitId.current && startTime.current){
                const durationMs = Date.now() - startTime.current;
                const body = JSON.stringify({visitId: visitId.current, durationMs})
                const url = "http://localhost:5220/api/activity/visit/end"
                const blob = new Blob([body], {type: "application/json"})
                const sent = navigator.sendBeacon?.(url, blob);
                if(!sent){
                    try{
                        fetch(url, {
                            method: "Post",
                            body,
                            headers: {"Content-Type": "application/json"},
                            credentials: "include",
                            keepalive: true
                        }).catch(() => {})
                    }catch{}
                }
            }
        };
        window.addEventListener("beforeunload", onBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload",onBeforeUnload)
            void endPrev();
        };
    },[location.pathname,location.search, entity?.type, entity?.id])
}