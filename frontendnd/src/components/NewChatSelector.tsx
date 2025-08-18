import React, {useState, useEffect} from "react"
import Select from "react-select"
import { useStoreState,useStoreActions } from "../interface/hooks"
const NewChatSelector = () => {
    const users = useStoreState((s) => s.profile.profile);
    const currentUserId = useStoreState((s) => s.user.Id);
    const addChat = useStoreActions((a) => a.chat.addChat);
    const fetchProfiles = useStoreActions((a) => a.profile.fetchProfiles);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        fetchProfiles();
    },[fetchProfiles])

    const options = users.filter((u : any) => u.id !== currentUserId)
                         .map((u: any) => ({value: u.id, label: u.username, profileImageUrl: u.profileImageUrl}))
    const handleChange = (option: any) => {
        if(option) {
            addChat({userId: option.value, username: option.label, profileImageUrl: option.profileImageUrl});
            setSelected(null);
        }
    }
    return (
        <Select
            placeholder="Start a new conversation..."
            value={selected}
            onChange={handleChange}
            getOptionLabel={(e) => e!.label}
            options={options}
            isClearable
            className="ps-2 mx-2 "
            formatOptionLabel = {(option) => (
                <div className="d-flex align-items-center gap-2 bg-primary">
                    <img
                        src={option?.profileImageUrl}
                        alt="avatar"
                        style={{width: 40, height: 30, borderRadius: '50%'}}
                    />
                    <span>{option?.label}</span>
                </div>
            )}
            />
    )
}
export default NewChatSelector