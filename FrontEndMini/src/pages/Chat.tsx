import { useEffect } from "react";
import { useSocketContext } from "../contexts/SocketContext.tsx";
import MessagesContainer from "../components/MessagesContainer.tsx";

function Chat() {
  const { messages, scrollRef } = useSocketContext();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <div className="messenger-wraper">
        <MessagesContainer />
      </div>
    </>
  );
}

export default Chat;
