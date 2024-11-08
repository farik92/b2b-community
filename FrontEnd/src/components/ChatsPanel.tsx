import { useGetAllUsers } from "../hooks/users.hooks";
import { useSocketContext } from "../contexts/SocketContext";
import { useUserContext } from "../contexts/UserContext";
import { Message } from "../interfaces/message.interfaces";
import { Users } from "../interfaces/user.interfaces";
import UserSearch from "../components/UserSearch";
import { useMemo } from "react";

function ChatsPanel() {
  const { user } = useUserContext();
  const {
    conectedUsers,
    userToSend,
    setUserToSend,
    setUserToSendName,
    allMessages,
    unReadMessagesCount,
    setMessagesAsRead,
  } = useSocketContext();
  const { users } = useGetAllUsers(user.id);

  const userMessagesData = useMemo(() => {
    return users
      .map((sortedUser: Users) => {
        const lastMessage = allMessages
          .slice()
          .reverse()
          .find(
            (message: Message) =>
              (message.sender.id === user.id &&
                message.receiverId === sortedUser.id) ||
              (message.sender.id === sortedUser.id &&
                message.receiverId === user.id),
          );

        if (!lastMessage) return null;

        const messageCount = allMessages.filter(
          (message: Message) =>
            message.sender.id === sortedUser.id &&
            message.receiverId === user.id &&
            !message.isRead,
        ).length;

        return {
          user: sortedUser,
          lastMessage,
          messageCount,
          lastMessageDate: lastMessage
            ? new Date(lastMessage.createdAt).getTime()
            : 0,
          isOnline: conectedUsers.includes(sortedUser.id),
        };
      })
      .filter((userData) => userData !== null);
  }, [allMessages, users, conectedUsers, user.id]);

  const sortedUsers = useMemo(() => {
    return userMessagesData.sort((a, b) => {
      console.log(unReadMessagesCount);
      // Сортировка по последнему сообщению и онлайн статусу
      if (a.lastMessageDate && !b.lastMessageDate) return -1;
      if (!a.lastMessageDate && b.lastMessageDate) return 1;
      if (a.lastMessageDate && b.lastMessageDate) {
        return b.lastMessageDate - a.lastMessageDate;
      }
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
      return 0;
    });
  }, [userMessagesData]);

  return (
    <>
      <UserSearch users={users} />
      {userToSend === 0 && unReadMessagesCount.count ? (
        <div
          onClick={() => {
            setMessagesAsRead(1);
          }}
        >
          Отметить все как прочитанные
        </div>
      ) : (
        ""
      )}
      <div className="chats">
        {sortedUsers.map(({ user: sortedUser, messageCount }, index) => (
          <div
            key={index}
            className={`sender-chat user-chat-id-${sortedUser.id} ${userToSend === sortedUser.id ? "selected" : ""}`}
            onClick={() => {
              setUserToSend(sortedUser.id);
              setUserToSendName(sortedUser.name);
            }}
          >
            <div className="container-image-and-online">
              <div
                className={
                  conectedUsers.includes(sortedUser.id) ? "online" : "offline"
                }
              ></div>
            </div>
            <div className="container-user-chat-content">
              <span className="sender-chat-name">{sortedUser.name}</span>
            </div>
            <div className="sender-chat-meta">
              {messageCount ? (
                <>
                  <span className="container-message-count">
                    {messageCount}
                  </span>
                </>
              ) : (
                ""
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default ChatsPanel;
