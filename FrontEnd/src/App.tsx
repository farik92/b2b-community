import Chat from "./pages/Chat";
import UserProvider from "./contexts/UserContext";
import SocketProvider from "./contexts/SocketContext";

function App() {
  return (
      <UserProvider>
          <SocketProvider>
              <Chat />
          </SocketProvider>
      </UserProvider>
  );
}


export default App;
