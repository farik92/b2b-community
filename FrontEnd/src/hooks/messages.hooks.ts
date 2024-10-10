import { useEffect, useState } from "react";
import {
  deleteMessagesByParticipantsRequest,
  getMessagesReceiverRequest,
  //markMessageAsRead,
} from "../api/messages.api";
import { Message } from "../interfaces/message.interfaces";
//import { useUserContext } from "../contexts/UserContext.tsx";

export const useGetAllMessages = (receiver: number) => {
  //const { user } = useUserContext();
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

export const useDeleteMessagesByParticipants = (
  receiverId: number,
  senderId: number,
) => {
  const [receiver, setReceiver] = useState(0);
  const [sender, setSender] = useState(0);

  useEffect(() => {
    if (receiverId && senderId) {
      deleteMessagesByParticipantsRequest(receiverId, senderId);
    }
  }, [receiverId, senderId]);
  return { receiver, setReceiver, sender, setSender };
};
