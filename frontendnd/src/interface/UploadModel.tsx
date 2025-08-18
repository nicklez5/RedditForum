import { Action, Thunk, action, thunk} from "easy-peasy";
import axios from "axios";
import type { AxiosInstance } from "axios";
import type { Injections } from "./injections";
import api from "../api/forums";
export type UploadArgs = {
    file: File;
    presignPath: string;
    commitPath: string;
    scope: string;
};
type VideoMeta = {durationSec? : number; width? : number; height?: number};
const readVideoMeta = (file: File): Promise<VideoMeta> => 
    new Promise((res) => {
        const v = document.createElement("video");
        v.preload = "metadata";
        v.onloadedmetadata = () => {
            res({
                durationSec: isFinite(v.duration) ? Math.round(v.duration) : undefined,
                width: v.videoWidth || undefined,
                height: v.videoHeight || undefined
            });
            URL.revokeObjectURL(v.src);
        }
        v.onerror = () => res({});
        v.src = URL.createObjectURL(file);
        v.load();
    })
export type UploadVideoArgs = {
    file: File;
    presignPath: string;
    commitPath: string;
    
};
export interface UploadState{
    uploading: boolean;
    progress: number;
    error?: string;
    lastUrl? : string;
    lastKey? : string;
    lastContentType?: string;
    _abort?: AbortController;
}
export interface UploadModel extends UploadState{
    setUploading: Action<UploadModel, boolean>;
    setProgress: Action<UploadModel, number>;
    setError: Action<UploadModel, string | undefined>;
    setLastUrl: Action<UploadModel, string | undefined>;
    setLastKey: Action<UploadModel, string | undefined>;
    setLastContentType: Action<UploadModel, string | undefined>;
    setAbort: Action<UploadModel, AbortController | undefined>;
    upload: Thunk<UploadModel,  UploadArgs>;
    uploadVideo: Thunk<UploadModel, UploadVideoArgs>;
    cancel: Thunk<UploadModel>;
}
export const uploadModel : UploadModel = {
    uploading: false,
    progress: 0,
    setUploading: action((s,v) => {s.uploading = v;}),
    setProgress: action((s,v) => {s.progress = v;}),
    setError: action((s,v) => {s.error = v || undefined;}),
    setLastUrl : action((s,v) => {s.lastUrl = v;}),
    setLastKey: action((s,v) => {s.lastKey = v;}),
    setLastContentType: action((s,v) => {s.lastContentType = v;}),
    setAbort: action((s,v) => {s._abort = v;}),
    uploadVideo: thunk(async(actions, {file,presignPath, commitPath}) => {
        actions.setError(undefined);
        actions.setProgress(0);
        actions.setUploading(true);
        const ac = new AbortController();
        actions.setAbort(ac);
        try{
            const presign = await api.post(presignPath, null, {
                params: {contentType: file.type, fileName: file.name}
            })
            const {key, url, publicUrl}  = presign.data as {key: string;url: string; publicUrl: string}
            await axios.put(url, file, {headers: {"Content-Type": file.type},
                signal: ac.signal,
                onUploadProgress: e => {
                    const pct = Math.round((100 * (e.loaded ?? 0)) / (e.total || file.size || 1));
                    actions.setProgress(pct);
                },})
            const meta = await readVideoMeta(file).catch(() => ({} as VideoMeta));
            await api.post(commitPath, {
                key,
                url: publicUrl,
                contentType: file.type,
                sizeBytes: file.size,
                durationSec: meta.durationSec,
                width: meta.width,
                height: meta.height
            }, {signal: ac.signal});
            actions.setLastUrl(publicUrl);
            actions.setLastContentType(file.type);
            actions.setLastKey(key);
            actions.setProgress(100);
        }catch(err: any){
            if(ac.signal.aborted){
                actions.setError("Upload canceled")
            }else{
                actions.setError(err?.message || "Upload failed");
            }
            throw err;
        }finally{
            actions.setUploading(false);
            actions.setAbort(undefined);
        }
    }),
    upload: thunk(async(actions, {file, presignPath, commitPath, scope}) => {
        actions.setError(undefined);
        actions.setProgress(0);
        actions.setUploading(true);
        const ac = new AbortController();
        actions.setAbort(ac);
        try{
            const presign = await api.post(presignPath, null , {
                params: {contentType: file.type, fileName: file.name, scope: scope},
                signal: ac.signal,
            })
            const {key,url, publicUrl} = presign.data as {key: string; url: string; publicUrl: string}
            await axios.put(url, file, {
                headers: {"Content-Type": file.type},
                signal: ac.signal,
                onUploadProgress: e => {
                    const pct = Math.round((100 * (e.loaded ?? 0)) / (e.total || file.size || 1));
                    actions.setProgress(pct);
                },
            });
            let width: number | undefined, height: number| undefined;
            try{
                const bmp = await createImageBitmap(file);
                width = bmp.width; height = bmp.height;
            }catch { }
            await api.post(commitPath, {
                key,
                url: publicUrl,
                contentType: file.type,
                sizeBytes: file.size,
                width,
                height,
            }, {signal: ac.signal});
            actions.setLastUrl(publicUrl);
            actions.setLastKey(key);
            actions.setProgress(100);
        }catch(err: any){
            if(ac.signal.aborted){
                actions.setError("Upload canceled")
            }else{
                actions.setError(err?.message || "Upload failed");
            }
            throw err;
        }finally{
            actions.setUploading(false);
            actions.setAbort(undefined);
        }
    }),
    cancel: thunk((actions, _payload, {getState}) => {
        getState()._abort?.abort();
        actions.setAbort(undefined);
        actions.setUploading(false);
    })
}