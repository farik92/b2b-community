import {FormEvent, useState} from "react";
import { getDateAndHours } from "../functions/getDateAndHours.ts";
import { useSocketContext } from "../contexts/SocketContext.tsx";
import { useUserContext } from "../contexts/UserContext.tsx";
import { SenderStringMessage } from "../interfaces/message.interfaces.ts";

function MessagesContainer() {
  const { user, isReceiver } = useUserContext();
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
        isRead: false,
      };
      if (!isReceiver.members) setMessages([...messages, completeData]);
      setAllMessages([...allMessages, { ...completeData, sender: user }]);
      setText("");
    }
  };

  return (
      <div className="container">
        <nav className="navbar-chat">{userToSendName}</nav>
        <div className="screen" ref={scrollRef}>
          {messages.map((message: SenderStringMessage, index: number) =>
              message.sender === user.id ? (
                  <div key={index} className={`right message__${message.isRead ? 'read' : 'unread'}`}>
                    <span className="sender">Вы<span className="hour">{getDateAndHours(message.createdAt)}</span></span>
                    <p className="content">{message.content}</p>
                    <span className="message-status"></span>
                  </div>
              ) : message.sender === userToSend || message.receiverId === userToSend ? (
                  <div key={index} className={`left message__${message.isRead ? 'read' : 'unread'}`}>
                    <span className="sender">
                      {userToSendName}
                      <span className="hour">{getDateAndHours(message.createdAt)}</span>
                    </span>
                    <p className="content">{message.content}</p>
                    <span className="message-status"></span>
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