import { useState, createContext, useContext } from "react";

const appContext = createContext<any>(undefined);

export const useAppContext = () => {
  return useContext(appContext);
};

interface IReceipent {
  vendorId?: number | undefined;
  requestPriceBtn?: string | undefined;
}

export default function AppProvider(props: any) {
  const [data, setData] = useState<IReceipent>({
    vendorId: window?.vendorId,
    requestPriceBtn: window?.requestPriceBtn,
  });
  return (
    <appContext.Provider value={{ data, setData }}>
      {props.children}
    </appContext.Provider>
  );
}
