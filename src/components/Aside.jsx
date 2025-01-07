import React from 'react'
import { NavLink } from 'react-router-dom'

const Aside = () => {
    return (
        <aside className={`bg-[#005CA2] text-white flex flex-col items-center text-sm lg:min-h-screen lg:max-h-screen lg:fixed`}>
            <NavLink to='/ingreso/estadisticas'>
                <img src="/ingreso/Minseg_white.png" alt="" className='flex w-48 lg:w-52 mt-4 justify-center' />
            </NavLink>
            <div className='flex flex-col lg:mt-8 mt-2 w-full'>
                <NavLink to={'/ingreso/estadisticas'} className='w-full bg-[#f0f0f0] text-black border-t-2 py-2 flex justify-center hover:bg-black hover:text-white'>ESTADISTICAS</NavLink>
                <NavLink to={'/ingreso/notas'} className='w-full bg-[#f0f0f0] text-black border-t-2 py-2 flex justify-center hover:bg-black hover:text-white'>NOTAS</NavLink>
                <NavLink to={'/ingreso/carga'} className='w-full bg-[#f0f0f0] text-black border-t-2 border-b-2 py-2 flex justify-center hover:bg-black hover:text-white'>CARGA</NavLink>
            </div>
        </aside>
    )
}

export default Aside