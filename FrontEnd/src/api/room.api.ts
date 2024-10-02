import { CreateRoom } from "../interfaces/room.interface.ts";
import axios from "./axios.ts";

export const getRoomByNameRequest = async (roomName: string) => {
  //Select Room By Name
  const request = await axios.get(`/rooms/getByName/${roomName}`, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  });
  return request.data;
}; //[USED]

export const getRoomsByUserRequest = async (id: number) => {
  //Select Room By User
  console.log(id);
  const request = await axios.get(`/rooms/getByUser/${id}`, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  });
  return request.data;
}; //[USED]

export const postRoomRequest = async (dataRoom: CreateRoom) => {
  //Create a room
  const request = await axios.post(`/rooms/post`, dataRoom, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  });
  return request.data;
};
