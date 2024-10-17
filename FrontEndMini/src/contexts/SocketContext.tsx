import {
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { ChildrenType } from "../interfaces/user.interfaces";
import { Socket, io } from "socket.io-client";
import { useUserContext } from "./UserContext";
import { Message } from "../interfaces/message.interfaces";
import { useGetAllMessages } from "../hooks/messages.hooks";
import debounce from "lodash.debounce";

const socketContext = createContext<any>(undefined);

export function useSocketContext() {
  return useContext(socketContext);
}

const SocketProvider = (props: ChildrenType) => {
  const { user, isAuthenticated } = useUserContext();
  const [unReadMessagesCount, setUnReadMessagesCount] = useState<{
    count?: number;
  }>({});
  const [userToSend, setUserToSend] = useState<number>(0);
  const [userToSendName, setUserToSendName] = useState<string>("none");
  const { messages, setMessages } = useGetAllMessages(userToSend);
  const [socket, setSocket] = useState<Socket>();
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [panel, setPanel] = useState<string>("chats");
  const scrollRef = useRef<HTMLDivElement>(null);
  const dateISO = new Date().toISOString();
  const [text, setText] = useState("");

  useMemo(() => {
    if (isAuthenticated === true) {
      const socket = io(import.meta.env.VITE_SERVER_HOST, {
        autoConnect: true,
        auth: {
          userId: user.id,
          token: sessionStorage.getItem("token"),
        },
      });
      setSocket(socket);
    }
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
      socket.on("unReadMessagesCount", (count: number) => {
        setUnReadMessagesCount({ count });
      });
      return () => {
        socket.off("unReadMessagesCount");
      };
    }
  }, [messages]);

  return (
    <socketContext.Provider
      value={{
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
        text,
        setText,
      }}
    >
      {props.children}
    </socketContext.Provider>
  );
};

export default SocketProvider;
