import { useEffect, useState } from "react";
import {
  getMessagesReceiverRequest,
  //markMessageAsRead,
} from "../api/messages.api";
import { Message } from "../interfaces/message.interfaces";
//import { useUserContext } from "../contexts/UserContext.tsx";

export const useGetAllMessages = (receiver: number) => {
  //const { isReceiver } = useUserContext();
  const finalReceiver = { id: receiver };
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    setMessages([]);
    if (receiver) {
      const getMessagesReceiver = async () => {
        const data = await getMessagesReceiverRequest(finalReceiver);
        //await markMessageAsRead(finalReceiver.id, user.id);
        if (data)
          for (let i = 0; i < data.length; i++) {
            data[i].sender = data[i].sender.id;
            if (
              data[i].sender === finalReceiver.id &&
              data[i].isRead === false
            ) {
              data[i].isRead = true;
            }
          }
        setMessages((prevMessages) => [...prevMessages, ...data]);
      };
      getMessagesReceiver();
    }
  }, [receiver]);
  return { messages, setMessages };
};
