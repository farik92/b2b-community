import axios from "./axios.ts";

export const getAllUsersRequest = async () => {
  //Select all users
  const request = await axios.get("http://localhost:3000/users/getAll", {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  });
  return request.data;
}; //[USED 2]

export const getUserIdRequest = async (id: number) => {
  //Select the user that matches the id sent by parameter
  const request = await axios.get(`/users/get/${id}`, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  });
  return request.data;
}; //[USED]
