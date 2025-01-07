import { useState, useContext, useEffect } from 'react'
import { ContextConfig } from '../context/ContextConfig';
import { BsSearch } from 'react-icons/bs';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

const Notas = () => {

    const [fecha, setFecha] = useState('')
    const [turno, setTurno] = useState('')
    const [aula, setAula] = useState('')

    const [aspirantes, setAspirantes] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [dni, setDni] = useState('')
    const { HOST, handleSession } = useContext(ContextConfig)

    const handleSearch = (e) => {
        setDni(parseInt(e.target.value))
    }

    const handleChangeInput = (e) => {
        const { name, value } = e.target;
        //console.log(name, value)
        if (name === 'fecha') {
            setFecha(value);
        } else if (name === 'turno') {
            setTurno(value);
        } else if (name === 'aula') {
            setAula(value);
        }
    }

    const exportarExcel = (aspirantes, fileName = 'aspirantes.xlsx') => {
        if (!aspirantes || aspirantes.length === 0) {
            alert('No hay datos para exportar.');
            return;
        }
    
        const data = aspirantes.map((aspirante) => ({
            DNI: aspirante.dni || '-',
            Apellido: aspirante.apellido || '-',
            Nombre: aspirante.nombre || '-',
            Nota: aspirante.nota ? `${aspirante.nota}/20` : '-'
        }));
    
        // Crear un libro de Excel
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
    
        // Agregar la hoja al libro
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Aspirantes');
    
        // Exportar el archivo
        XLSX.writeFile(workbook, fileName);
    };

    const borrarFiltros = () => {
        setFecha('')
        setTurno('')
        setAula('')
    }

    useEffect(() => {
        let parametros = {
            fecha,
            turno,
            aula,
            dni
        }

        fetch(`${HOST}/api/aspirantes/aspirantes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(parametros)
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
                    setAspirantes(data.aspirantes)
                } else {
                    setAspirantes([])
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            })
    }, [fecha, aula, turno, dni])

    return (
        <div className='text-xs flex flex-col w-full h-full lg:relative lg:left-52'>
            <h1 className='text-[#005CA2] font-bold text-2xl text-center md:text-left'>NOTAS</h1>
            <div className='bg-[#f0f0f0] p-4 mt-4 rounded-md flex lg:flex-row flex-col lg:justify-around gap-3 lg:gap-2 justify-center'>
                <div className='flex justify-center'>
                    <label htmlFor="" className='mr-4'>Ingrese fecha:</label>
                    <input type="date" name="fecha" id="" className='rounded-md min-w-36' value={fecha} onChange={(e) => handleChangeInput(e)} />
                </div>
                <div className='flex justify-center'>
                    <label htmlFor="" className='mr-4'>Ingrese turno:</label>
                    <select name="turno" id="" className='rounded-md min-w-36' value={turno} onChange={(e) => handleChangeInput(e)}>
                        <option value="" disabled>Seleccione turno</option>
                        <option value="T01">T01</option>
                        <option value="T02">T02</option>
                        <option value="T03">T03</option>
                        <option value="T04">T04</option>
                    </select>
                </div>
                <div className='flex justify-center'>
                    <label htmlFor="" className='mr-4'>Ingrese aula:</label>
                    <select name="aula" id="" className='rounded-md min-w-36' value={aula} onChange={(e) => handleChangeInput(e)}>
                        <option value="" disabled>Seleccione aula</option>
                        <option value="AULA 01">Aula 01</option>
                        <option value="AULA 02">Aula 02</option>
                        <option value="AULA 03">Aula 03</option>
                        <option value="AULA 04">Aula 04</option>
                    </select>
                </div>
                <button className='bg-black text-white px-4 rounded-md min-w-28' onClick={borrarFiltros}>BORRAR FILTROS</button>
                <button className='bg-black text-white px-4 rounded-md min-w-28' onClick={() => exportarExcel(aspirantes, 'lista_aspirantes.xlsx')}>EXPORTAR</button>
            </div>
            <div className='relative w-full mt-4 flex justify-start items-center'>
                <input className='w-full text-sm h-10 px-6 rounded-3xl border-[#757873] border-2' placeholder='Buscar aspirante' onChange={handleSearch} />
                <div className="absolute right-9 top-1/2 transform -translate-y-1/2">
                    <BsSearch className="text-[#757873]" />
                </div>
            </div>
            <div className='w-full mt-6' id='componente-exportar'>
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