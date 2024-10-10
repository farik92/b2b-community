import { useState, useCallback } from "react";
import debounce from "lodash.debounce";
import { useUserContext } from "../contexts/UserContext.tsx";
import { useSocketContext } from "../contexts/SocketContext.tsx";

const UserSearch = ({ users }: any) => {
  const [query, setQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(users);

  const { setIsReceiver } = useUserContext();
  const { setUserToSend, setUserToSendName } = useSocketContext();

  const handleSearch = useCallback(
    debounce((query) => {
      setFilteredUsers(
        users.filter((user: any) =>
          user.name.toLowerCase().includes(query.toLowerCase()),
        ),
      );
    }, 500), // Задержка 300 мс
    [users],
  );

  const handleChange = (e: any) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    handleSearch(newQuery);
  };

  return (
    <div className="user-search-wrapper">
      <input
        type="text"
        placeholder="Поиск пользователей..."
        value={query}
        onChange={handleChange}
      />
      <ul className="user-search-list">
        {query.length > 2
          ? filteredUsers.map((user: any) => (
              <li
                className="user-search-list-item"
                key={user.id}
                onClick={() => {
                  setQuery("");
                  setIsReceiver(user.id);
                  setUserToSend(user.id);
                  setUserToSendName(user.name);
                }}
              >
                {user.name}
              </li>
            ))
          : ""}
      </ul>
    </div>
  );
};

export default UserSearch;
