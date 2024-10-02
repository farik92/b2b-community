import {useState, useEffect, createContext, useContext, useRef} from "react";
import {ChildrenType, RegisterData, UsersAndRooms} from "../interfaces/user.interfaces";
import {Socket, io} from "socket.io-client";
import {useUserContext} from "./UserContext";
import {Message} from "../interfaces/message.interfaces";
import {useGetAllMessages} from "../hooks/messages.hooks";
import {getAllMessagesRequest} from "../api/messages.api";

const socketContext = createContext<any>(undefined);

export function useSocketContext() {
    return useContext(socketContext);
}
const SocketProvider = (props: ChildrenType) => {
    const {user, isAuthenticated, isMembers} = useUserContext();
    const [unReadMessagesCount, setUnReadMessagesCount] = useState<{ count?: number }>({});
    const [unReadMessagesCountByChat, setUnReadMessagesCountByChat] = useState<{count?:number,id?:number}>({});
    const [userToSend, setUserToSend] = useState("none");
    const [userToSendName, setUserToSendName] = useState("none");
    const {messages, setMessages} = useGetAllMessages(isMembers);
    const [conectedUsers, setConectedUsers] = useState<string[]>([]);
    const [socket, setSocket] = useState<Socket>();
    const [allMessages, setAllMessages] = useState<Message[]>([]);
    const [panel, setPanel] = useState("chats");
    const scrollRef = useRef<HTMLDivElement>(null);
    const dateISO = new Date().toISOString();
    const [roomMembers, setRoomMembers] = useState<RegisterData[]>([]);
    const [room, setRoom] = useState({name: ""});
    const [usersAndRooms, setUsersAndRooms] = useState<RegisterData[]>([]);

    useEffect(() => {
        console.log('getMessagesReceiver')
        const getMessagesReceiver = async () => {
            const data = await getAllMessagesRequest();
            setAllMessages(data);
        };
        getMessagesReceiver();
    }, [messages]);

    useEffect(() => {
        const socket = io("http://localhost:3000", {
            auth: {userId: user.id, receiverId: userToSend},
        });
        setSocket(socket);
        return () => {
            socket.disconnect();
        };
    }, [userToSend, isAuthenticated]);

    useEffect(() => {
        if (socket) {
            const allMessagesHandler = (data: any) => {
                const finalData = {...data, createdAt: dateISO};
                setAllMessages((prevAllMessages) => [...prevAllMessages, finalData]);
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {...finalData, sender: finalData.sender.id},
                ]);
            };

            socket.on("message", allMessagesHandler);
            return () => {
                socket.off("message", allMessagesHandler);
            };
        }
    }, [socket]);

    useEffect(() => {
        if (socket) {
            socket.on('unReadMessagesCount', (count: number) => {
                setUnReadMessagesCount({count});
                console.log('Unread messages:', count);
            });
            return () => {
                socket.off("unReadMessagesCount");
            };
        }
    }, [socket]);

    useEffect(() => {
        if (socket) {
            console.log(user);
            socket.on('unReadMessagesCountByChat', (count: number) => {
                setUnReadMessagesCountByChat({count,id:user.id});
                console.log('Unread messages by chat:', count);
            })
        }
    }, [socket]);

    useEffect(() => {
        if (socket) {
            socket.on("getOnlineUsers", (names: string[]) => setConectedUsers(names));
            return () => {
                socket.off("getOnlineUsers", (names: string[]) => setConectedUsers(names));
            };
        }
    }, [socket]);

    useEffect(() => {
        if (socket) {
            const addClientToRoomHandler = (data: UsersAndRooms) => {
                console.log({...data, createdAt: dateISO});
                const finalData = {...data, createdAt: dateISO};
                setUsersAndRooms((prevState) => [...prevState, finalData]);
            };
            socket.on("addClientToRoom", addClientToRoomHandler);
            return () => {
                socket.off("addClientToRoom", addClientToRoomHandler);
            };
        }
    }, [socket]);

    return (
        <socketContext.Provider
            value={{
                conectedUsers,
                socket,
                unReadMessagesCountByChat,
                unReadMessagesCount,
                userToSend,
                setUserToSend,
                userToSendName,
                setUserToSendName,
                messages,
                setMessages,
                dateISO,
                allMessages,
                setAllMessages,
                panel,
                setPanel,
                scrollRef,
                roomMembers,
                room,
                setRoom,
                usersAndRooms,
                setUsersAndRooms,
                setRoomMembers,
            }}
        >
            {props.children}
        </socketContext.Provider>
    );
};

export default SocketProvider;
