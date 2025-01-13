import { useState, useContext, useEffect } from 'react'
import { ContextConfig } from '../context/ContextConfig';
import { BsSearch } from 'react-icons/bs';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

const Notas = () => {

    const [fecha, setFecha] = useState('')
    const [turno, setTurno] = useState('')
    const [aula, setAula] = useState('')
    const [genero, setGenero] = useState('')
    const [condicion, setCondicion] = useState('')

    const [aspirantes, setAspirantes] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [busqueda, setBusqueda] = useState('')
    const { HOST, handleSession } = useContext(ContextConfig)

    const handleSearch = (e) => {
        setBusqueda(e.target.value)
    }

    const handleChangeInput = (e) => {
        const { name, value } = e.target;
        // console.log(name, value)
        if (name === 'fecha') {
            setFecha(value);
        } else if (name === 'turno') {
            setTurno(value);
        } else if (name === 'aula') {
            setAula(value);
        } else if (name === 'genero') {
            setGenero(value);
        } else if (name === 'condicion') {
            setCondicion(value);
        }
    }

    const exportarExcel = (aspirantes, fileName = `aspirantes${aula ? '-'+aula : ''}-${turno ? '-'+turno : ''}.xlsx`) => {
        if (!aspirantes || aspirantes.length === 0) {
            alert('No hay datos para exportar.');
            return;
        }

        const data = aspirantes.map((aspirante) => ({
            DNI: aspirante.dni || '-',
            Apellido: aspirante.apellido || '-',
            Nombre: aspirante.nombre || '-',
            Nota: aspirante.nota ? `${aspirante.nota}/20` : '-',
            Genero: aspirante.genero || '-'
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
        setGenero('')
        setCondicion('')
    }

    useEffect(() => {
        let parametros = {
            fecha,
            turno,
            aula,
            busqueda,
            genero, 
            condicion
        }

        // console.log("Parametros: " , parametros)

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
                    //console.log(data)
                    setAspirantes(data.aspirantes)
                } else {
                    setAspirantes([])
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            })
    }, [fecha, aula, turno, busqueda, genero, condicion])

    return (
        <div className='text-xs flex flex-col w-full h-full lg:relative lg:left-52'>
            <h1 className='text-[#005CA2] font-bold text-2xl text-center md:text-left'>NOTAS</h1>
            <div className='bg-[#f0f0f0] p-4 mt-4 rounded-md flex flex-col md:flex-row md:justify-around'>
                <div className='lg:w-2/3 w-full flex flex-col md:flex-row mb-4 lg:mb-0'>
                    <div className=' flex flex-col mb-2 w-full md:w-1/2 justify-center gap-2'>
                        <div className='flex justify-center flex-row'>
                            <div className='flex justify-end w-28 mr-4'>
                                <label htmlFor="" className=''>Ingrese fecha:</label>
                            </div>
                            <input type="date" name="fecha" id="" className='rounded-md min-w-36 px-2' value={fecha} onChange={(e) => handleChangeInput(e)} />
                        </div>
                        <div className='flex justify-center flex-row'>
                            <div className='flex justify-end w-28 mr-4'>
                                <label htmlFor="" className=''>Ingrese turno:</label>
                            </div>
                            <select name="turno" id="" className='rounded-md min-w-36 px-2' value={turno} onChange={(e) => handleChangeInput(e)}>
                                <option value="" disabled>Seleccione turno</option>
                                <option value="T01">T01</option>
                                <option value="T02">T02</option>
                                <option value="T03">T03</option>
                                <option value="T04">T04</option>
                            </select>
                        </div>
                    </div>
                    <div className=' flex flex-col mb-2 w-full md:w-1/2 justify-center gap-2'>
                        <div className='flex justify-center items-center flex-row'>
                            <div className='flex justify-end w-28 mr-4'>
                                <label htmlFor="" className=''>Ingrese aula:</label>
                            </div>
                            <select name="aula" id="" className='rounded-md min-w-36 px-2' value={aula} onChange={(e) => handleChangeInput(e)}>
                                <option value="" disabled>Seleccione aula</option>
                                <option value="AULA 01">Aula 01</option>
                                <option value="AULA 02">Aula 02</option>
                                <option value="AULA 03">Aula 03</option>
                                <option value="AULA 04">Aula 04</option>
                            </select>
                        </div>
                        <div className='flex justify-center items-center flex-row'>
                            <div className='flex justify-end w-28 mr-4'>
                                <label htmlFor="" className=''>Ingrese genero:</label>
                            </div>
                            <select name="genero" id="" className='rounded-md min-w-36 px-2' value={genero} onChange={(e) => handleChangeInput(e)}>
                                <option value="" disabled>Seleccione genero</option>
                                <option value="M">Masculinos</option>
                                <option value="F">Femeninas</option>
                            </select>
                        </div>
                        <div className='flex justify-center items-center flex-row'>
                            <div className='flex justify-end w-28 mr-4'>
                                <label htmlFor="" className=''>Ingrese condición:</label>
                            </div>
                            <select name="condicion" id="" className='rounded-md min-w-36 px-2' value={condicion} onChange={(e) => handleChangeInput(e)}>
                                <option value="" disabled>Seleccione condición</option>
                                <option value="1">Presentes</option>
                                <option value="0">Ausentes</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className='lg:w-1/3 w-full flex flex-col md:flex-row gap-3 justify-center items-center'>
                    <button className='bg-black text-white px-4 rounded-md min-w-32 max-w-32' onClick={borrarFiltros}>BORRAR FILTROS</button>
                    <button className='bg-black text-white px-4 rounded-md min-w-32 max-w-32' onClick={() => exportarExcel(aspirantes, `aspirantes${aula ? '-'+aula : ''}${turno ? '-'+turno : ''}.xlsx`)}>EXPORTAR</button>
                </div>
            </div>
            <div className='relative w-full mt-4 flex justify-start items-center'>
                <input className='w-full text-sm h-10 px-6 rounded-3xl border-[#757873] border-2' placeholder='Buscar aspirante por apellido, nombre o dni' onChange={handleSearch} />
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
                                    <th className='text-center'>N°</th>
                                    <th className='text-center'>DNI</th>
                                    <th className='text-center'>Apellido</th>
                                    <th className='text-center'>Nombre</th>
                                    <th className='text-center'>Nota</th>
                                    <th className='text-center'>Genero</th>
                                    <th className='text-center'>Turno</th>
                                    <th className='text-center'>Aula</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    aspirantes && aspirantes.map((aspirante, index) => (
                                        <tr key={index} className='h-8 bg-[#f0f0f0] border-y-[1px] border-gray-400'>
                                            <td className='text-center'>{index+1}</td>
                                            <td className='text-center'>{aspirante.dni}</td>
                                            <td className='text-center'>{aspirante.apellido}</td>
                                            <td className='text-center'>{aspirante.nombre}</td>
                                            <td className='text-center bg-[#005CA2]/25'>{aspirante.nota ? aspirante.nota + '/20' : '-'}</td>
                                            <td className='text-center'>{aspirante.genero}</td>
                                            <td className='text-center'>{aspirante.turno}</td>
                                            <td className='text-center'>{aspirante.aula}</td>
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