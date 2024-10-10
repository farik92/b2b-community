import {
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
  useMemo,
} from "react";
import { ChildrenType, RegisterData } from "../interfaces/user.interfaces";
import { Socket, io } from "socket.io-client";
import { useUserContext } from "./UserContext";
import { Message } from "../interfaces/message.interfaces";
import { useGetAllMessages } from "../hooks/messages.hooks";
import { getAllMessagesRequest } from "../api/messages.api";
//import { useVisibilityChange } from "../hooks/useVisibilityState.hooks";

const socketContext = createContext<any>(undefined);

export function useSocketContext() {
  return useContext(socketContext);
}

const SocketProvider = (props: ChildrenType) => {
  const { user, isAuthenticated, isReceiver, setIsReceiver } = useUserContext();
  const [unReadMessagesCount, setUnReadMessagesCount] = useState<{
    count?: number;
  }>({});
  const [userToSend, setUserToSend] = useState("none");
  const [userToSendName, setUserToSendName] = useState("none");
  const { messages, setMessages } = useGetAllMessages(isReceiver);
  //const visibilityChange = useVisibilityChange();
  const [conectedUsers, setConectedUsers] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket>();
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [panel, setPanel] = useState("chats");
  const scrollRef = useRef<HTMLDivElement>(null);
  const dateISO = new Date().toISOString();
  const [users, setUsers] = useState<RegisterData[]>([]);
  const [deleteMessages, setDeleteMessages] = useState<number>(0);

  useEffect(() => {
    const getMessagesReceiver = async () => {
      const data = await getAllMessagesRequest();
      setAllMessages(data);
    };
    getMessagesReceiver();
  }, [messages]);

  useMemo(() => {
    const socket = io(import.meta.env.VITE_SERVER_HOST, {
      autoConnect: true,
      auth: {
        userId: user.id,
        token: sessionStorage.getItem("token"),
      },
    });
    setSocket(socket);
  }, [isAuthenticated]);

  /*useEffect(() => {
    if (visibilityChange) {
      if (userToSend && visibilityChange) {
        if (socket) {
          socket.emit("markMessageAsRead", {
            userId: user.id,
            receiverId: userToSend,
          });

          socket.emit("unReadMessagesCount", userToSend);
        }
      }
    }
  }, [visibilityChange]);*/

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
      console.log("removeChat");
      socket.on("removeChat", (payload: { receiverId: number }) => {
        if (payload.receiverId === isReceiver) {
          setUserToSend("none");
          setIsReceiver(0);
        }
      });
      return () => {
        socket.off("removeChat");
      };
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      if (user.id && userToSend !== "none") {
        socket.emit("markMessageAsRead", {
          userId: user.id,
          receiverId: userToSend,
        });
      }
      socket.on("unReadMessagesCount", (count: number) => {
        setUnReadMessagesCount({ count });
      });
      return () => {
        socket.off("markMessageAsRead");
        socket.off("unReadMessagesCount");
      };
    }
  }, [userToSend]);

  useEffect(() => {
    if (socket) {
      socket.on("unReadMessagesCount", (count: number) => {
        setUnReadMessagesCount({ count });
      });
      return () => {
        socket.off("unReadMessagesCount");
      };
    }
  }, [messages]);

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

  useEffect(() => {
    if (userToSend && user.id && deleteMessages === 1 && isReceiver) {
      if (socket) {
        socket.emit("removeChat", {
          receiverId: isReceiver,
          userId: user.id,
        });
        setDeleteMessages(0);
        setUserToSend("none");
        setIsReceiver(0);
        return () => {
          socket.off("removeChat");
        };
      }
    }
  }, [deleteMessages, userToSend]);

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
        users,
        setUsers,
        deleteMessages,
        setDeleteMessages,
      }}
    >
      {props.children}
    </socketContext.Provider>
  );
};

export default SocketProvider;
