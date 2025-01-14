import { useEffect, useState } from "react";
import { RegisterData } from "../interfaces/user.interfaces";
import { getAllUsersRequest } from "../api/users.api";
import { useSocketContext } from "../contexts/SocketContext";

export const useGetAllUsers = (authName: number) => {
  const [users, setUsers] = useState<RegisterData[]>([]);
  const { socket } = useSocketContext();
  useEffect(() => {
    const getAllUsers = async () => {
      const data = await getAllUsersRequest();
      const finalData = data.filter(
        (element: RegisterData) => element.id !== authName,
      );
      setUsers([...finalData]);
    };
    getAllUsers();
  }, [socket]);
  return { users };
};
