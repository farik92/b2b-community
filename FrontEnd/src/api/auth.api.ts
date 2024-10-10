import axios from "./axios.ts";

export const verifyTokenUserRequest = async () => {
  //Check if the UserToken exists/matches to enter the user account
  const request = await axios.get("/auth/verify", {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  });
  return request.data;
}; //[USED]
