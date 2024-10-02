import { useEffect, useState } from "react";
import { RegisterData } from "../interfaces/user.interfaces";
import { getAllUsersRequest } from "../api/users.api";
import { useSocketContext } from "../contexts/SocketContext";
import { getRoomsByUserRequest } from "../api/room.api";
import { useUserContext } from "../contexts/UserContext";

export const useGetAllUsers = (authName: number) => {
  const [users, setUsers] = useState<RegisterData[]>([]);
  const { socket } = useSocketContext();
  useEffect(() => {
    const getAllUsers = async () => {
      const data = await getAllUsersRequest();
      const finalData = data.filter((element: RegisterData) => element.id !== authName);
      setUsers([...finalData]);
    };
    getAllUsers();
  }, [socket]);
  return { users };
};

export const useGetAllUsersAndRooms = (authName: number) => {
  const { socket, usersAndRooms, setUsersAndRooms } = useSocketContext();
  const { user } = useUserContext();
  useEffect(() => {
    const getAllUsersAndRooms = async () => {
      if(user.id) {
        const userdata = await getAllUsersRequest();
        const roomsdata = await getRoomsByUserRequest(user.id);
        const finalData = userdata.filter((element: RegisterData) => element.id !== authName);
        setUsersAndRooms([...finalData, ...roomsdata]);
      }
    };
      getAllUsersAndRooms();

  }, [socket]);
  return { usersAndRooms };
};
