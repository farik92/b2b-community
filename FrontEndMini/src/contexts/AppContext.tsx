import { useState, createContext, useContext } from "react";

const appContext = createContext<any>(undefined);

export const useAppContext = () => {
  return useContext(appContext);
};

interface IReceipent {
  vendorId?: number | undefined;
}

export default function AppProvider(props: any) {
  const [data, setData] = useState<IReceipent>({
    vendorId: window?.vendorId,
  });
  return (
    <appContext.Provider value={{ data, setData }}>
      {props.children}
    </appContext.Provider>
  );
}
