import { Message } from "../interfaces/message.interfaces.ts";
import axios from "./axios.ts";

export const getAllMessagesRequest = async () => {
  //Select all messages
  const request = await axios.get("/messages/getAll", {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  });
  return request.data;
}; //[USED]

export const getMessagesReceiverRequest = async (finalReceiver: object) => {
  //Select all messages from a sender and receiverObject
  const request = await axios.post("/messages/getByReceiver", finalReceiver, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  });
  return request.data;
}; //[USED]

export const postMessagesRequest = async (newData: Message) => {
  //Create a message
  const request = await axios.post("/messages/post", newData, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  });
  return request.data;
};

export const markMessageAsRead = async (id: number, senderId: number) => {
  const token = sessionStorage.getItem("token");
  //Create a message
  const request = await axios.post(
    `/messages/read/`,
    { id: id, senderId: senderId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return request.data;
};
