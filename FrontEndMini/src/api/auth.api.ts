import axios from "./axios.ts";

export const verifyTokenUserRequest = async () => {
  const token = sessionStorage.getItem("token");
  if (!token) return;
  try {
    const request = await axios.get("/auth/verify", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return request.data;
  } catch (error) {
    console.error("Error verifying token:", error);
    throw error;
  }
};
