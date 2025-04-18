import { createContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';

export const ContextConfig = createContext();

export const ContextProvider = ({ children }) => {
    const [login, setLogin] = useState(null);
    const [rol, setRol] = useState(null);

    const HOST =
        process.env.NODE_ENV === 'production'
            ? 'https://srv555183.hstgr.cloud:3006'
            : 'http://localhost:3000';

    const handleLogin = (rol) => {
        setLogin(true);
        setRol(rol);
    };

    const handleSession = () => {
        setLogin(false);
        setRol(null);
    }

    const handleLogout = () => {
        setLogin(false);
        setRol(null);
        Cookies.remove(auth_token);
    };

    // useEffect(() => {
    //     console.log("Su rol: " , rol)
    // }, [rol])

    return (
        <ContextConfig.Provider value={{ login, handleLogin, handleLogout, HOST, rol, handleSession }}>
            {children}
        </ContextConfig.Provider>
    );
};
