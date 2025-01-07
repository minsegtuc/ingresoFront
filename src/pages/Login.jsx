import { useState, useContext } from 'react'
import { BsPersonCircle } from "react-icons/bs";
import { Outlet, useNavigate } from 'react-router-dom';
import { ContextConfig } from '../context/ContextConfig';
import Swal from 'sweetalert2';
import { jwtDecode } from 'jwt-decode';

const Login = () => {

    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const { HOST, handleLogin } = useContext(ContextConfig);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        fetch(`${HOST}/api/usuarios/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                user_name: userName,
                password
            })
        })
            .then(res => {
                if (res.status === 200) {
                    return res.json();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Usuario o contraseña incorrectos',
                    });
                }
            })
            .then(data => {
                const token = data.token;
                const decoded = jwtDecode(token);
                const rol = decoded.rol;

                handleLogin(rol);
                navigate('/ingreso/estadisticas');
            })
            .catch(err => {
                console.log(err);
            });
    }

    return (
        <div className='text-xs flex flex-col w-full h-full lg:relative lg:left-52 mt-auto'>
            <h1 className='text-[#005CA2] font-bold text-4xl md:text-5xl text-center'>LOGIN</h1>
            <div>
                <BsPersonCircle className='text-5xl mt-14 md:text-6xl text-[#005CA2] md:mt-36 mx-auto' />
            </div>
            <div className='flex flex-col items-center justify-center mt-4'>
                <form className='flex flex-col gap-6' onSubmit={(e) => {
                    handleSubmit(e);
                }}>
                    <input className={`w-72 p-3 rounded border-2`} type="text" placeholder='Email' value={userName} onChange={(e) => setUserName(e.target.value)} required />
                    <input className={`w-72 p-3 rounded border-2`} type="password" placeholder='Contraseña' value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type='submit' className='bg-[#005CA2] rounded w-72 p-2 text-white font-semibold'>Ingresar</button>
                </form>
            </div>
        </div>
    )
}

export default Login