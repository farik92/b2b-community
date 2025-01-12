import { Message } from "../interfaces/message.interfaces.ts";
import axios from "./axios.ts";

export const getAllMessagesRequest = async () => {
  const request = await axios.get("/messages/getAll", {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  });
  return request.data;
};

export const getMessagesReceiverRequest = async (finalReceiver: object) => {
  const request = await axios.post("/messages/getByReceiver", finalReceiver, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  });
  return request.data;
};

export const postMessagesRequest = async (newData: Message) => {
  const request = await axios.post("/messages/post", newData, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  });
  return request.data;
};

export const markMessageAsRead = async (id: number, senderId: number) => {
  const token = sessionStorage.getItem("token");
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

export const deleteMessagesByParticipantsRequest = async (
  receiverId: number,
  senderId: number,
) => {
  const token = sessionStorage.getItem("token");
  const request = await axios.delete(`/messages/${receiverId}/${senderId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return request.data;
};
