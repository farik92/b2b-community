import {FormEvent, useEffect, useState} from "react";
import {useSocketContext} from "../contexts/SocketContext.tsx";
import {useUserContext} from "../contexts/UserContext.tsx";
import {RegisterData} from "../interfaces/user.interfaces.ts";
import {useGetAllUsers} from "../hooks/users.hooks.ts";
import {putRoomImageRequest} from "../api/images.api.ts";

function CreateRoom() {
    const roomDefaultImage = import.meta.env.VITE_ROOM_NONE_IMAGE;
    const {user, setError, error} = useUserContext();
    const {setPanel, scrollRef, socket, room, setRoom} = useSocketContext();
    const {users} = useGetAllUsers(user.id);
    const [members, setMembers] = useState<number[]>([]);

    useEffect(() => {
        setRoom({name: "", creator: user.id, url: roomDefaultImage, image: roomDefaultImage});
    }, []);

    const roomHandleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (room.name === "") return setError("Required Room Name");
        if (members.length > 0) {
            setError({});
            // guardar imagen creada de cloudinary en la db
            socket.emit("createRoom", room);
            socket.emit("addClientToRoom", {...room, members});
            if (room.image !== room.url) await putRoomImageRequest(room.name, room.image);
        } else return setError("You have to select any user to create a room");
        setMembers([]);
        setPanel("chats");
        setRoom({
            ...room,
            name: "",
            creator: user.id,
        });
    };

    const handleMembers = (userId: number) => {
        if (!members.includes(userId)) setMembers([...members, userId]);
        if (members.includes(userId)) setMembers(members.filter((member) => member !== userId));
    };

    return (
        <form className="create-room" ref={scrollRef} onSubmit={roomHandleSubmit}>
            <div className="container-h2-span-input-button-h3">
                <h3 className="h3-create-room">Create Room</h3>
                <div className="container-errors">
                    {error.length > 0 ? <div className="room-error">{error}</div> : <div></div>}
                </div>
                <div className="input-room-image-and-text-button">
                    <div className="text-and-button">
                        <input
                            className="input-room-name"
                            id="input"
                            value={room.name}
                            placeholder="Room name"
                            type="text"
                            onChange={(e) => setRoom({...room, name: e.target.value})}
                            autoFocus
                            spellCheck
                            autoComplete="off"
                        />
                        <button type="submit" className="button-create-room">
                            Create
                        </button>
                    </div>
                </div>
                <h3 className="select-users">Select users:</h3>
            </div>
            {users.map((user: RegisterData, index: number) => (
                <div
                    key={index}
                    className={`sender-chat ${members.includes(user.id) ? "selected" : ""}`}
                    onClick={() => handleMembers(user.id)}
                >
                    <span className="sender-chat-span">{user.name}</span>
                </div>
            ))}
        </form>
    );
}

export default CreateRoom;
