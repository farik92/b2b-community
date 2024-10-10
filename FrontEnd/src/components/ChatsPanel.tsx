import { useGetAllUsers } from "../hooks/users.hooks";
import { useSocketContext } from "../contexts/SocketContext";
import { useUserContext } from "../contexts/UserContext";
import { getDateAndHours } from "../functions/getDateAndHours";
import { Message } from "../interfaces/message.interfaces";
import { Users } from "../interfaces/user.interfaces";
import UserSearch from "../components/UserSearch";

// import {useEffect, useMemo} from "react";

function ChatsPanel() {
  const { user, setIsReceiver } = useUserContext();
  const {
    conectedUsers,
    userToSend,
    setUserToSend,
    setUserToSendName,
    allMessages,
  } = useSocketContext();
  const { users } = useGetAllUsers(user.id);
  const { setDeleteMessages } = useSocketContext();

  const getLastMessage = (sender: number, receiverId: number) => {
    if (!allMessages) return [undefined, undefined, undefined];
    const lastMessage = allMessages
      .slice()
      .reverse()
      .find(
        (message: Message) =>
          (message.sender.id === sender && message.receiverId === receiverId) ||
          (message.sender.id === receiverId && message.receiverId === sender),
      );
    const messageCount = allMessages.filter(
      (message: Message) =>
        message.sender.id === receiverId &&
        message.receiverId === sender &&
        !message.isRead,
    ).length;
    if (!lastMessage)
      return [
        { sender: { id: undefined }, content: undefined, createdAt: undefined },
      ];
    const {
      content,
      sender: resultSender,
      createdAt: resultCreatedAt,
    } = lastMessage;
    return [content, resultSender, resultCreatedAt, messageCount];
  };
  const sortedUsers = users
    .slice()
    .sort((a: { id: number }, b: { id: number }) => {
      const [, , aLastMessageCreatedAt] = getLastMessage(user.id, a.id);
      const [, , bLastMessageCreatedAt] = getLastMessage(user.id, b.id);

      if (aLastMessageCreatedAt && !bLastMessageCreatedAt) return -1;
      if (!aLastMessageCreatedAt && bLastMessageCreatedAt) return 1;

      if (aLastMessageCreatedAt && bLastMessageCreatedAt) {
        return (
          new Date(bLastMessageCreatedAt).getTime() -
          new Date(aLastMessageCreatedAt).getTime()
        );
      }

      const aIsOnline = conectedUsers.includes(a.id);
      const bIsOnline = conectedUsers.includes(b.id);
      if (aIsOnline && !bIsOnline) return -1;
      if (!aIsOnline && bIsOnline) return 1;

      return 0;
    });

  //const usersToSearch = users.filter();

  return (
    <>
      <UserSearch users={users} />
      <div className="chats">
        {sortedUsers.map((sortedUser: Users, index: number) => {
          const [
            lastMessageContent,
            lastMessageSender,
            lastMessageCreatedAt,
            messageCount,
          ] = getLastMessage(user.id, sortedUser.id);
          return (
            <div
              key={index}
              className={`sender-chat user-chat-id-${sortedUser.id} ${userToSend === sortedUser.id ? "selected" : ""} ${lastMessageSender ? "" : "empty-chat"}`}
              onClick={() => {
                setIsReceiver(sortedUser.id);
                setUserToSend(sortedUser.id);
                setUserToSendName(sortedUser.name);
              }}
            >
              <div className="container-image-and-online">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="20" cy="20" r="20" fill="#E3EBF9" />
                  <path
                    d="M20 12C21.0609 12 22.0783 12.4214 22.8284 13.1716C23.5786 13.9217 24 14.9391 24 16C24 17.0609 23.5786 18.0783 22.8284 18.8284C22.0783 19.5786 21.0609 20 20 20C18.9391 20 17.9217 19.5786 17.1716 18.8284C16.4214 18.0783 16 17.0609 16 16C16 14.9391 16.4214 13.9217 17.1716 13.1716C17.9217 12.4214 18.9391 12 20 12ZM20 14C19.4696 14 18.9609 14.2107 18.5858 14.5858C18.2107 14.9609 18 15.4696 18 16C18 16.5304 18.2107 17.0391 18.5858 17.4142C18.9609 17.7893 19.4696 18 20 18C20.5304 18 21.0391 17.7893 21.4142 17.4142C21.7893 17.0391 22 16.5304 22 16C22 15.4696 21.7893 14.9609 21.4142 14.5858C21.0391 14.2107 20.5304 14 20 14ZM20 21C22.67 21 28 22.33 28 25V28H12V25C12 22.33 17.33 21 20 21ZM20 22.9C17.03 22.9 13.9 24.36 13.9 25V26.1H26.1V25C26.1 24.36 22.97 22.9 20 22.9Z"
                    fill="#BDCCE2"
                  />
                </svg>
                <div
                  className={
                    conectedUsers.includes(sortedUser.id) ? "online" : "offline"
                  }
                ></div>
              </div>
              {lastMessageSender ? (
                <>
                  <div className="container-user-chat-content">
                    <span className="sender-chat-name">{sortedUser.name}</span>
                    <p className="sender-content">
                      {lastMessageSender.id === user.id
                        ? "Вы"
                        : lastMessageSender.name}
                      :{" "}
                      {lastMessageContent &&
                        (lastMessageContent.length <= 32
                          ? lastMessageContent
                          : `${lastMessageContent.substring(0, 32)}...`)}
                    </p>
                  </div>
                  <div className="sender-chat-meta">
                    <span className="last-message-hour">
                      {getDateAndHours(lastMessageCreatedAt)}
                    </span>
                    <span className="container-message-count">
                      {messageCount ? "+" + messageCount : ""}
                    </span>
                    <span
                      className="remove-chat"
                      onClick={() => {
                        setDeleteMessages(1);
                      }}
                    >
                      X
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="container-user-chat-none-content">
                    <span className="sender-chat-span">{sortedUser.name}</span>
                    <p className="sender-none-content"></p>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default ChatsPanel;
