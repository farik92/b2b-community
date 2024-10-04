import { useState, useEffect, createContext, useContext, useRef } from "react";
import { ChildrenType, RegisterData } from "../interfaces/user.interfaces";
import { Socket, io } from "socket.io-client";
import { useUserContext } from "./UserContext";
import { Message } from "../interfaces/message.interfaces";
import { useGetAllMessages } from "../hooks/messages.hooks";
import { getAllMessagesRequest } from "../api/messages.api";
import { useVisibilityChange } from "../hooks/useVisibilityState.hooks";

const socketContext = createContext<any>(undefined);

export function useSocketContext() {
  return useContext(socketContext);
}

const SocketProvider = (props: ChildrenType) => {
  const { user, isAuthenticated, isReceiver } = useUserContext();
  const [unReadMessagesCount, setUnReadMessagesCount] = useState<{
    count?: number;
  }>({});
  const [userToSend, setUserToSend] = useState("none");
  const [userToSendName, setUserToSendName] = useState("none");
  const { messages, setMessages } = useGetAllMessages(isReceiver);
  const visibilityChange = useVisibilityChange();
  const [conectedUsers, setConectedUsers] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket>();
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [panel, setPanel] = useState("chats");
  const scrollRef = useRef<HTMLDivElement>(null);
  const dateISO = new Date().toISOString();
  const [usersAndRooms, setUsersAndRooms] = useState<RegisterData[]>([]);

  useEffect(() => {
    const getMessagesReceiver = async () => {
      const data = await getAllMessagesRequest();
      setAllMessages(data);
    };
    getMessagesReceiver();
  }, [messages]);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SERVER_HOST, {
      auth: {
        userId: user.id,
        receiverId: userToSend,
        token: sessionStorage.getItem("token"),
      },
    });
    setSocket(socket);
    return () => {
      socket.disconnect();
    };
  }, [userToSend, isAuthenticated]);

  useEffect(() => {
    if (visibilityChange) {
      console.log("visibility status: ", visibilityChange);
      console.log("Получатель: ", userToSend);
      console.log("Получатель: ", isReceiver);
      if (userToSend) {
        if (socket) socket.emit("unReadMessagesCount", userToSend);
      }
    }
  }, [visibilityChange]);

  useEffect(() => {
    if (socket) {
      const allMessagesHandler = (data: any) => {
        const finalData = { ...data, createdAt: dateISO };
        setAllMessages((prevAllMessages) => [...prevAllMessages, finalData]);
        setMessages((prevMessages) => [
          ...prevMessages,
          { ...finalData, sender: finalData.sender.id },
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
      socket.on("unReadMessagesCount", (count: number) => {
        setUnReadMessagesCount({ count });
      });
      return () => {
        socket.off("unReadMessagesCount");
      };
    }
  }, [socket, messages, isReceiver]);

  useEffect(() => {
    if (socket) {
      socket.on("getOnlineUsers", (names: string[]) => setConectedUsers(names));
      return () => {
        socket.off("getOnlineUsers", (names: string[]) =>
          setConectedUsers(names),
        );
      };
    }
  }, [socket]);

  return (
    <socketContext.Provider
      value={{
        conectedUsers,
        socket,
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
        usersAndRooms,
        setUsersAndRooms,
      }}
    >
      {props.children}
    </socketContext.Provider>
  );
};

export default SocketProvider;
