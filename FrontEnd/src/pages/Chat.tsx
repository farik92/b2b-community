import { useEffect } from "react";
import { useSocketContext } from "../contexts/SocketContext.tsx";
import ChatsPanel from "../components/ChatsPanel.tsx";
import MessagesContainer from "../components/MessagesContainer.tsx";

function Chat() {
  const { userToSend, messages, scrollRef } = useSocketContext();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, userToSend]);

  return (
    <>
      <div className="messenger-wraper">
        <div
          className={`chats-panel ${userToSend !== "none" ? "panel--active" : "panel--inactive"}`}
        >
          <ChatsPanel />
        </div>
        {userToSend !== "none" ? <MessagesContainer /> : <></>}
      </div>
    </>
  );
}

export default Chat;
