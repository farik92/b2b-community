import { ChangeEvent, FormEvent, useState } from "react";
import { getDateAndHours } from "../functions/getDateAndHours.ts";
import { useSocketContext } from "../contexts/SocketContext.tsx";
import { useUserContext } from "../contexts/UserContext.tsx";
import { SenderStringMessage } from "../interfaces/message.interfaces.ts";
import * as React from "react";
import { useAppContext } from "../contexts/AppContext.tsx";

const MessagesContainer = () => {
  const { user } = useUserContext();
  const appData = useAppContext();
  const {
    socket,
    userToSend,
    messages,
    setMessages,
    setAllMessages,
    scrollRef,
    dateISO,
  } = useSocketContext();
  const [text, setText] = useState("");

  const textHandleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (text.trim()) {
      const completeData = {
        sender: user.id,
        content: text,
        createdAt: dateISO,
        receiverId: userToSend,
        isRead: false,
      };
      if (socket) socket.emit("message", completeData);
      setMessages((prev: never) => [...prev, completeData]);
      setAllMessages((prev: never) => [
        ...prev,
        { ...completeData, sender: user },
      ]);
      setText("");
    }
  };
  const onEnterPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (text.trim()) {
        const completeData = {
          sender: user.id,
          content: text,
          createdAt: dateISO,
          receiverId: userToSend,
          isRead: false,
        };
        if (socket) socket.emit("message", completeData);
        setMessages((prev: never) => [...prev, completeData]);
        setAllMessages((prev: never) => [
          ...prev,
          { ...completeData, sender: user },
        ]);
        setText("");
      }
    }
  };

  console.log(window.location.href);
  const priceReqBtn = document.getElementById(appData.data.requestPriceBtn);
  priceReqBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    setText("Test 999");
    console.log(e);
  });

  return (
    <div className="container">
      <div className="screen" ref={scrollRef}>
        {messages.map((message: SenderStringMessage, index: number) =>
          message.sender === user.id ? (
            <div
              key={index}
              className={`message-right message__${message.isRead ? "read" : "unread"}`}
            >
              <p className="message-content">{message.content}</p>
              <span className="message-hour">
                {getDateAndHours(message.createdAt)}
              </span>
              {message.isRead ? (
                <span className="message-read">
                  <svg
                    width="24"
                    height="14"
                    viewBox="0 0 24 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0.410156 8.41008L6.00016 14.0001L7.41016 12.5801L1.83016 7.00008L0.410156 8.41008ZM22.2402 0.580078L11.6602 11.1701L7.50016 7.00008L6.07016 8.41008L11.6602 14.0001L23.6602 2.00008L22.2402 0.580078ZM18.0002 2.00008L16.5902 0.580078L10.2402 6.93008L11.6602 8.34008L18.0002 2.00008Z"
                      fill="#00B066"
                    />
                  </svg>
                </span>
              ) : (
                ""
              )}
            </div>
          ) : message.sender === userToSend ||
            message.receiverId === userToSend ? (
            <div
              key={index}
              className={`message-left message__${message.isRead ? "read" : "unread"}`}
            >
              <p className="message-content">{message.content}</p>
              <span className="message-hour">
                {getDateAndHours(message.createdAt)}
              </span>
            </div>
          ) : (
            ""
          ),
        )}
      </div>
      <form className="chat-form" onSubmit={textHandleSubmit}>
        <textarea
          id="chatTextArea"
          className="input-chat"
          value={text}
          rows={4}
          onKeyDown={onEnterPress}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setText(e.target.value)
          }
          placeholder="Написать сообщение"
        />
        <button className="btn btn-primary">Отправить</button>
      </form>
    </div>
  );
};

export default MessagesContainer;
