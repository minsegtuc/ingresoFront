import { useState, useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { ContextConfig } from '../context/ContextConfig';

const Aside = () => {
    const { HOST, handleSession, handleLogout, rol } = useContext(ContextConfig)
    return (
        <aside className={`bg-[#005CA2] text-white flex flex-col items-center text-sm lg:min-h-screen lg:max-h-screen lg:fixed`}>
            <NavLink to='/ingreso/estadisticas'>
                <img src="/ingreso/Minseg_white.png" alt="" className='flex w-48 lg:w-52 mt-4 justify-center' />
            </NavLink>
            <div className='flex flex-col lg:mt-8 mt-2 w-full'>
                <NavLink to={'/ingreso/estadisticas'} className={`w-full bg-[#f0f0f0] text-black border-t-2 py-2 justify-center hover:bg-black hover:text-white ${(rol === 'ENCARGADO' || rol === 'ADMIN' || rol === 'LECTOR') ? 'flex' : 'hidden'}`}>ESTADISTICAS</NavLink>
                <NavLink to={'/ingreso/notas'} className={`w-full bg-[#f0f0f0] text-black border-t-2 py-2 flex justify-center hover:bg-black hover:text-white ${(rol === 'ENCARGADO' || rol === 'ADMIN') ? 'flex' : 'hidden'}`}>NOTAS</NavLink>
                <NavLink to={'/ingreso/carga'} className={`w-full bg-[#f0f0f0] text-black border-t-2 border-b-2 py-2 flex justify-center hover:bg-black hover:text-white ${(rol === 'ENCARGADO') ? 'flex' : 'hidden'}`}>CARGA Y MODIFICACIONES</NavLink>
            </div>
            <button className='bg-black text-white px-4 rounded-md min-w-28 md:mt-auto md:mb-8 my-2 md:my-0' onClick={handleLogout}>CERRAR SESIÓN</button>
        </aside>
    )
}

export default Aside