import { FormEvent, useState } from "react";
import { getDateAndHours } from "../functions/getDateAndHours.ts";
import { useSocketContext } from "../contexts/SocketContext.tsx";
import { useUserContext } from "../contexts/UserContext.tsx";
import { SenderStringMessage } from "../interfaces/message.interfaces.ts";
import { RegisterData } from "../interfaces/user.interfaces.ts";

function MessagesContainer() {
  const { user, isMembers } = useUserContext();
  const {
    socket,
    userToSend,
    userToSendName,
    messages,
    setMessages,
    dateISO,
    allMessages,
    setAllMessages,
    scrollRef,
    roomMembers,
  } = useSocketContext();
  const [text, setText] = useState("");

  const textHandleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (text.trim()) {
      if (socket) socket.emit("message", text);
      const completeData = {
        sender: user.id,
        content: text,
        createdAt: dateISO,
        receiverId: userToSend,
      };
      if (!isMembers.members) setMessages([...messages, completeData]);
      setAllMessages([...allMessages, { ...completeData, sender: user }]);
      setText("");
    }
  };

  return (
      <div className="container">
        {roomMembers.length > 0 ? (
            <>
              <nav className="navbar-chat-with-members">{userToSend}</nav>
              <div className="container-members">
                {roomMembers.map((member: RegisterData, index: number) => (
                    <span key={index} className="sender-content">
                {member.id}
                      {roomMembers.length !== index + 1 ? ", " : ""}
              </span>
                ))}
              </div>
            </>
        ) : (
            <nav className="navbar-chat">{userToSendName}</nav>
        )}
        <div className="screen" ref={scrollRef}>
          {messages.map((message: SenderStringMessage, index: number) =>
              message.sender === user.id ? (
                  <div key={index} className="right">
                    <span className="sender">Вы<span className="hour">{getDateAndHours(message.createdAt)}</span></span>
                    <p className="content">{message.content}</p>
                  </div>
              ) : message.sender === userToSend || message.receiverId === userToSend ? (
                  <div key={index} className="left">
                    <span className="sender">
                      {userToSendName}
                      <span className="hour">{getDateAndHours(message.createdAt)}</span>
                    </span>
                    <p className="content">{message.content}</p>
                  </div>
              ) : (
                  ""
              )
          )}
        </div>
        <form className="chat-form" onSubmit={textHandleSubmit}>
          <input
              className="input-chat"
              id="input"
              value={text}
              type="text"
              onChange={(e) => setText(e.target.value)}
              autoFocus
              spellCheck
              autoComplete="off"
          />
          <button className="button-chat">Отправить</button>
        </form>
      </div>
  );
}

export default MessagesContainer;