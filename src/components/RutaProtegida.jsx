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
            console.log('Respuesta de verifyToken:', res);
            console.log('Content-Type:', res.headers.get('content-type'));
            
            if (res.status === 200) {
                // Verificar que la respuesta sea JSON antes de parsearla
                const contentType = res.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return res.json();
                } else {
                    // Si no es JSON, obtener el texto para ver qué está devolviendo
                    return res.text().then(text => {
                        console.error('El servidor devolvió HTML en lugar de JSON:', text.substring(0, 200));
                        throw new Error('El servidor devolvió una respuesta no válida');
                    });
                }
            } else {
                // Obtener el texto de la respuesta para mejor debugging
                return res.text().then(text => {
                    console.error('Error del servidor:', res.status, text.substring(0, 200));
                    throw new Error(`Error del servidor: ${res.status}`);
                });
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
                console.error('Error en verificación de token:', err);
                // Redirigir al login en caso de error
                window.location.href = "https://control.minsegtuc.gov.ar/login";
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    if (isLoading) return '';

    if (!login) {
        window.location.href = "https://control.minsegtuc.gov.ar/login"; // o la URL que quieras
        return null; // importante para no renderizar nada
    }

    return <Outlet />;
};

export default RutaProtegida;