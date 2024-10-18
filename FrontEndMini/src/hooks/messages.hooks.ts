import { useEffect, useState } from "react";
import { getMessagesReceiverRequest } from "../api/messages.api";
import { Message } from "../interfaces/message.interfaces";

export const useGetAllMessages = (receiver: number) => {
  const finalReceiver = { id: receiver };
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    setMessages([]);
    if (receiver) {
      const getMessagesReceiver = async () => {
        const data = await getMessagesReceiverRequest(finalReceiver);
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
