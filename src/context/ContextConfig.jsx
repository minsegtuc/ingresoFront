import { createContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';

export const ContextConfig = createContext();

export const ContextProvider = ({ children }) => {
    const [login, setLogin] = useState(null);
    const [user, setUser] = useState({})
    const [rol, setRol] = useState(null);

    const HOST =
        process.env.NODE_ENV === 'production'
            ? 'https://srv555183.hstgr.cloud:3006'
            : 'http://localhost:3005';

    const HOST_AUTH = process.env.NODE_ENV === 'production' ? 'https://srv555183.hstgr.cloud:3008' : 'http://localhost:3000'

    const handleLogin = (rol) => {
        setLogin(true);
    };
    
    const handleUser = async (user) => {
        const userAux = { ...user };
        console.log(user, userAux)

        try {
            const response = await fetch(`${HOST_AUTH}/auth/rol/${user.rol?.idRol}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Data del rol: " , data)
                userAux.rol = data.descripcion;
                setUser(userAux);
            } else {
                console.error("Error al obtener el rol:", response.statusText);
            }
        } catch (err) {
            console.error("Error de red:", err);
        }
    };

    const handleSession = () => {
        setLogin(false);
        setUser({})
    }

    return (
        <ContextConfig.Provider value={{ login, handleLogin, HOST, HOST_AUTH, rol, handleSession, handleUser, user }}>
            {children}
        </ContextConfig.Provider>
    );
};
