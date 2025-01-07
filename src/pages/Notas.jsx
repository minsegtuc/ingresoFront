import { useState, useContext, useEffect } from 'react'
import { ContextConfig } from '../context/ContextConfig';
import { BsSearch } from 'react-icons/bs';
import Swal from 'sweetalert2';

const Notas = () => {

    const [aspirantes, setAspirantes] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [buscar, setBuscar] = useState(null)
    const { HOST, handleSession } = useContext(ContextConfig)

    const handleSearch = (e) => {
        setBuscar(parseInt(e.target.value))
    }

    useEffect(() => {
        fetch(`${HOST}/api/aspirantes/${buscar ? `${buscar}` : 'aspirantes'}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        })
            .then(response => {
                if (response.status === 200) {
                    setIsLoading(false)
                    return response.json();
                } else if (response.status === 403) {
                    Swal.fire({
                        title: 'Credenciales caducadas',
                        icon: 'info',
                        text: 'Credenciales de seguridad caducadas. Vuelva a iniciar sesion'
                    }).then((result) => {
                        handleSession()
                    })
                }
            })
            .then(data => {
                if (data) {
                    console.log(data)
                    setAspirantes(data)
                } else {
                    setAspirantes([])
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            })
    }, [buscar])

    return (
        <div className='text-xs flex flex-col w-full h-full lg:relative lg:left-52'>
            <h1 className='text-[#005CA2] font-bold text-2xl'>NOTAS</h1>
            <div className='relative w-full mt-4 flex justify-start items-center'>
                <input className='w-full text-sm h-10 px-6 rounded-3xl border-[#757873] border-2' placeholder='Buscar aspirante' onChange={handleSearch} />
                <div className="absolute right-9 top-1/2 transform -translate-y-1/2">
                    <BsSearch className="text-[#757873]" />
                </div>
            </div>
            <div className='w-full mt-6'>
                {
                    isLoading ?
                        <div className='w-full h-full flex justify-center items-center'>
                            <div className='animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#005CA2]'></div>
                        </div>
                        :
                        <table className='w-full'>
                            <thead className='bg-[#005CA2] text-white'>
                                <tr className='h-6'>
                                    <th className='text-center'>DNI</th>
                                    <th className='text-center'>Apellido</th>
                                    <th className='text-center'>Nombre</th>
                                    <th className='text-center'>Nota</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    aspirantes && aspirantes.map((aspirante, index) => (
                                        <tr key={index} className='h-8 bg-[#f0f0f0] border-y-2'>
                                            <td className='text-center'>{aspirante.dni}</td>
                                            <td className='text-center'>{aspirante.apellido}</td>
                                            <td className='text-center'>{aspirante.nombre}</td>
                                            <td className='text-center'>{aspirante.nota ? aspirante.nota + '/20' : '-'}</td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                }

            </div>
        </div>

    )
}

export default Notas