import { Navigate, Outlet } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { ContextConfig } from '../context/ContextConfig';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

const RutaProtegida = () => {
    const { login, handleLogin, HOST, handleUser } = useContext(ContextConfig);
    const [isLoading, setIsLoading] = useState(true);

    // useEffect(() => {
    //     console.log(login)
    // }, [])

    useEffect(() => {
        console.log("Ingreso a Ruta Protegida");
        fetch(`${HOST}/api/verifyToken`, {
            method: 'GET',
            credentials: 'include'
        }).then(res => {
            //console.log('Respuesta de verifyToken:', res);
            if (res.status === 200) {
                return res.json();
            } else {
                throw new Error('Usuario no autenticado');
            }
        })
            .then(data => {
                console.log(data)
                const user = {
                    nombre: data.usuario.nombre,
                    apellido: data.usuario.apellido,
                    rol: data.usuario.rol,
                    message: data.message
                }
                handleUser(user);
                handleLogin();
            })
            .catch(err => {
                console.log(err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    if (isLoading) return '';

    if (!login) {
        window.location.href = "http://localhost:5173"; // o la URL que quieras
        return null; // importante para no renderizar nada
    }

    return <Outlet />;
};

export default RutaProtegida;