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
        
        // Función para verificar token usando cookies como fallback
        const verifyTokenFromCookies = () => {
            console.log("Intentando verificar token desde cookies...");
            const token = Cookies.get('token') || Cookies.get('jwt') || Cookies.get('authToken');
            
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    console.log("Token decodificado desde cookies:", decoded);
                    
                    // Crear usuario básico desde el token
                    const user = {
                        nombre: decoded.nombre || decoded.name || 'Usuario',
                        apellido: decoded.apellido || decoded.lastname || '',
                        rol: decoded.rol || decoded.role || { idRol: 1 },
                        message: 'Token verificado desde cookies'
                    };
                    
                    handleUser(user);
                    handleLogin();
                    return true;
                } catch (error) {
                    console.error("Error al decodificar token desde cookies:", error);
                    return false;
                }
            }
            return false;
        };
        
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
                    // Si no es JSON, el servidor no tiene el endpoint configurado
                    console.warn('El servidor no tiene configurado el endpoint /api/verifyToken');
                    console.warn('Intentando verificación alternativa con cookies...');
                    
                    // Intentar verificar desde cookies
                    if (verifyTokenFromCookies()) {
                        return Promise.resolve({ success: true, fromCookies: true });
                    } else {
                        throw new Error('No se pudo verificar el token ni desde el servidor ni desde cookies');
                    }
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
                
                // Si la verificación fue exitosa desde cookies
                if (data.success && data.fromCookies) {
                    console.log('Verificación exitosa desde cookies');
                    return;
                }
                
                // Verificación normal desde servidor
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
                
                // Intentar verificación desde cookies como último recurso
                console.log('Intentando verificación de emergencia desde cookies...');
                if (!verifyTokenFromCookies()) {
                    console.log('Redirigiendo al login...');
                    window.location.href = "https://control.minsegtuc.gov.ar/login";
                }
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