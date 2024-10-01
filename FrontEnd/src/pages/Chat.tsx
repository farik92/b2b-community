import { useEffect } from "react";
import { useUserContext } from "../contexts/UserContext.tsx";
import { useSocketContext } from "../contexts/SocketContext.tsx";
import ChatsPanel from "../components/ChatsPanel.tsx";
import MessagesContainer from "../components/MessagesContainer.tsx";
import CreateRoom from "../components/CreateRoom.tsx";

function Chat() {
    const { user, logout, updateProfile, setUpdateProfile } = useUserContext();
    const { userToSend, messages, panel, setPanel, scrollRef, unReadMessagesCount } = useSocketContext();

    useEffect(() => {
        setUpdateProfile({
            name: user.name,
        });
    }, []);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    return (
        <>
            <nav className="navbar">
                <h1>{user.name} {unReadMessagesCount === 0 ? '' : unReadMessagesCount}</h1>
                <button className="button-logout" onClick={logout}>
                    Выход
                </button>
            </nav>
            <div className="chats-panel">
                <nav className="chats-navbar">
                    <span
                        onClick={() => {
                            setUpdateProfile({...updateProfile});
                            setPanel("chats");
                        }}
                        className="span-chats"
                    >
                        Чаты
                    </span>
                </nav>
                {panel === "chats" ? (
                    <ChatsPanel/>
                ) : (
                    <CreateRoom/>
                )}
            </div>
            {userToSend !== "none" ? (
                <MessagesContainer/>
            ) : (
                <div className="container-none">
                <div>
                        <h2>Добро пожаловать, {user.name}!</h2>
                        <h2>Выберите чат, чтобы начать общение</h2>
                    </div>
                </div>
            )}
        </>
    );
}

export default Chat;