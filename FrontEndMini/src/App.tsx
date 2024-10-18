import Chat from "./pages/Chat";
import UserProvider from "./contexts/UserContext";
import SocketProvider from "./contexts/SocketContext";
import AppProvider from "./contexts/AppContext";

function App() {
  return (
    <AppProvider>
      <UserProvider>
        <SocketProvider>
          <Chat />
        </SocketProvider>
      </UserProvider>
    </AppProvider>
  );
}

export default App;
