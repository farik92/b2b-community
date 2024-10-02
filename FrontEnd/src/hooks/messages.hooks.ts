import {useEffect, useState} from "react";
import {getMessagesReceiverRequest, markMessageAsRead} from "../api/messages.api";
import {Message} from "../interfaces/message.interfaces";

export const useGetAllMessages = (receiver: { id: number; members: number[] | undefined }) => {
    let finalReceiver;
    receiver && receiver.members
        ? (finalReceiver = {data: receiver.members, id: receiver.id})
        : (finalReceiver = {id: receiver.id});
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        // setMessages([]);
        console.log(receiver.id)
        if (receiver.id) {
            const getMessagesReceiver = async () => {
                const data = await getMessagesReceiverRequest(finalReceiver);
                if (data)
                    for (let i = 0; i < data.length; i++) {
                        data[i].sender = data[i].sender.id;
                        if ((data[i].sender === finalReceiver.id) && data[i].isRead === false) {
                            await markMessageAsRead(data[i].message_ID);
                        }
                    }
                setMessages((prevMessages) => [...prevMessages, ...data]);
            };
            getMessagesReceiver();
        }
    }, [receiver.id]);
    return {messages, setMessages};
};
