import React from 'react'
import Aside from '../components/Aside'
import { Outlet } from 'react-router-dom'

const Home = () => {
    return (
        <div className='w-full h-full'>
            <div className='flex lg:flex-row flex-col h-full'>
                <Aside className='h-full'/>
                <div className='w-full lg:w-5/6 p-4'>
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default Home