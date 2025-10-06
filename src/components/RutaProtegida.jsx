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
        console.log("HOST configurado:", HOST);
        console.log("URL completa:", `${HOST}/api/verifyToken`);
        
        fetch(`${HOST}/api/verifyToken`, {
            method: 'GET',
            credentials: 'include'
        }).then(res => {
            console.log('Respuesta de verifyToken:', res);
            console.log('Status:', res.status);
            console.log('Content-Type:', res.headers.get('content-type'));
            console.log('URL de la respuesta:', res.url);
            
            if (res.status === 200) {
                // Verificar que la respuesta sea JSON antes de parsearla
                const contentType = res.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return res.json();
                } else {
                    // Si no es JSON, obtener el texto para ver qué está devolviendo
                    return res.text().then(text => {
                        console.error('El servidor devolvió HTML en lugar de JSON:');
                        console.error('Primeros 500 caracteres:', text.substring(0, 500));
                        console.error('URL que devolvió HTML:', res.url);
                        throw new Error('El servidor devolvió una respuesta no válida (HTML en lugar de JSON)');
                    });
                }
            } else {
                // Obtener el texto de la respuesta para mejor debugging
                return res.text().then(text => {
                    console.error('Error del servidor:');
                    console.error('Status:', res.status);
                    console.error('URL:', res.url);
                    console.error('Primeros 500 caracteres:', text.substring(0, 500));
                    throw new Error(`Error del servidor: ${res.status} - ${res.statusText}`);
                });
            }
        })
            .then(data => {
                console.log('Datos recibidos del servidor:', data);
                if (data && data.usuario) {
                    const user = {
                        nombre: data.usuario.nombre,
                        apellido: data.usuario.apellido,
                        rol: data.usuario.rol,
                        message: data.message
                    }
                    handleUser(user);
                    handleLogin();
                } else {
                    console.error('Estructura de datos inesperada:', data);
                    throw new Error('Estructura de datos inesperada del servidor');
                }
            })
            .catch(err => {
                console.error('Error en verificación de token:', err);
                console.error('HOST usado:', HOST);
                console.error('URL completa intentada:', `${HOST}/api/verifyToken`);
                
                // Redirigir al login en caso de error
                console.log('Redirigiendo al login...');
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