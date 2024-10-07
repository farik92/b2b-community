import { useGetAllUsersAndRooms } from "../hooks/users.hooks";
import { useSocketContext } from "../contexts/SocketContext";
import { useUserContext } from "../contexts/UserContext";
import { getDateAndHours } from "../functions/getDateAndHours";
import { Message } from "../interfaces/message.interfaces";
import { UsersAndRooms } from "../interfaces/user.interfaces";
import UserSearch from "../components/UserSearch";
import { useEffect, useState } from "react";
import { deleteMessagesByParticipantsRequest } from "../api/messages.api";

// import {useEffect, useMemo} from "react";

function ChatsPanel() {
  console.log("App rendered");
  const { user, setIsReceiver } = useUserContext();
  const {
    conectedUsers,
    userToSend,
    setUserToSend,
    setUserToSendName,
    allMessages,
  } = useSocketContext();
  const { usersAndRooms } = useGetAllUsersAndRooms(user.id);
  const [deleteMessages, setDeleteMessages] = useState<number>(0);

  useEffect(() => {
    if (userToSend && user.id && deleteMessages === 1) {
      const del = deleteMessagesByParticipantsRequest(userToSend, user.id);
      console.log(del);
      setDeleteMessages(0);
      setUserToSend("none");
    }
  }, [deleteMessages]);

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
  const sortedUsersAndRooms = usersAndRooms
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

  //const usersToSearch = usersAndRooms.filter();

  return (
    <>
      <UserSearch users={usersAndRooms} />
      <div className="chats">
        {sortedUsersAndRooms.map((userOrRoom: UsersAndRooms, index: number) => {
          const [
            lastMessageContent,
            lastMessageSender,
            lastMessageCreatedAt,
            messageCount,
          ] = getLastMessage(user.id, userOrRoom.id);
          return (
            <div
              key={index}
              className={`sender-chat user-chat-id-${userOrRoom.id} ${userToSend === userOrRoom.id ? "selected" : ""} ${lastMessageSender ? "" : "empty-chat"}`}
              onClick={() => {
                setIsReceiver({ id: userOrRoom.id });
                setUserToSend(userOrRoom.id);
                setUserToSendName(userOrRoom.name);
              }}
            >
              <div className="container-image-and-online">
                <div
                  className={
                    conectedUsers.includes(userOrRoom.id) ? "online" : "offline"
                  }
                ></div>
              </div>
              <div className="container-message-count">
                {messageCount ? "+" + messageCount : ""}
              </div>
              {lastMessageSender ? (
                <div className="container-user-chat-content">
                  <span className="sender-chat-span">{userOrRoom.name}</span>
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
                  <span className="last-message-hour">
                    {getDateAndHours(lastMessageCreatedAt)}
                  </span>
                  <span
                    className="remove-chat"
                    onClick={(e) => {
                      setDeleteMessages(1);
                      const parentEl = e.currentTarget.parentElement;
                      parentEl?.classList.add("empty-chat___");
                    }}
                  >
                    X
                  </span>
                </div>
              ) : (
                <>
                  <div className="container-user-chat-none-content">
                    <span className="sender-chat-span">{userOrRoom.name}</span>
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
