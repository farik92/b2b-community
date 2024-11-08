import {
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { ChildrenType, RegisterData } from "../interfaces/user.interfaces";
import { Socket, io } from "socket.io-client";
import { useUserContext } from "./UserContext";
import { Message } from "../interfaces/message.interfaces";
import { useGetAllMessages } from "../hooks/messages.hooks";
import { getAllMessagesRequest } from "../api/messages.api";
import debounce from "lodash.debounce";
//import { useVisibilityChange } from "../hooks/useVisibilityState.hooks";

const socketContext = createContext<any>(undefined);

export function useSocketContext() {
  return useContext(socketContext);
}

const SocketProvider = (props: ChildrenType) => {
  const { user, isAuthenticated } = useUserContext();
  const [unReadMessagesCount, setUnReadMessagesCount] = useState<{
    count?: number;
  }>({});
  const [messagesAsRead, setMessagesAsRead] = useState<number>(0);
  const [userToSend, setUserToSend] = useState<number>(0);
  const [userToSendName, setUserToSendName] = useState<string>("none");
  const { messages, setMessages } = useGetAllMessages(userToSend);
  //const visibilityChange = useVisibilityChange();
  const [conectedUsers, setConectedUsers] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket>();
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [panel, setPanel] = useState<string>("chats");
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
  }, [userToSend]);

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

  const verify = useCallback(
    debounce((socket, userId, receiverId) => {
      socket.emit("markMessageAsRead", {
        userId: userId,
        receiverId: receiverId,
      });
      socket.on("unReadMessagesCount", (count: number) => {
        setUnReadMessagesCount({ count });
      });
    }, 500),
    [],
  );

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
        if (data.sender.id === userToSend) {
          verify(socket, data.receiverId, userToSend);
          data.isRead = true;
        }
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
  }, [socket, userToSend]);

  useEffect(() => {
    if (socket) {
      socket.on("removeChat", (payload: { receiverId: number }) => {
        if (payload.receiverId === userToSend) {
          setUserToSend(0);
        }
      });
      return () => {
        socket.off("removeChat");
      };
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      if (user.id && userToSend !== 0) {
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
      if (user.id) {
        socket.emit("markAllMessagesAsRead", {
          userId: user.id,
        });
      }
      socket.on("unReadMessagesCount", (count: number) => {
        setUnReadMessagesCount({ count });
      });
      return () => {
        socket.off("markMessageAsRead");
        socket.off("unReadMessagesCount");
        setMessagesAsRead(0);
      };
    }
  }, [messagesAsRead]);

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
    if (userToSend && user.id && deleteMessages === 1) {
      if (socket) {
        socket.emit("removeChat", {
          receiverId: userToSend,
          userId: user.id,
        });
        setDeleteMessages(0);
        setUserToSend(0);
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
