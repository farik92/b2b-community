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
  }, [messages]);

  return (
    <>
      <div className="messenger-wraper">
        <div
          className={`chats-panel ${userToSend !== 0 ? "panel--active" : "panel--inactive"}`}
        >
          <ChatsPanel />
        </div>
        {userToSend !== 0 ? <MessagesContainer /> : <></>}
      </div>
    </>
  );
}

export default Chat;
