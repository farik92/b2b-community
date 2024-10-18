import useDebounce from "./useDebounce";
import { useSocketContext } from "../contexts/SocketContext.tsx";

const useMarkMessageAsRead = (user: number, userToSend: number) => {
  const { socket } = useSocketContext();
  const debouncedMarkMessageAsRead = useDebounce(
    () => {
      socket.emit("markMessageAsRead", {
        userId: user,
        receiverId: userToSend,
      });
    },
    500, // задержка в 500 миллисекунд
  );

  return debouncedMarkMessageAsRead;
};

export default useMarkMessageAsRead;
