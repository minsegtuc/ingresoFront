import {useEffect, useContext} from 'react'
import Aside from '../components/Aside'
import { Outlet, useNavigate } from 'react-router-dom'
import { ContextConfig } from '../context/ContextConfig';

const Home = () => {

    const navigate = useNavigate()
    const { HOST } = useContext(ContextConfig);

    useEffect(() => {
        fetch(`${HOST}/api/verifyToken`, {
            method: 'GET',
            credentials: 'include'
        }).then(res => {
            if (res.status === 200) {
                return res.json();
            } else {
                navigate('/ingreso/login')
            }
        })
    }, [])

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