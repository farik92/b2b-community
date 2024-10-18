import { ChangeEvent, FormEvent, useCallback, useEffect } from "react";
import { getDateAndHours } from "../functions/getDateAndHours.ts";
import { useSocketContext } from "../contexts/SocketContext.tsx";
import { useUserContext } from "../contexts/UserContext.tsx";
import { SenderStringMessage } from "../interfaces/message.interfaces.ts";
import * as React from "react";
import DOMPurify from "dompurify";

const linkify = (text: string) => {
  const urlPattern = /https?:\/\/[^\s]+/g; // Регулярное выражение для поиска ссылок
  return text.replace(
    urlPattern,
    (url) =>
      `<a href="${url}" target="_blank" rel="noopener noreferrer">по ссылке</a>`,
  );
};

const MessagesContainer = () => {
  const { user } = useUserContext();
  const {
    socket,
    userToSend,
    setUserToSend,
    messages,
    setMessages,
    setAllMessages,
    scrollRef,
    dateISO,
    text,
    setText,
  } = useSocketContext();

  const sendMessage = useCallback(() => {
    if (!text.trim()) return;

    const completeData = {
      sender: user.id,
      content: text,
      createdAt: dateISO,
      receiverId: userToSend,
      isRead: false,
    };

    if (socket) socket.emit("message", completeData);
    setMessages((prev: SenderStringMessage[]) => [...prev, completeData]);
    setAllMessages((prev: SenderStringMessage[]) => [
      ...prev,
      { ...completeData, sender: user },
    ]);
    setText("");
  }, [text, socket, user.id, dateISO, userToSend, setMessages, setAllMessages]);

  const textHandleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMessage();
  };
  const onEnterPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleCustomEvent = useCallback((event: Event) => {
    if (
      event instanceof CustomEvent &&
      typeof event.detail.content === "string"
    ) {
      setText(event.detail.content);
    }

    if (
      event instanceof CustomEvent &&
      typeof event.detail.vendorId === "number"
    ) {
      setUserToSend(event.detail.vendorId);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("myButtonClicked", handleCustomEvent);

    return () => {
      document.removeEventListener("myButtonClicked", handleCustomEvent);
    };
  }, [handleCustomEvent]);

  const sanitizeHtml = (html: string) => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ["a", "span"],
      ALLOWED_ATTR: ["target", "href", "rel", "title"],
    });
  };

  const renderMessage = (message: SenderStringMessage, index: number) => {
    const isSender = message.sender === user.id;
    const isReceiver =
      message.sender === userToSend || message.receiverId === userToSend;

    if (!isSender && !isReceiver) return null;

    return (
      <div
        key={index}
        className={`message-${isSender ? "right" : "left"} message__${
          message.isRead ? "read" : "unread"
        }`}
      >
        <p
          className="message-content"
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(linkify(message.content)),
          }}
        />
        {message.source ? (
          <span
            className="message-source"
            data-tooltip-id={`message-${index}-source`}
            data-tooltip-content={
              message.source === "market" ? "Источник: B2B Рынок" : ""
            }
            hidden={true}
          >
            {message.source}
          </span>
        ) : (
          ""
        )}
        <span className="message-hour">
          {getDateAndHours(message.createdAt)}
        </span>
        {isSender && message.isRead && (
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
        )}
      </div>
    );
  };

  return (
    <div className="container">
      <div className="screen" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="empty-screen">
            <svg
              width="106"
              height="106"
              viewBox="0 0 106 106"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M93.8333 70.5H70.5C70.5 75.1413 68.6563 79.5925 65.3744 82.8744C62.0925 86.1563 57.6413 88 53 88C48.3587 88 43.9075 86.1563 40.6256 82.8744C37.3437 79.5925 35.5 75.1413 35.5 70.5H12.1667V12.1667H93.8333V70.5ZM93.8333 0.5H12.1667C5.69167 0.5 0.5 5.75 0.5 12.1667V93.8333C0.5 96.9275 1.72916 99.895 3.91709 102.083C6.10501 104.271 9.07247 105.5 12.1667 105.5H93.8333C96.9275 105.5 99.895 104.271 102.083 102.083C104.271 99.895 105.5 96.9275 105.5 93.8333V12.1667C105.5 9.07247 104.271 6.10501 102.083 3.91709C99.895 1.72916 96.9275 0.5 93.8333 0.5Z"
                fill="#D7E2F2"
              />
            </svg>
            <p>Здесь пока ничего нет</p>
          </div>
        ) : (
          messages.map(renderMessage)
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
        <button className="btn btn-primary" disabled={!text.trim()}>
          Отправить
        </button>
      </form>
    </div>
  );
};

export default MessagesContainer;
