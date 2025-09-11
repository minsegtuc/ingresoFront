import { useState, useContext, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { ContextConfig } from '../context/ContextConfig';

const Aside = () => {
    const { HOST, HOST_AUTH, handleSession, login, user } = useContext(ContextConfig)

    const secciones = [
        { nombre: "ESTADISTICAS", enlace: '/ingreso/estadisticas', roles: ['SISADMIN', 'DENING', 'IESTADISTICAS'] },
        { nombre: "NOTAS", enlace: '/ingreso/notas', roles: ['SISADMIN', 'DENING'] },
        { nombre: "CARGA Y MODIFICACIONES", enlace: '/ingreso/carga', roles: ['SISADMIN', 'DENING'] },
        { nombre: "MODULOS", enlace: 'https://control.srv555183.hstgr.cloud/modulos', roles: ['SISADMIN', 'DENING'] },
    ]

    const seccionesPermitidas = secciones.filter(seccion =>
        seccion.roles.include(user.rol)
    )

    const handleLogout = () => {
        fetch(`${HOST_AUTH}/auth/usuario/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        })
            .then(res => {
                if (res.status === 200) {
                    handleSession();
                }
            })
            .catch(err => console.log(err));
    }

    return (
        <aside className={`bg-[#005CA2] text-white flex flex-col items-center text-sm lg:min-h-screen lg:max-h-screen lg:fixed`}>
            <NavLink to='/ingreso/estadisticas'>
                <img src="/ingreso/Minseg_white.png" alt="" className='flex w-48 lg:w-52 mt-4 justify-center' />
            </NavLink>
            <div className='flex flex-col lg:mt-8 mt-2 w-full'>
                {
                    seccionesPermitidas.map((modulo, index) => {
                        if (modulo.nombre !== "MODULOS") {
                            return (
                                <NavLink to={modulo.enlace} className={`w-full bg-[#f0f0f0] text-black border-t-2 py-2 justify-center hover:bg-black hover:text-white`}>{modulo.nombre}</NavLink>

                            )
                        } else {
                            <a href={modulo.enlace} className={`w-full bg-[#f0f0f0] text-black border-t-2 border-b-2 py-2 flex justify-center hover:bg-black hover:text-white`}>{modulo.nombre}</a>

                        }
                    })
                }
                <NavLink to={'/ingreso/estadisticas'} className={`w-full bg-[#f0f0f0] text-black border-t-2 py-2 justify-center hover:bg-black hover:text-white ${(user.rol === 'SISADMIN' || user.rol === 'ADMIN' || user.rol === 'LECTOR') ? 'flex' : 'hidden'}`}>ESTADISTICAS</NavLink>
                <NavLink to={'/ingreso/notas'} className={`w-full bg-[#f0f0f0] text-black border-t-2 py-2 flex justify-center hover:bg-black hover:text-white ${(user.rol === 'SISADMIN' || user.rol === 'ADMIN') ? 'flex' : 'hidden'}`}>NOTAS</NavLink>
                <NavLink to={'/ingreso/carga'} className={`w-full bg-[#f0f0f0] text-black border-t-2 border-b-2 py-2 flex justify-center hover:bg-black hover:text-white ${(user.rol === 'SISADMIN') ? 'flex' : 'hidden'}`}>CARGA Y MODIFICACIONES</NavLink>
                <a href={'https://control.srv555183.hstgr.cloud/modulos'} className={`w-full bg-[#f0f0f0] text-black border-t-2 border-b-2 py-2 flex justify-center hover:bg-black hover:text-white ${(user.rol === 'SISADMIN') ? 'flex' : 'hidden'}`}>MODULOS</a>
            </div>
            {
                login ? (<button className='bg-black text-white px-4 rounded-md min-w-28 md:mt-auto md:mb-8 my-2 md:my-0' onClick={handleLogout}>CERRAR SESIÓN</button>) : ('')
            }

        </aside>
    )
}

export default Aside