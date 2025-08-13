import { useStoreActions, useStoreState } from "../interface/hooks";
function ForumIconUploader({forumId} : {forumId: number}){
    const {upload, cancel} = useStoreActions((a) => a.upload);
    const {uploading, progress, error, lastUrl} = useStoreState((s) => s.upload);
    const onSelect = async(e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(!file) return;
        await upload({
            file,
            presignPath: "/api/forum/presign/icon",
            commitPath: `/api/forum/${forumId}/icon`,
        }).catch(() => {})
    };
    return(
        <div>
            <input type="file" accept="image/*" onChange={onSelect} disabled={uploading}/>
            {uploading && <div>Uploading... {progress}% <button onClick={() => cancel()}>Cancel</button></div>}
            {error && <div style={{color: "red"}}>{error}</div>}
            {lastUrl && <img src={lastUrl} alt="icon" style={{maxHeight: "100"}} />}
        </div>
    )
}
export default ForumIconUploader;