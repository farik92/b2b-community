import axios from "./axios.ts";

export const getImageRequest = async (id: number) => {
  const request = await axios.get(`/images/get/${id}`, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  });
  return request.data;
};

export const putImageRequest = async (id: number, file: File) => {
  const formData = new FormData();
  formData.append("image", file);
  const request = await axios.put(`/images/put/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  });
  return request.data;
}; //[USED]

export const putRoomImageRequest = async (roomName: string, file: File) => {
  const formData = new FormData();
  formData.append("image", file);
  const request = await axios.put(`/images/room/put/${roomName}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  });
  return request.data;
}; //[USED]

export const deleteImageRequest = async (id: number) => {
  const request = await axios.delete(`/images/delete/${id}`, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  });
  return request.data;
}; //[USED]
