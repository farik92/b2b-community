import {useGetAllUsersAndRooms} from "../hooks/users.hooks";
import {useSocketContext} from "../contexts/SocketContext";
import {useUserContext} from "../contexts/UserContext";
import {getDateAndHours} from "../functions/getDateAndHours";
import {Message} from "../interfaces/message.interfaces";
import {UsersAndRooms} from "../interfaces/user.interfaces";

function ChatsPanel() {
    const {user, setIsMembers} = useUserContext();
    const {conectedUsers, userToSend, setUserToSend, setUserToSendName, allMessages, scrollRef} = useSocketContext();
    const {usersAndRooms} = useGetAllUsersAndRooms(user.id);
    const getLastMessage = (sender: number, receiverId: number) => {
        if (!allMessages) return [undefined, undefined, undefined];
        const lastMessage = allMessages
            .slice()
            .reverse()
            .find((message: Message) =>
                message.type === "room"
                    ? // room
                    message.receiverId === receiverId
                    : // user
                    (message.sender.id === sender && message.receiverId === receiverId) ||
                    (message.sender.id === receiverId && message.receiverId === sender)
            );
        if (!lastMessage)
            return [{sender: {id: undefined}, content: undefined, createdAt: undefined}];
        const {content, sender: resultSender, createdAt: resultCreatedAt} = lastMessage;
        return [content, resultSender, resultCreatedAt];
    };

    return (
        <div className="chats" ref={scrollRef}>
            {usersAndRooms.map((userOrRoom: UsersAndRooms, index: number) => {
                const [lastMessageContent, lastMessageSender, lastMessageCreatedAt] = getLastMessage(
                    user.id,
                    userOrRoom.id
                );
                return (
                    <div key={index} className={`sender-chat ${userToSend === userOrRoom.id ? "selected" : ""}`}
                        onClick={() => {
                            setIsMembers({id: userOrRoom.id, members: userOrRoom.members});
                            setUserToSend(userOrRoom.id);
                            setUserToSendName(userOrRoom.name);
                        }}
                    >
                        <div className="container-image-and-online">
                            <div className={conectedUsers.includes(userOrRoom.id) ? "online" : "offline"}></div>
                        </div>
                        {lastMessageSender ? (
                            <div className="container-user-chat-content">
                                <span className="sender-chat-span">{userOrRoom.name}</span>
                                <p className="sender-content">
                                    {lastMessageSender.id === user.id ? "Я" : lastMessageSender.name}:{" "}
                                    {lastMessageContent && (lastMessageContent.length <= 32 ? lastMessageContent : `${lastMessageContent.substring(0, 32)}...`)}
                                </p>
                                <span className="last-message-hour">{getDateAndHours(lastMessageCreatedAt)}</span>
                            </div>
                        ) : (
                            <>
                                {Array.isArray(userOrRoom.members) ? (
                                    <div className="container-user-chat-content">
                                        <span className="sender-chat-span">{userOrRoom.name}</span>
                                        <p className="sender-content">
                                            {userOrRoom.creator === user.id ? `You created group "${userOrRoom.name}".` : "You were added."}
                                        </p>
                                        <span
                                            className="last-message-hour">{getDateAndHours(userOrRoom.createdAt)}</span>
                                    </div>
                                ) : (
                                    <div className="container-user-chat-none-content">
                                        <span className="sender-chat-span">{userOrRoom.name}</span>
                                        <p className="sender-none-content"></p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default ChatsPanel;
