import { ChangeEvent, FormEvent, useCallback, useState } from "react";
import { getDateAndHours } from "../functions/getDateAndHours.ts";
import { useSocketContext } from "../contexts/SocketContext.tsx";
import { useUserContext } from "../contexts/UserContext.tsx";
import { SenderStringMessage } from "../interfaces/message.interfaces.ts";
import DOMPurify from "dompurify";
import * as React from "react";

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
    userToSendName,
    messages,
    setMessages,
    setAllMessages,
    scrollRef,
    dateISO,
    setDeleteMessages,
  } = useSocketContext();
  const [text, setText] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

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
      <nav className="navbar-chat">
        <div className="navbar-chat-user-info">
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="20" cy="20" r="20" fill="#E3EBF9" />
            <path
              d="M18.8496 21H20.8816L21.1496 19H19.1176L18.8496 21Z"
              fill="#BDCCE2"
            />
            <path
              d="M9.75584 27.9795C10.3249 28.6285 11.1479 29 12.0132 29L17.2085 29C18.7081 29 19.9972 27.8713 20.19 26.3758L20.3611 24.6398L18.3389 24.6398L18.2007 26.1219C18.1349 26.6204 17.7017 26.9966 17.2085 26.9966L12.0085 26.9966C11.7169 26.9966 11.4489 26.8743 11.256 26.658C11.0632 26.437 10.9786 26.1595 11.0162 25.8679L11.8584 19.0801C11.9242 18.5816 12.3475 18.2054 12.8507 18.2054L18.2112 18.2054L19.1987 18.2054L20.221 18.2054L21.3355 18.2054L23.4599 18.2054L23.3612 19.0425C23.3094 19.4893 23.8126 19.7291 24.1794 19.4234L26.4133 17.5846C26.6625 17.3777 26.7049 17.025 26.5026 16.8228L24.7062 14.984C24.4099 14.683 23.8503 14.9181 23.7938 15.3649L23.6951 16.202L21.7776 16.202L20.4749 16.202L19.4527 16.202L18.6485 16.202L12.846 16.202C11.3364 16.202 10.0572 17.3307 9.86441 18.8262L9.0222 25.6093C8.91874 26.4652 9.1821 27.3305 9.75584 27.9795Z"
              fill="#BDCCE2"
            />
            <path
              d="M30.2402 12.0205C29.6712 11.3715 28.8482 11 27.9829 11H22.7876C21.288 11 19.9989 12.1287 19.806 13.6242L19.635 15.3602H21.6572L21.7953 13.8781C21.8612 13.3796 22.2944 13.0034 22.7876 13.0034H27.9876C28.2792 13.0034 28.5472 13.1257 28.74 13.342C28.9329 13.563 29.0175 13.8405 28.9799 14.1321L28.1377 20.9199C28.0718 21.4184 27.6486 21.7946 27.1454 21.7946H21.7849H20.7973H19.7751H18.6606H16.5362L16.6349 20.9575C16.6867 20.5107 16.1835 20.2709 15.8166 20.5766L13.5828 22.4154C13.3335 22.6223 13.2912 22.975 13.4934 23.1772L15.2899 25.016C15.5862 25.317 16.1458 25.0819 16.2023 24.6351L16.301 23.798H18.2185H19.5212H20.5434H21.3476H27.1501C28.6597 23.798 29.9389 22.6693 30.1317 21.1738L30.9739 14.3907C31.0774 13.5348 30.814 12.6695 30.2402 12.0205Z"
              fill="#BDCCE2"
            />
          </svg>
          {userToSendName}
        </div>
        <div className="navbar-chat-user-actions">
          <div className="navbar-chat-user-actions-dropdown">
            <span
              className={
                isOpen ? "dropdown-toggle dropdown--active" : "dropdown-toggle"
              }
              onClick={toggleDropdown}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 16C12.5304 16 13.0391 16.2107 13.4142 16.5858C13.7893 16.9609 14 17.4696 14 18C14 18.5304 13.7893 19.0391 13.4142 19.4142C13.0391 19.7893 12.5304 20 12 20C11.4696 20 10.9609 19.7893 10.5858 19.4142C10.2107 19.0391 10 18.5304 10 18C10 17.4696 10.2107 16.9609 10.5858 16.5858C10.9609 16.2107 11.4696 16 12 16ZM12 10C12.5304 10 13.0391 10.2107 13.4142 10.5858C13.7893 10.9609 14 11.4696 14 12C14 12.5304 13.7893 13.0391 13.4142 13.4142C13.0391 13.7893 12.5304 14 12 14C11.4696 14 10.9609 13.7893 10.5858 13.4142C10.2107 13.0391 10 12.5304 10 12C10 11.4696 10.2107 10.9609 10.5858 10.5858C10.9609 10.2107 11.4696 10 12 10ZM12 4C12.5304 4 13.0391 4.21071 13.4142 4.58579C13.7893 4.96086 14 5.46957 14 6C14 6.53043 13.7893 7.03914 13.4142 7.41421C13.0391 7.78929 12.5304 8 12 8C11.4696 8 10.9609 7.78929 10.5858 7.41421C10.2107 7.03914 10 6.53043 10 6C10 5.46957 10.2107 4.96086 10.5858 4.58579C10.9609 4.21071 11.4696 4 12 4Z"
                  fill="#1E2B3E"
                />
              </svg>
            </span>
            {isOpen && (
              <div className="dropdown-menu">
                <a href="#" className="dropdown-item">
                  Settings
                </a>
                <a href="#" className="dropdown-item">
                  Logout
                </a>
              </div>
            )}
          </div>
          <div
            className="chat-user-remove"
            onClick={() => {
              setDeleteMessages(1);
            }}
          >
            <svg
              width="16"
              height="18"
              viewBox="0 0 16 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 0V1H0V3H1V16C1 16.5304 1.21071 17.0391 1.58579 17.4142C1.96086 17.7893 2.46957 18 3 18H13C13.5304 18 14.0391 17.7893 14.4142 17.4142C14.7893 17.0391 15 16.5304 15 16V3H16V1H11V0H5ZM3 3H13V16H3V3ZM5 5V14H7V5H5ZM9 5V14H11V5H9Z"
                fill="#1E2B3E"
              />
            </svg>
          </div>
          <div
            className="chat-user-close"
            onClick={() => {
              setUserToSend(0);
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z"
                fill="#1E2B3E"
              />
            </svg>
          </div>
        </div>
      </nav>
      <div className="screen" ref={scrollRef}>
        {messages.map(renderMessage)}
      </div>
      <form className="chat-form" onSubmit={textHandleSubmit}>
        <textarea
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
