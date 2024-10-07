import { useEffect } from "react";
import { useUserContext } from "../contexts/UserContext.tsx";
import { useSocketContext } from "../contexts/SocketContext.tsx";
import ChatsPanel from "../components/ChatsPanel.tsx";
import MessagesContainer from "../components/MessagesContainer.tsx";

function Chat() {
  const { user } = useUserContext();
  const { userToSend, messages, scrollRef, unReadMessagesCount } =
    useSocketContext();

  useEffect(() => {
    if (scrollRef.current) {
      console.log("unReadMessagesCount: ", unReadMessagesCount);
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <div className="chats-panel">
        <ChatsPanel />
      </div>
      {userToSend !== "none" ? (
        <MessagesContainer />
      ) : (
        <div className="container-none">
          <div>
            <h2>Добро пожаловать, {user.name}!</h2>
            <h2>Выберите чат, чтобы начать общение</h2>
          </div>
        </div>
      )}
    </>
  );
}

export default Chat;
