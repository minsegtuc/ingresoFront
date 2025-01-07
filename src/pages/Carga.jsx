import React, { useEffect, useContext, useState } from 'react'
import { ContextConfig } from '../context/ContextConfig';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

const Carga = () => {

    const { HOST, handleSession } = useContext(ContextConfig);
    const [examenes, setExamenes] = useState([]);
    const [aspirantesFile, setAspirantesFile] = useState([]);
    const [examenFile, setExamenFile] = useState([]);

    const [fechaExamen, setFechaExamen] = useState('');
    const [turnoExamen, setTurnoExamen] = useState('');
    const [aulaExamen, setAulaExamen] = useState('');
    const [cantidadExamen, setCantidadExamen] = useState('');

    const [fechaCarga, setFechaCarga] = useState('');
    const [turnoCarga, setTurnoCarga] = useState('');
    const [aulaCarga, setAulaCarga] = useState('');

    const cambiarFormatoFecha = (fecha) => {
        const [dia, mes, año] = fecha.split('-');
        return `${año}-${mes}-${dia}`;
    }

    const handleFileUpload = (e) => {
        //console.log("Ingreso a la funcion")
        setAspirantesFile(null);
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            const bodyData = jsonData.slice(1);

            const aspirantes = bodyData.map((aspirante) => {
                return {
                    dni: aspirante[0],
                    apellido: aspirante[1],
                    nombre: aspirante[2],
                    genero: aspirante[3],
                    aula: aspirante[4],
                    turno: aspirante[5],
                    fecha: aspirante[6],
                }
            })

            setAspirantesFile(aspirantes);
        }

        reader.readAsArrayBuffer(file);
    }

    const handleFileCargaUpload = (e) => {
        //console.log("Ingreso a la funcion")
        setExamenFile(null);
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            const bodyData = jsonData.slice(1);

            const resultados = bodyData.map((resultado) => {
                return {
                    dni: resultado[2],
                    apellido: resultado[5],
                    nombre: resultado[4],
                    nota: resultado[7],
                }
            })

            setExamenFile(resultados);
        }

        reader.readAsArrayBuffer(file);
    }

    const searchExamenId = async (aula, turno, fecha) => {
        try {
            const response = await fetch(`${HOST}/api/examenes/estado`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (response.status === 200) {
                const data = await response.json();
                const examen = data.find(examen => examen.aula === aula && examen.turno === turno && examen.fecha === fecha);

                if (examen) {
                    //console.log(examen.id_examen); // Confirma que encuentras el id_examen.
                    return examen.id_examen;
                } else {
                    console.error("Examen no encontrado");
                    return null;
                }
            } else if (response.status === 403) {
                Swal.fire({
                    title: 'Credenciales caducadas',
                    icon: 'info',
                    text: 'Credenciales de seguridad caducadas. Vuelva a iniciar sesión',
                }).then((result) => {
                    handleSession();
                });
            }
        } catch (error) {
            console.error("Error al buscar el examen:", error);
            return null;
        }
    }

    const estadoExamenes = () => {
        fetch(`${HOST}/api/examenes/estado`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        })
            .then(response => {
                if (response.status === 200) {
                    return response.json();
                } else if (response.status === 403) {
                    Swal.fire({
                        title: 'Credenciales caducadas',
                        icon: 'info',
                        text: 'Credenciales de seguridad caducadas. Vuelva a iniciar sesion',
                    }).then((result) => {
                        handleSession()                        
                    })
                }
            })
            .then(data => {
                //console.log(data)
                if (data) {
                    const formattedData = data.map(examen => ({
                        ...examen,
                        fecha: cambiarFormatoFecha(examen.fecha),
                    }));
                    setExamenes(formattedData);
                }
            })
    }

    const handleUploadAspirantes = async () => {
        if (aspirantesFile.length === 0) {
            Swal.fire({
                title: 'Archivo vacio',
                icon: 'warning',
                text: 'El archivo de aspirantes se encuentra vacio',
                confirmButtonText: 'Aceptar'
            })
        } else {
            const aspirantesFileFinal = await Promise.all(
                aspirantesFile.map(async (aspirante) => ({
                    ...aspirante,
                    examen_id: await searchExamenId(aspirante.aula, aspirante.turno, aspirante.fecha),
                }))
            );

            //console.log("Aspirantes a cargar", aspirantesFileFinal)

            const totalAspirantes = aspirantesFileFinal.length;
            let aspiranteCountOk = 0;
            let aspiranteCountError = 0;

            aspirantesFileFinal.forEach(aspirante => {
                //console.log(aspirante)
                fetch(`${HOST}/api/aspirantes/aspirante`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(aspirante),
                })
                    .then(response => {
                        if (response.status === 200) {
                            aspiranteCountOk++;
                            if (aspiranteCountOk + aspiranteCountError === totalAspirantes) {
                                Swal.fire({
                                    title: 'Aspirantes cargados',
                                    icon: 'success',
                                    text: 'Aspirantes cargados correctamente: ' + aspiranteCountOk + ' - Errores: ' + aspiranteCountError,
                                    confirmButtonText: 'Aceptar'
                                })
                            }
                        } else if (response.status === 403) {
                            Swal.fire({
                                title: 'Credenciales caducadas',
                                icon: 'info',
                                text: 'Credenciales de seguridad caducadas. Vuelva a iniciar sesion',
                            }).then((result) => {
                                handleSession()
                            })
                        } else {
                            aspiranteCountError++;
                        }
                    })
            })
        }
    }

    const handleUploadResultados = async () => {
        if (examenFile.length === 0) {
            Swal.fire({
                title: 'Archivo vacío',
                icon: 'warning',
                text: 'El archivo de aspirantes se encuentra vacío',
                confirmButtonText: 'Aceptar',
            });
            return;
        }

        if (!fechaCarga || !turnoCarga || !aulaCarga) {
            Swal.fire({
                title: 'Completar campos',
                icon: 'warning',
                confirmButtonText: 'Aceptar',
            });
            return;
        }

        const totalAspirantes = examenFile.length;
        let aspiranteCountOk = 0;
        let aspiranteCountError = 0;

        try {
            console.log("Iniciando procesamiento de resultados");
            for (const resultado of examenFile) {
                const aspiranteACargar = {
                    nota: resultado.nota,
                    presencia: 1,
                };

                try {
                    const response = await fetch(`${HOST}/api/aspirantes/update/${resultado.dni}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                        body: JSON.stringify(aspiranteACargar),
                    });

                    if (response.status === 200) {
                        aspiranteCountOk++;
                    } else if (response.status === 403) {
                        Swal.fire({
                            title: 'Credenciales caducadas',
                            icon: 'info',
                            text: 'Credenciales de seguridad caducadas. Vuelva a iniciar sesión',
                        }).then((result) => {
                            handleSession();
                        });
                        return;
                    } else {
                        console.warn(`Error en el fetch aspirante: ${response.status}`);
                        aspiranteCountError++;
                    }
                } catch (error) {
                    console.error(`Error actualizando aspirante DNI ${resultado.dni}:`, error.message);
                    aspiranteCountError++;
                }
            }

            if (aspiranteCountOk + aspiranteCountError === totalAspirantes) {
                console.log("Todos los aspirantes procesados");
                const examen = { estado: 1 };
                const examen_id = await searchExamenId(aulaCarga, turnoCarga, fechaCarga);

                if (!examen_id) {
                    console.error("Error: examen_id no encontrado");
                    throw new Error("No se encontró el examen_id");
                }

                console.log(`Examen ID encontrado: ${examen_id}`);
                const examenResponse = await fetch(`${HOST}/api/examenes/update/${examen_id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(examen),
                });

                if (examenResponse.status === 200) {
                    setAulaCarga('')
                    setFechaCarga('')
                    setTurnoCarga('')
                    estadoExamenes()
                    Swal.fire({
                        title: 'Notas cargadas',
                        icon: 'success',
                        text: `Aspirantes cargados correctamente: ${aspiranteCountOk} - Errores: ${aspiranteCountError}`,
                        confirmButtonText: 'Aceptar',
                    });
                } else if (examenResponse.status === 403) {
                    Swal.fire({
                        title: 'Credenciales caducadas',
                        icon: 'info',
                        text: 'Credenciales de seguridad caducadas. Vuelva a iniciar sesión',
                    }).then((result) => {
                        handleSession();
                    });
                } else {
                    console.error(`Error en examenResponse: ${examenResponse.status}`);
                }
            }
        } catch (error) {
            console.error("Error procesando resultados:", error.message);
            Swal.fire({
                title: 'Error',
                icon: 'error',
                text: 'Ocurrió un error al procesar los resultados. Intente nuevamente.',
                confirmButtonText: 'Aceptar',
            });
        }
    };

    const handleInputExamen = (e) => {
        const { name, value } = e.target;
        //console.log(name, value)
        if (name === 'fechaExamen') {
            setFechaExamen(value);
        } else if (name === 'turnoExamen') {
            setTurnoExamen(value);
        } else if (name === 'aulaExamen') {
            setAulaExamen(value);
        } else if (name === 'cantidadExamen') {
            setCantidadExamen(value);
        }
    }

    const handleInputCarga = (e) => {
        const { name, value } = e.target;
        console.log(name, value)
        if (name === 'fechaCarga') {
            setFechaCarga(value);
        } else if (name === 'turnoCarga') {
            setTurnoCarga(value);
        } else if (name === 'aulaCarga') {
            setAulaCarga(value);
        }
    }

    const handleCargaExamen = () => {
        //console.log("Cargando examen")

        const examenACargar = {
            fecha: fechaExamen,
            turno: turnoExamen,
            aula: aulaExamen,
            cantidad_inscriptos: cantidadExamen,
        }

        fetch(`${HOST}/api/examenes/examen`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(examenACargar),
        })
            .then(response => {
                if (response.status === 200) {
                    Swal.fire({
                        title: 'Examen cargado',
                        icon: 'success',
                        text: 'Examen cargado correctamente',
                        confirmButtonText: 'Aceptar'
                    }).then((result) => {
                        fetch(`${HOST}/api/examenes/estado`, {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                credentials: 'include',
                            })
                                .then(response => {
                                    if (response.status === 200) {
                                        return response.json();
                                    } else if (response.status === 403) {
                                        Swal.fire({
                                            title: 'Credenciales caducadas',
                                            icon: 'info',
                                            text: 'Credenciales de seguridad caducadas. Vuelva a iniciar sesion',
                                        }).then((result) => {
                                            handleSession()
                                            
                                        })
                                    }
                                })
                                .then(data => {
                                    //console.log(data)
                                    if (data) {
                                        const formattedData = data.map(examen => ({
                                            ...examen,
                                            fecha: cambiarFormatoFecha(examen.fecha),
                                        }));
                                        setExamenes(formattedData);
                                    }

                                    setAulaExamen('');
                                    setCantidadExamen('');
                                    setFechaExamen('');
                                    setTurnoExamen('');
                                })
                        
                    })
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
    }

    useEffect(() => {
        fetch(`${HOST}/api/examenes/estado`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        })
            .then(response => {
                if (response.status === 200) {
                    return response.json();
                } else if (response.status === 403) {
                    Swal.fire({
                        title: 'Credenciales caducadas',
                        icon: 'info',
                        text: 'Credenciales de seguridad caducadas. Vuelva a iniciar sesion',
                    }).then((result) => {
                        handleSession()
                    })
                }
            })
            .then(data => {
                //console.log(data)
                if (data) {
                    const formattedData = data.map(examen => ({
                        ...examen,
                        fecha: cambiarFormatoFecha(examen.fecha),
                    }));
                    setExamenes(formattedData);
                }
            })
    }, [])

    return (
        <div className='text-xs flex flex-col w-full h-full lg:relative lg:left-52'>
            <h1 className='text-[#005CA2] font-bold text-2xl'>CARGA</h1>
            <div className='flex flex-col justify-center items-center md:flex-row gap-4'>
                <div className='mt-6 min-h-60 w-full md:w-1/2 flex flex-col items-center justify-center bg-[#f0f0f0] rounded-md py-4'>
                    <h2 className='text-lg text-[#005CA2] mb-4 text-center w-full'>Carga aula, grupo y cantidad</h2>
                    <div className='flex flex-col justify-center items-center gap-4 w-full'>
                        <div className='flex flex-row'>
                            <div className='flex justify-end w-16'>
                                <label htmlFor="" className='pr-2'>Fecha:</label>
                            </div>
                            <input type="date" value={fechaExamen} className='w-36 px-2 bg-white' name='fechaExamen' onChange={(e) => handleInputExamen(e)} />
                        </div>
                        <div className='flex flex-row'>
                            <div className='flex justify-end w-16'>
                                <label htmlFor="" className='pr-2'>Turno:</label>
                            </div>
                            <select name="turnoExamen" id="" className='w-36 px-2 bg-white' value={turnoExamen} onChange={(e) => handleInputExamen(e)}>
                                <option value="" disabled>Seleccione turno</option>
                                <option value="T01">T01</option>
                                <option value="T02">T02</option>
                                <option value="T03">T03</option>
                                <option value="T04">T04</option>
                            </select>
                        </div>
                        <div className='flex flex-row'>
                            <div className='flex justify-end w-16'>
                                <label htmlFor="" className='pr-2'>Aula:</label>
                            </div>
                            <select name="aulaExamen" id="" className='w-36 px-2 bg-white' value={aulaExamen} onChange={(e) => handleInputExamen(e)}>
                                <option value="" disabled>Seleccione aula</option>
                                <option value="AULA 01">Aula 01</option>
                                <option value="AULA 02">Aula 02</option>
                                <option value="AULA 03">Aula 03</option>
                                <option value="AULA 04">Aula 04</option>
                            </select>
                        </div>
                        <div className='flex flex-row'>
                            <div className='flex justify-end w-16'>
                                <label htmlFor="" className='pr-2'>Cantidad:</label>
                            </div>
                            <input type="number" value={cantidadExamen} className='w-36 px-2 bg-white' name='cantidadExamen' onChange={(e) => handleInputExamen(e)} />
                        </div>
                        <button className='bg-[#005CA2] text-white w-fit px-10 py-1 rounded-md font-semibold' onClick={(handleCargaExamen)}>CARGAR</button>
                    </div>
                </div>
                <div className='mt-6 min-h-60 max-h-60 w-full md:w-1/2 flex flex-col items-center justify-center bg-[#f0f0f0] rounded-md py-4'>
                    <h2 className='text-lg text-[#005CA2] mb-2'>Carga aspirantes</h2>
                    <div className='flex flex-row  items-center justify-center'>
                        <div className='flex justify-center items-center w-full'>
                            <label htmlFor="" className=''>Archivo aspirantes:</label>
                        </div>
                        <input type="file" className='w-full bg-[#f0f0f0]' onChange={(e) => handleFileUpload(e)} />
                    </div>
                    <div className='pt-2 w-full overflow-scroll'>
                        <table className='w-full mx-4'>
                            <thead className='bg-[#005CA2] text-white'>
                                <tr>
                                    <th>DNI</th>
                                    <th>Apellido</th>
                                    <th>Nombre</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    aspirantesFile && aspirantesFile.map((aspirante) => {
                                        return (
                                            <tr key={aspirante.dni}>
                                                <td className='text-center'>{aspirante.dni}</td>
                                                <td className='text-center'>{aspirante.apellido}</td>
                                                <td className='text-center'>{aspirante.nombre}</td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                    <button className='bg-[#005CA2] mt-1 text-white w-fit px-10 py-1 rounded-md font-semibold' onClick={handleUploadAspirantes}>CARGAR ASPIRANTES</button>
                </div>
            </div>
            <div className='flex flex-col justify-center items-center md:flex-row gap-4 mt-2'>
                <div className='mt-6 min-h-60 w-full md:w-1/2 flex flex-col items-center justify-center bg-[#f0f0f0] rounded-md py-4'>
                    <h2 className='text-lg text-[#005CA2] mb-4'>Carga notas</h2>
                    <div className='flex flex-col justify-center items-center gap-4 w-full'>
                        <div className='flex flex-row'>
                            <div className='flex justify-end w-16'>
                                <label htmlFor="" className='pr-2'>Fecha:</label>
                            </div>
                            <input type="date" className='w-36 px-2 bg-white' name='fechaCarga' value={fechaCarga} onChange={(e) => handleInputCarga(e)} />
                        </div>
                        <div className='flex flex-row'>
                            <div className='flex justify-end w-16'>
                                <label htmlFor="" className='pr-2'>Turno:</label>
                            </div>
                            <select name="turnoCarga" id="" className='w-36 px-2 bg-white' value={turnoCarga} onChange={(e) => handleInputCarga(e)}>
                                <option value="" disabled>Seleccione turno</option>
                                <option value="T01">T01</option>
                                <option value="T02">T02</option>
                                <option value="T03">T03</option>
                                <option value="T04">T04</option>
                            </select>
                        </div>
                        <div className='flex flex-row'>
                            <div className='flex justify-end w-16'>
                                <label htmlFor="" className='pr-2'>Aula:</label>
                            </div>
                            <select name="aulaCarga" id="" className='w-36 px-2 bg-white' value={aulaCarga} onChange={(e) => handleInputCarga(e)}>
                                <option value="" disabled>Seleccione aula</option>
                                <option value="AULA 01">Aula 01</option>
                                <option value="AULA 02">Aula 02</option>
                                <option value="AULA 03">Aula 03</option>
                                <option value="AULA 04">Aula 04</option>
                            </select>
                        </div>
                        <div className='flex flex-row items-center justify-center'>
                            <div className='flex justify-center items-center w-36 pr-1'>
                                <label htmlFor="" className=''>Archivo notas:</label>
                            </div>
                            <input type="file" className='w-full px-2 bg-white' onChange={(e) => handleFileCargaUpload(e)} />
                        </div>
                        <button type="submit" className='bg-[#005CA2] text-white w-fit px-10 py-1 rounded-md font-semibold' onClick={handleUploadResultados}>CARGAR</button>
                    </div>
                </div>
                <div className='mt-6 min-h-60 max-h-60 w-full md:w-1/2 flex flex-row flex-wrap items-center justify-center bg-[#f0f0f0] rounded-md py-4 gap-4 overflow-scroll'>
                    <h2 className='text-lg text-[#005CA2] text-center w-full'>Notas a cargar</h2>
                    <table className='w-full max-h-36 min-h-36'>
                        <thead className='bg-[#005CA2] text-white'>
                            <tr>
                                <th>DNI</th>
                                <th>Apellido</th>
                                <th>Nombre</th>
                                <th>Nota</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                examenFile && examenFile.map((examenAspirante) => {
                                    return (
                                        <tr key={examenAspirante.dni}>
                                            <td className='text-center'>{examenAspirante.dni}</td>
                                            <td className='text-center'>{examenAspirante.apellido}</td>
                                            <td className='text-center'>{examenAspirante.nombre}</td>
                                            <td className='text-center'>{examenAspirante.nota}/20</td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </div>
            </div>
            <div className='mt-6 min-h-60 max-h-60 w-full flex flex-row flex-wrap items-center justify-center bg-[#005CA2]/75 rounded-md py-4 gap-4 overflow-scroll'>
                {
                    examenes.map((examen) => {
                        return (
                            <div className={`flex rounded-md w-28 h-auto flex-col justify-center items-center text-black px-2 py-1 ${examen.estado === 0 ? 'bg-[#f0f0f0]' : 'bg-green-300'}`} key={examen.id}>
                                <p className='text-center'>{examen.fecha}</p>
                                <div className='flex flex-row'>
                                    <p className='text-center'>{examen.aula} - </p>
                                    <p className='text-center'>{examen.turno}</p>
                                </div>

                                <p className='text-center'>{examen.cantidad_inscriptos}</p>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

export default Carga