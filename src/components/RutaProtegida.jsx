import { Navigate, Outlet } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { ContextConfig } from '../context/ContextConfig';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

const RutaProtegida = () => {
    const { login, handleLogin, HOST } = useContext(ContextConfig);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log(login)
    }, [])

    useEffect(() => {
        console.log("Ingreso a Ruta Protegida");
        fetch(`${HOST}/api/verifyToken`, {
            method: 'GET',
            credentials: 'include'
        }).then(res => {
            if (res.status === 200) {
                return res.json();
            } else {
                throw new Error('Usuario no autenticado');
            }
        })
            .then(data => {
                const token = Cookies.get('auth_token');
                const decoded = jwtDecode(token);
                
                const rol = decoded.rol;

                handleLogin(rol);
            })
            .catch(err => {
                console.log(err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    if (isLoading) return '';

    return login ? <Outlet /> : <Navigate to="/ingreso/login" />;
};

export default RutaProtegida;