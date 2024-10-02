import Chat from "./pages/Chat";
import UserProvider from "./contexts/UserContext";
import SocketProvider from "./contexts/SocketContext";

function App() {
  return (
      <UserProvider>
        <SocketWrapper>
        </SocketWrapper>
      </UserProvider>
  );
}

function SocketWrapper() {
  return (
    <SocketProvider>
      <Chat />
    </SocketProvider>
  );
}


export default App;
