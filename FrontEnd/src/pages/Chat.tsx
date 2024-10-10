import { useEffect } from "react";
import { useSocketContext } from "../contexts/SocketContext.tsx";
import ChatsPanel from "../components/ChatsPanel.tsx";
import MessagesContainer from "../components/MessagesContainer.tsx";

function Chat() {
  const { userToSend, messages, scrollRef, unReadMessagesCount } =
    useSocketContext();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <div className="messenger-wraper-head">
        <h2>Сообщения</h2>
        <span>{unReadMessagesCount.count} непрочитанных</span>
      </div>
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
