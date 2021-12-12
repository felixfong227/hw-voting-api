import { createContext, PropsWithChildren, useState } from "react";

const hashFromLocalStorage = localStorage.getItem("HKIDHash");
export const AuthContext = createContext<{HKIDHash: string, setHKIDHash: React.Dispatch<React.SetStateAction<string>>}>({HKIDHash: hashFromLocalStorage ?? "", setHKIDHash: () => {}});

export function AuthContextProvider(props: PropsWithChildren<{}>) {
    
    const [HKIDHash, setHKIDHash] = useState(hashFromLocalStorage ?? "");

    return (
        <AuthContext.Provider value={{
            HKIDHash,
            setHKIDHash,
        }}>
            {props.children}
        </AuthContext.Provider>
    );
}