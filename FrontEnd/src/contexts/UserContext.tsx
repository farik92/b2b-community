import {useState, useEffect, createContext, useContext} from "react";
import {
    verifyTokenUserRequest,
} from "../api/auth.api";
import {ChildrenType} from "../interfaces/user.interfaces";

const userContext = createContext<any>(undefined);

export function useUserContext() {
    return useContext(userContext);
}

const UserProvider = (props: ChildrenType) => {
    const [user, setUser] = useState<object>({});
    const [error, setError] = useState<object[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isMembers, setIsMembers] = useState({});

    useEffect(() => {
        if (error.length > 0) {
            const timer = setTimeout(() => {
                setError([]);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    useEffect(() => {
        const verify = async () => {
            const session = sessionStorage.getItem("token");
            if (!session) return setIsAuthenticated(false);
            try {
                const property = await verifyTokenUserRequest();
                setUser(property);
                setIsAuthenticated(true);
            } catch (error) {
                setIsAuthenticated(false);
                console.log(error);
            }
        };
        verify();
    }, []);

    return (
        <userContext.Provider
            value={{
                user,
                setUser,
                isAuthenticated,
                error,
                setError,
                isMembers,
                setIsMembers,
            }}
        >
            {props.children}
        </userContext.Provider>
    );
};

export default UserProvider;
