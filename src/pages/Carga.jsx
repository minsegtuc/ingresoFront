import React, { useEffect, useContext, useState } from 'react'
import { ContextConfig } from '../context/ContextConfig';
import Swal from 'sweetalert2';
import { CiCircleInfo } from "react-icons/ci";
import { Tooltip } from 'react-tooltip';
import * as XLSX from 'xlsx';
import { data } from 'autoprefixer';
import { split } from 'postcss/lib/list';

const Carga = () => {

    const { HOST, handleSession } = useContext(ContextConfig);
    const [examenes, setExamenes] = useState([]);
    const [aspirantesFile, setAspirantesFile] = useState([]);
    const [preguntasFile, setPreguntasFile] = useState([])
    const [examenFile, setExamenFile] = useState([]);
    const [dataAspirantes, setDataAspirantes] = useState([]);

    //PARA CREAR UN EXAMEN
    const [fechaExamen, setFechaExamen] = useState('');
    const [turnoExamen, setTurnoExamen] = useState('');
    const [aulaExamen, setAulaExamen] = useState('');
    const [referenciaExamen, setReferenciaExamen] = useState('');
    const [cantidadExamen, setCantidadExamen] = useState('');

    //PARA ACTUALIZAR EXAMEN
    const [fechaExamenSearch, setFechaExamenSearch] = useState('');
    const [turnoExamenSearch, setTurnoExamenSearch] = useState('');
    const [aulaExamenSearch, setAulaExamenSearch] = useState('');
    const [idExamenUpdate, setIdExamenUpdate] = useState('')
    const [fechaExamenUpdate, setFechaExamenUpdate] = useState('');
    const [turnoExamenUpdate, setTurnoExamenUpdate] = useState('');
    const [aulaExamenUpdate, setAulaExamenUpdate] = useState('');
    const [estadoExamenUpdate, setEstadoExamenUpdate] = useState('');
    const [cantidadExamenUpdate, setCantidadExamenUpdate] = useState('');

    //PARA LAS NOTAS
    const [fechaCarga, setFechaCarga] = useState('');
    const [turnoCarga, setTurnoCarga] = useState('');
    const [aulaCarga, setAulaCarga] = useState('');

    //PARA ASPIRANTES
    const [dniSearch, setDniSearch] = useState('')
    const [nombre, setNombre] = useState('')
    const [apellido, setApellido] = useState('')
    const [genero, setGenero] = useState('')
    const [presencia, setPresencia] = useState('')
    const [nota, setNota] = useState('')
    const [examenIdAsp, setExamenIdAsp] = useState('')
    const [examenIdAspActual, setExamenIdAspActual] = useState('')

    const [loadingCargaExamen, setLoadinCargaExamen] = useState(false)
    const [loadingCargaAspirantes, setLoadinCargaAspirantes] = useState(false)
    const [loadingCargaNotas, setLoadinCargaNotas] = useState(false)
    const [loadingSearchExamen, setLoadingSearchExamen] = useState(false)
    const [loadingSearchAspirante, setLoadingSearchAspirante] = useState(false)
    const [loadingUpdateExamen, setLoadinUpdateExamen] = useState(false)
    const [loadingUpdateAspirante, setLoadingUpdateAspirante] = useState(false)

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

            const startColumnIndex = 10;
            const endColumnIndex = 29;

            const preguntas = [];

            bodyData.forEach((row) => {
                row.slice(startColumnIndex, endColumnIndex + 1).forEach((value, index) => {
                    const questionKey = `Q${index + 1}`;
                    const currentIndex = preguntas.findIndex(q => q.numero === questionKey);

                    if (currentIndex === -1) {
                        preguntas.push({
                            numero: questionKey,
                            correcta: value === 1 ? 1 : 0,
                            incorrecta: value === 0 ? 1 : 0,
                        });
                    } else {
                        if (value === 1) preguntas[currentIndex].correcta += 1;
                        if (value === 0) preguntas[currentIndex].incorrecta += 1;
                    }
                });
            });


            const resultados = bodyData.map((resultado) => {
                return {
                    dni: resultado[2],
                    apellido: resultado[5],
                    nombre: resultado[4],
                    nota: resultado[7],
                }
            })

            setPreguntasFile(preguntas);
            setExamenFile(resultados);
        }

        reader.readAsArrayBuffer(file);
    }

    const processInChunks = async (items, chunkSize, callback) => {
        for (let i = 0; i < items.length; i += chunkSize) {
            const chunk = items.slice(i, i + chunkSize);
            await Promise.all(chunk.map(callback));
        }
    };

    const searchExamenId = async (aula, turno, fecha) => {
        console.log("Aula, turno y fecha: ", aula, turno, fecha)
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
                title: 'Archivo vacío',
                icon: 'warning',
                text: 'El archivo de aspirantes se encuentra vacío',
                confirmButtonText: 'Aceptar'
            });
        } else {
            setLoadinCargaAspirantes(true);
            const aspirantesFileFinal = [];

            await processInChunks(aspirantesFile, 10, async (aspirante) => {
                const examen_id = await searchExamenId(aspirante.aula, aspirante.turno, aspirante.fecha);
                aspirantesFileFinal.push({ ...aspirante, examen_id });
            });

            const totalAspirantes = aspirantesFileFinal.length;
            let aspiranteCountOk = 0;
            let erroresAspirantes = []; // Aquí guardaremos los aspirantes con errores

            await processInChunks(aspirantesFileFinal, 10, async (aspirante) => {
                const aspiranteACargar = {
                    dni: aspirante.dni,
                    nombre: aspirante.nombre,
                    apellido: aspirante.apellido,
                    genero: aspirante.genero,
                };

                const examenAspirante = {
                    examen_id: aspirante.examen_id,
                    aspirante_dni: aspirante.dni,
                };

                try {
                    const aspiranteExistsResponse = await fetch(`${HOST}/api/aspirantes/${aspirante.dni}`, {
                        method: 'GET',
                        credentials: 'include',
                    });
                    const aspiranteExistsData = await aspiranteExistsResponse.json();

                    if (Array.isArray(aspiranteExistsData) && aspiranteExistsData.length > 0) {
                        const examenResponse = await fetch(`${HOST}/api/examenAspirantes/examenAspirante`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify(examenAspirante),
                        });

                        if (examenResponse.status === 200) {
                            aspiranteCountOk++;
                        } else {
                            // Error al vincular aspirante con examen
                            erroresAspirantes.push({ ...aspirante, error: 'Error al vincular con el examen' });
                        }
                    } else {
                        const createResponse = await fetch(`${HOST}/api/aspirantes/aspirante`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify(aspiranteACargar),
                        });

                        if (createResponse.status === 200) {
                            const examenResponse = await fetch(`${HOST}/api/examenAspirantes/examenAspirante`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify(examenAspirante),
                            });

                            if (examenResponse.status === 200) {
                                aspiranteCountOk++;
                            } else {
                                // Error al vincular aspirante recién creado con examen
                                erroresAspirantes.push({ ...aspirante, error: 'Error al vincular con el examen (aspirante nuevo)' });
                            }
                        } else {
                            // Error al crear el aspirante
                            erroresAspirantes.push({ ...aspirante, error: 'Error al crear el aspirante' });
                        }
                    }
                } catch (error) {
                    // Error de red o en alguna de las peticiones
                    erroresAspirantes.push({ ...aspirante, error: 'Error de conexión o en la API' });
                }
            });

            setLoadinCargaAspirantes(false);

            // Muestra el resultado final con detalles de los errores
            const aspiranteCountError = erroresAspirantes.length;
            if (aspiranteCountError > 0) {
                // Muestra los errores en un formato legible
                const erroresHtml = erroresAspirantes.map(err => `
                <li>**DNI:** ${err.dni}, **Nombre:** ${err.nombre}, **Error:** ${err.error}</li>
            `).join('');

                Swal.fire({
                    title: 'Carga finalizada con errores',
                    icon: 'warning',
                    html: `
                    <p>Aspirantes cargados correctamente: ${aspiranteCountOk}</p>
                    <p>Errores: ${aspiranteCountError}</p>
                    <p>Lista de aspirantes con errores:</p>
                    <ul style="text-align: left;">
                        ${erroresHtml}
                    </ul>
                `,
                    confirmButtonText: 'Aceptar'
                });
                console.error("Aspirantes con errores:", erroresAspirantes); // Para depuración
            } else {
                Swal.fire({
                    title: 'Carga finalizada',
                    icon: 'success',
                    text: `Aspirantes cargados correctamente: ${aspiranteCountOk} - Errores: ${aspiranteCountError}`,
                    confirmButtonText: 'Aceptar'
                });
            }
        }
    };

    const handleUploadResultados = async () => {
        setLoadinCargaNotas(true)
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

        const [dia, mes, año] = fechaCarga.split('-');
        const fechaFormatted = `${año}-${mes}-${dia}`

        const examenCheck = examenes.some(examen =>
            examen.turno === turnoCarga &&
            examen.fecha === fechaFormatted &&
            examen.aula === aulaCarga &&
            examen.estado === 0
        );

        if (examenCheck) {

            const examen_id = await searchExamenId(aulaCarga, turnoCarga, fechaCarga);
            console.log("Examen chequeado: ", examen_id)

            try {
                for (const resultado of examenFile) {
                    const aspiranteACargar = {
                        dni: resultado.dni,
                        nota: resultado.nota,
                        presencia: 1,
                        examen_id_actual: examen_id,
                    };

                    try {
                        const response = await fetch(`${HOST}/api/examenAspirantes/update`, {
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
                    // console.log("Todos los aspirantes procesados");
                    const examen = { estado: 1 };
                    const examen_id = await searchExamenId(aulaCarga, turnoCarga, fechaCarga);

                    if (!examen_id) {
                        console.error("Error: examen_id no encontrado");
                        throw new Error("No se encontró el examen_id");
                    }

                    // console.log(`Examen ID encontrado: ${examen_id}`);
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
                        setLoadinCargaNotas(false)
                        Swal.fire({
                            title: 'Notas cargadas',
                            icon: 'success',
                            text: `Aspirantes cargados correctamente: ${aspiranteCountOk} - Errores: ${aspiranteCountError}`,
                            confirmButtonText: 'Aceptar',
                        });
                    } else if (examenResponse.status === 403) {
                        setLoadinCargaNotas(false)
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
                setLoadinCargaNotas(false)
                Swal.fire({
                    title: 'Error',
                    icon: 'error',
                    text: 'Ocurrió un error al procesar los resultados. Intente nuevamente.',
                    confirmButtonText: 'Aceptar',
                });
            }
        } else {
            Swal.fire({
                title: 'Examen repetido',
                icon: 'error',
                text: 'El examen que esta intentando cargar ya se encuentra cargado',
                confirmButtonText: 'Aceptar',
            });
        }

    };

    const handleInputExamen = (e) => {
        const { name, value } = e.target;
        //console.log(name, value)
        if (name === 'fechaExamen') {
            setFechaExamen(value);
        }
        if (name === 'turnoExamen') {
            setTurnoExamen(value);
        }
        if (name === 'aulaExamen') {
            setAulaExamen(value);
        }
        if (name === 'cantidadExamen') {
            setCantidadExamen(value);
        }
        if (name === 'referenciaExamen') {
            setReferenciaExamen(value);
        }
    }

    const handleInputCarga = (e) => {
        const { name, value } = e.target;
        // console.log(name, value)
        if (name === 'fechaCarga') {
            setFechaCarga(value);
        }
        if (name === 'turnoCarga') {
            setTurnoCarga(value);
        }
        if (name === 'aulaCarga') {
            setAulaCarga(value);
        }
    }

    const handleInputExamenUpdate = (e) => {
        const { name, value } = e.target;
        // console.log("Name y value: " , name, value)
        if (name === 'fechaExamenSearch') {
            setFechaExamenSearch(value);
        }
        if (name === 'turnoExamenSearch') {
            setTurnoExamenSearch(value);
        }
        if (name === 'aulaExamenSearch') {
            setAulaExamenSearch(value);
        }
        if (name === 'idExamenUpdate') {
            setIdExamenUpdate(value)
        }
        if (name === 'fechaExamenUpdate') {
            setFechaExamenUpdate(value)
        }
        if (name === 'turnoExamenUpdate') {
            setTurnoExamenUpdate(value)
        }
        if (name === 'aulaExamenUpdate') {
            setAulaExamenUpdate(value)
        }
        if (name === 'estadoExamenUpdate') {
            setEstadoExamenUpdate(value)
        }
        if (name === 'cantidadExamenUpdate') {
            setCantidadExamenUpdate(value)
        }
    }

    const handleInputAspiranteUpdate = (e) => {
        const { name, value } = e.target;

        if (name === 'dniSearch') {
            setDniSearch(value);
        }
        if (name === 'nombre') {
            setNombre(value);
        }
        if (name === 'apellido') {
            setApellido(value);
        }
        if (name === 'genero') {
            setGenero(value)
        }
        if (name === 'presencia') {
            setPresencia(value)
        }
        if (name === 'nota') {
            setNota(value)
        }
        if (name === 'examenIdAsp') {
            setExamenIdAsp(value)
        }
    }

    const handleSearchExamen = () => {
        if (fechaExamenSearch && turnoExamenSearch && aulaExamenSearch) {
            setLoadingSearchExamen(true)
            const examenSearch = {
                fecha: fechaExamenSearch,
                turno: turnoExamenSearch,
                aula: aulaExamenSearch
            }
            fetch(`${HOST}/api/examenes/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(examenSearch),
            })
                .then(response => {
                    if (response.status === 200) {
                        setLoadingSearchExamen(false)
                        return response.json();
                    } else if (response.status === 403) {
                        setLoadingSearchExamen(false)
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
                    setIdExamenUpdate(data.id_examen)
                    setFechaExamenUpdate(data.fecha)
                    setTurnoExamenUpdate(data.turno)
                    setAulaExamenUpdate(data.aula)
                    setEstadoExamenUpdate(data.estado)
                    setCantidadExamenUpdate(data.cantidad_inscriptos)
                })
        } else {
            Swal.fire({
                title: 'Campos imcompletos',
                icon: 'info',
                text: 'Faltan campos por completar para iniciar una busqueda'
            })
        }
    }

    const handleSearchAspirante = () => {
        if (dniSearch) {
            setLoadingSearchAspirante(true)
            fetch(`${HOST}/api/aspirantes/${dniSearch}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            })
                .then(response => {
                    if (response.status === 200) {
                        setLoadingSearchAspirante(false)
                        fetch(`${HOST}/api/examenAspirantes/${dniSearch}`, {
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
                                        text: 'Credenciales de seguridad caducadas. Vuelva a iniciar sesion'
                                    }).then((result) => {
                                        handleSession()
                                    })
                                }
                            })
                            .then(data => {
                                console.log(data)
                                setDataAspirantes(data)
                            })
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
                    setNombre(data[0].nombre)
                    setApellido(data[0].apellido)
                    setGenero(data[0].genero)
                    // setPresencia(data[0].presencia)
                    // setNota(data[0].nota)
                    // setExamenIdAsp(data[0].examen_id)
                })
        } else {
            setLoadingSearchAspirante(false)
            Swal.fire({
                title: 'Campos imcompletos',
                icon: 'info',
                text: 'Faltan campos por completar para iniciar una busqueda'
            })
        }
    }

    const handleUpdateExamen = () => {
        //console.log(idExamenUpdate, fechaExamenUpdate, turnoExamenUpdate, aulaExamenUpdate, estadoExamenUpdate, cantidadExamenUpdate)
        if (
            String(idExamenUpdate).trim() !== '' &&
            String(fechaExamenUpdate).trim() !== '' &&
            String(turnoExamenUpdate).trim() !== '' &&
            String(aulaExamenUpdate).trim() !== '' &&
            String(estadoExamenUpdate).trim() !== '' &&
            String(cantidadExamenUpdate).trim() !== ''
        ) {
            setLoadinUpdateExamen(true)
            const examenUpdate = {
                id_examen: idExamenUpdate,
                fecha: fechaExamenUpdate,
                turno: turnoExamenUpdate,
                aula: aulaExamenUpdate,
                estado: estadoExamenUpdate,
                cantidad_inscriptos: cantidadExamenUpdate,
            }

            fetch(`${HOST}/api/examenes/update/${idExamenUpdate}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(examenUpdate),
            })
                .then(response => {
                    if (response.status === 200) {
                        setLoadinUpdateExamen(false)
                        Swal.fire({
                            title: 'Examen actualizado',
                            icon: 'success',
                            text: 'Examen actualizado correctamente',
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
                                    if (data) {
                                        const formattedData = data.map(examen => ({
                                            ...examen,
                                            fecha: cambiarFormatoFecha(examen.fecha),
                                        }));
                                        setExamenes(formattedData);
                                    }

                                    setAulaExamenSearch('');
                                    setFechaExamenSearch('');
                                    setTurnoExamenSearch('');
                                    setFechaExamenUpdate('')

                                    setIdExamenUpdate('')
                                    setFechaExamenUpdate('')
                                    setTurnoExamenUpdate('')
                                    setAulaExamenUpdate('')
                                    setEstadoExamenUpdate('')
                                    setCantidadExamenUpdate('')
                                })

                        })
                    } else if (response.status === 403) {
                        setLoadinUpdateExamen(false)
                        Swal.fire({
                            title: 'Credenciales caducadas',
                            icon: 'info',
                            text: 'Credenciales de seguridad caducadas. Vuelva a iniciar sesion'
                        }).then((result) => {
                            handleSession()
                        })
                    }
                })
        } else {
            setLoadinUpdateExamen(false)
            Swal.fire({
                title: 'Campos imcompletos',
                icon: 'info',
                text: 'Faltan campos por completar para actualizar el examen'
            })
        }
    }

    const handleUpdateAspirante = () => {
        if (nombre, apellido, genero, presencia, nota, examenIdAsp, dniSearch) {
            setLoadingUpdateAspirante(true)
            const aspiranteUpdate = {
                dni: dniSearch,
                // nombre,
                // apellido,
                // genero,
                presencia,
                nota,
                examen_id_actual: examenIdAspActual,
                examen_id: examenIdAsp
            }

            fetch(`${HOST}/api/examenAspirantes/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(aspiranteUpdate),
            })
                .then(response => {
                    if (response.status === 200) {
                        setLoadingUpdateAspirante(false)
                        setDniSearch('')
                        setNombre('')
                        setApellido('')
                        setGenero('')
                        setPresencia('')
                        setNota('')
                        setExamenIdAsp('')
                        setDataAspirantes([])

                        Swal.fire({
                            title: 'Aspirante actualizado',
                            icon: 'success',
                            text: 'Aspirante actualizado correctamente',
                            confirmButtonText: 'Aceptar'
                        })
                        return response.json();
                    } else if (response.status === 403) {
                        setLoadingUpdateAspirante(false)
                        Swal.fire({
                            title: 'Credenciales caducadas',
                            icon: 'info',
                            text: 'Credenciales de seguridad caducadas. Vuelva a iniciar sesion',
                        }).then((result) => {
                            handleSession()
                        })
                    }
                })
        } else {
            setLoadingUpdateAspirante(false)
            Swal.fire({
                title: 'Campos imcompletos',
                icon: 'info',
                text: 'Faltan campos por completar para actualizar el aspirante'
            })
        }
    }

    const handleCargaExamen = () => {
        if (fechaExamen && turnoExamen && aulaExamen && cantidadExamen) {
            setLoadinCargaExamen(true)

            const examenACargar = {
                fecha: fechaExamen,
                turno: turnoExamen,
                aula: aulaExamen,
                referencia: referenciaExamen,
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
                            setLoadinCargaExamen(false)
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
                                    setReferenciaExamen('');
                                })

                        })
                    } else if (response.status === 403) {
                        setLoadinCargaExamen(false)
                        Swal.fire({
                            title: 'Credenciales caducadas',
                            icon: 'info',
                            text: 'Credenciales de seguridad caducadas. Vuelva a iniciar sesion'
                        }).then((result) => {
                            handleSession()
                        })
                    }
                })
        } else {
            setLoadinCargaExamen(false)
            Swal.fire({
                title: 'Campos faltantes',
                icon: 'info',
                text: 'Faltan campos por completar',
            })
        }
    }

    const handleSelectAspirante = (presenciaU, nota, examen_id) => {
        setPresencia(presenciaU)
        setNota(nota)
        setExamenIdAspActual(examen_id)
        setExamenIdAsp(examen_id)
    }

    const handleSelectExamen = (examen) => {
        const fechaFormatted = split(examen.fecha, '-');
        setIdExamenUpdate(examen.id_examen)
        setFechaExamenUpdate(`${fechaFormatted[2]}-${fechaFormatted[1]}-${fechaFormatted[0]}`)
        setTurnoExamenUpdate(examen.turno)
        setAulaExamenUpdate(examen.aula)
        setEstadoExamenUpdate(examen.estado)
        setCantidadExamenUpdate(examen.cantidad_inscriptos)
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


    // useEffect(() => {
    //     console.log(preguntasFile)
    // }, [preguntasFile])

    return (
        <div className='text-xs flex flex-col w-full h-full lg:relative lg:left-52'>
            <h1 className='text-[#005CA2] font-bold text-2xl'>CARGA</h1>
            <div className='flex flex-col justify-center items-center md:flex-row gap-4'>
                <div className='mt-6 min-h-72 max-h-72 w-full md:w-1/2 flex flex-col items-center justify-center bg-[#f0f0f0] rounded-md py-4'>
                    <div className='flex flex-row items-center'>
                        <h2 className='text-lg text-[#005CA2] pb-4 text-center w-full'>Carga aula, grupo y cantidad</h2>
                        <CiCircleInfo className='text-lg text-[#005CA2] mb-3 ml-2' data-tooltip-id="tooltip1" data-tooltip-html="
                        <div style='max-width: 170px; text-align: center; background-color: #005CA2; color: white; border-radius: 8px;'>
                            <p>
                                En esta sección se cargan todos los atributos de cada examen distinguiéndolos por sus atributos únicos: fecha, turno y aula.
                            </p>
                            </div>"/>
                        <Tooltip
                            id="tooltip1"
                            events={['click']}
                            place='right'
                            style={{ backgroundColor: "#005CA2" }}
                        />
                    </div>
                    <div className='flex flex-col justify-center items-center gap-4 w-full'>
                        <div className='flex flex-row'>
                            <div className='flex justify-end w-16'>
                                <label htmlFor="" className='pr-2'>Fecha:</label>
                            </div>
                            <input type="date" value={fechaExamen} className='w-36 px-2 bg-white border border-gray-400 rounded-md ' name='fechaExamen' onChange={(e) => handleInputExamen(e)} />
                        </div>
                        <div className='flex flex-row'>
                            <div className='flex justify-end w-16'>
                                <label htmlFor="" className='pr-2'>Turno:</label>
                            </div>
                            <select name="turnoExamen" id="" className='w-36 px-2 bg-white border border-gray-400 rounded-md' value={turnoExamen} onChange={(e) => handleInputExamen(e)}>
                                <option value="" disabled>Seleccione turno</option>
                                <option value="T01">T01</option>
                                <option value="T02">T02</option>
                                <option value="T03">T03</option>
                                <option value="T04">T04</option>
                                <option value="T05">T05</option>
                                <option value="T06">T06</option>
                            </select>
                        </div>
                        <div className='flex flex-row'>
                            <div className='flex justify-end w-16'>
                                <label htmlFor="" className='pr-2'>Aula:</label>
                            </div>
                            <select name="aulaExamen" id="" className='w-36 px-2 bg-white border border-gray-400 rounded-md' value={aulaExamen} onChange={(e) => handleInputExamen(e)}>
                                <option value="" disabled>Seleccione aula</option>
                                <option value="AULA 01">Aula 01</option>
                                <option value="AULA 02">Aula 02</option>
                                <option value="AULA 03">Aula 03</option>
                                <option value="AULA 04">Aula 04</option>
                                <option value="AULA 05">Aula 05</option>
                            </select>
                        </div>
                        <div className='flex flex-row'>
                            <div className='flex justify-end w-16'>
                                <label htmlFor="" className='pr-2'>Referencia:</label>
                            </div>
                            <input type="text" value={referenciaExamen} className='w-36 px-2 bg-white border border-gray-400 rounded-md' name='referenciaExamen' onChange={(e) => handleInputExamen(e)} />
                        </div>
                        <div className='flex flex-row'>
                            <div className='flex justify-end w-16'>
                                <label htmlFor="" className='pr-2'>Cantidad:</label>
                            </div>
                            <input type="number" value={cantidadExamen} className='w-36 px-2 bg-white border border-gray-400 rounded-md' name='cantidadExamen' onChange={(e) => handleInputExamen(e)} />
                        </div>
                        <button className={`bg-[#005CA2] text-white w-fit px-10 py-1 rounded-md font-semibold ${loadingCargaExamen ? 'animate-pulse' : 'animate-none'}`} onClick={(handleCargaExamen)}>CARGAR</button>
                    </div>
                </div>
                <div className='mt-6 min-h-72 max-h-72 w-full md:w-1/2 flex flex-col items-center justify-center bg-[#f0f0f0] rounded-md py-4'>
                    <div className='flex flex-row items-center justify-center'>
                        <h2 className='text-lg text-[#005CA2] mb-2'>Carga aspirantes</h2>
                        <CiCircleInfo className='text-lg text-[#005CA2] mb-1 ml-2' data-tooltip-id="tooltip2" data-tooltip-html="
                        <div style='max-width: 170px; text-align: center; background-color: #005CA2; color: white; border-radius: 8px;'>
                            <p>
                                El archivo a cargar debe ser un archivo .xlsx con las siguientes columnas en este orden: dni, apellido, nombre, genero (M o F), aula (AULA 01), turno (T01), fecha (YYYY-MM-DD).
                            </p>
                            </div>"/>
                        <Tooltip
                            id="tooltip2"
                            events={['click']}
                            place='right'
                            style={{ backgroundColor: "#005CA2" }}
                        />
                    </div>
                    <p className='text-xs text-red-500 mb-4 font-semibold'>¡El aula y turno del aspirante debe estar previamente cargado!</p>
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
                    <button className={`bg-[#005CA2] mt-1 text-white w-fit px-10 py-1 rounded-md font-semibold ${loadingCargaAspirantes ? 'animate-pulse' : 'animate-none'}`} onClick={handleUploadAspirantes}>CARGAR ASPIRANTES</button>
                </div>
            </div>
            <div className='flex flex-col justify-center items-center md:flex-row gap-4 mt-2'>
                <div className='mt-6 min-h-60 w-full md:w-1/2 flex flex-col items-center justify-center bg-[#f0f0f0] rounded-md py-4'>
                    <div className='flex flex-row justify-center items-center'>
                        <h2 className='text-lg text-[#005CA2] mb-4'>Carga notas</h2>
                        <CiCircleInfo className='text-lg text-[#005CA2] mb-3 ml-2' data-tooltip-id="tooltip2" data-tooltip-html="
                        <div style='max-width: 170px; text-align: center; background-color: #005CA2; color: white; border-radius: 8px;'>
                            <p>
                                El archivo de notas a cargar es el formato estadar descargado desde zip-grade. Ademas se debe completar los parametros para identificar al examen unico.
                            </p>
                            </div>"/>
                        <Tooltip
                            id="tooltip2"
                            events={['click']}
                            place='right'
                            style={{ backgroundColor: "#005CA2" }}
                        />
                    </div>
                    <div className='flex flex-col justify-center items-center gap-4 w-full'>
                        <div className='flex flex-row'>
                            <div className='flex justify-end w-16'>
                                <label htmlFor="" className='pr-2'>Fecha:</label>
                            </div>
                            <input type="date" className='w-36 px-2 bg-white border border-gray-400 rounded-md' name='fechaCarga' value={fechaCarga} onChange={(e) => handleInputCarga(e)} />
                        </div>
                        <div className='flex flex-row'>
                            <div className='flex justify-end w-16'>
                                <label htmlFor="" className='pr-2'>Turno:</label>
                            </div>
                            <select name="turnoCarga" id="" className='w-36 px-2 bg-white border border-gray-400 rounded-md' value={turnoCarga} onChange={(e) => handleInputCarga(e)}>
                                <option value="" disabled>Seleccione turno</option>
                                <option value="T01">T01</option>
                                <option value="T02">T02</option>
                                <option value="T03">T03</option>
                                <option value="T04">T04</option>
                                <option value="T05">T05</option>
                                <option value="T06">T06</option>
                            </select>
                        </div>
                        <div className='flex flex-row'>
                            <div className='flex justify-end w-16'>
                                <label htmlFor="" className='pr-2'>Aula:</label>
                            </div>
                            <select name="aulaCarga" id="" className='w-36 px-2 bg-white border border-gray-400 rounded-md' value={aulaCarga} onChange={(e) => handleInputCarga(e)}>
                                <option value="" disabled>Seleccione aula</option>
                                <option value="AULA 01">Aula 01</option>
                                <option value="AULA 02">Aula 02</option>
                                <option value="AULA 03">Aula 03</option>
                                <option value="AULA 04">Aula 04</option>
                                <option value="AULA 05">Aula 05</option>
                            </select>
                        </div>
                        <div className='flex flex-row items-center justify-center'>
                            <div className='flex justify-center items-center w-36 pr-1'>
                                <label htmlFor="" className=''>Archivo notas:</label>
                            </div>
                            <input type="file" className='w-full px-2 bg-white' onChange={(e) => handleFileCargaUpload(e)} />
                        </div>
                        <button type="submit" className={`bg-[#005CA2] text-white w-fit px-10 py-1 rounded-md font-semibold ${loadingCargaNotas ? 'animate-pulse' : 'animate-none'}`} onClick={handleUploadResultados}>CARGAR</button>
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
            {/* ESTADO EXAMENES */}
            <div className='mt-6 min-h-64 max-h-96 w-full flex flex-row flex-wrap items-center justify-center bg-[#005CA2]/75 rounded-md py-4 gap-4 overflow-scroll cursor-pointer'>
                {
                    examenes.map((examen) => {
                        return (
                            <div className={`flex rounded-md w-48 h-auto flex-col justify-center items-center text-black px-2 py-1 ${examen.estado === 0 ? 'bg-[#f0f0f0]' : 'bg-green-300'}`} key={examen.id_examen} onClick={() => handleSelectExamen(examen)}>
                                <p className='text-center font-bold'>ID: {examen.id_examen}{examen.referencia ? ` - ${examen.referencia}` : ""}</p>
                                <div className="flex flex-row flex-nowrap">
                                    <p className='font-bold pr-1'>FECHA:</p>
                                    <p className='text-center'>{examen.fecha}</p>
                                </div>
                                <div className='flex flex-row flex-nowrap'>
                                    <p className='font-bold pr-1'>AULA Y TURNO:</p>
                                    <p className='text-center'>{examen.aula} - </p>
                                    <p className='text-center'>{examen.turno}</p>
                                </div>
                                <div className='flex flex-row flex-nowrap'>
                                    <p className='font-bold pr-1'>INSCRIPTOS:</p>
                                    <p className='text-center'>{examen.cantidad_inscriptos}</p>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
            {/* MODIFICAR EXAMEN */}
            <div className='mt-6 min-h-60 md:max-h-60 w-full flex flex-col bg-[#F0F0F0] rounded-md py-4 gap-4'>
                <h2 className='text-lg text-[#005CA2] mb-4 text-left w-full pl-3'>Modificar examen</h2>
                <div className='w-full h-auto flex flex-col md:flex-row'>
                    <div className='w-full md:w-1/4 h-auto flex flex-col gap-5 justify-center items-center md:items-start border-b-[1px] md:border-b-0 md:border-r-[1px] border-gray-400 mb-4 pb-6 md:pb-0 md:mb-0'>
                        <div className='flex flex-row'>
                            <div className='flex justify-end w-16'>
                                <label htmlFor="" className='pr-2'>Fecha:</label>
                            </div>
                            <input type="date" value={fechaExamenSearch} className='w-36 px-2 bg-white border border-gray-400 rounded-md' name='fechaExamenSearch' onChange={(e) => handleInputExamenUpdate(e)} />
                        </div>
                        <div className='flex flex-row'>
                            <div className='flex justify-end w-16'>
                                <label htmlFor="" className='pr-2'>Turno:</label>
                            </div>
                            <select name="turnoExamenSearch" id="" className='w-36 px-2 bg-white border border-gray-400 rounded-md' value={turnoExamenSearch} onChange={(e) => handleInputExamenUpdate(e)}>
                                <option value="" disabled>Seleccione turno</option>
                                <option value="T01">T01</option>
                                <option value="T02">T02</option>
                                <option value="T03">T03</option>
                                <option value="T04">T04</option>
                                <option value="T05">T05</option>
                                <option value="T06">T06</option>
                            </select>
                        </div>
                        <div className='flex flex-row'>
                            <div className='flex justify-end w-16'>
                                <label htmlFor="" className='pr-2'>Aula:</label>
                            </div>
                            <select name="aulaExamenSearch" id="" className='w-36 px-2 bg-white border border-gray-400 rounded-md' value={aulaExamenSearch} onChange={(e) => handleInputExamenUpdate(e)}>
                                <option value="" disabled>Seleccione aula</option>
                                <option value="AULA 01">Aula 01</option>
                                <option value="AULA 02">Aula 02</option>
                                <option value="AULA 03">Aula 03</option>
                                <option value="AULA 04">Aula 04</option>
                                <option value="AULA 05">Aula 05</option>
                            </select>
                        </div>
                        <div className='flex flex-row justify-center items-center w-full'>
                            <button className={`bg-[#005CA2] text-white w-fit px-10 py-[1px] rounded-md font-semibold ${loadingSearchExamen ? 'animate-pulse' : 'animate-none'}`} onClick={handleSearchExamen}>Buscar</button>
                        </div>
                    </div>
                    <div className='w-full md:w-3/4 h-auto flex flex-col md:flex-row justify-center items-center md:ml-8 gap-5'>
                        <div className='w-1/3 flex flex-col gap-4 items-center justify-center h-full'>
                            <div className='flex flex-row'>
                                <div className='flex justify-end w-16 md:w-32'>
                                    <label htmlFor="" className='pr-2 text-nowrap'>Id examen:</label>
                                </div>
                                <input type="text" value={idExamenUpdate} className='w-36 px-2 bg-white border border-gray-400 rounded-md' name='idExamenUpdate' onChange={(e) => handleInputExamenUpdate(e)} disabled />
                            </div>
                            <div className='flex flex-row'>
                                <div className='flex justify-end w-16 md:w-32'>
                                    <label htmlFor="" className='pr-2'>Fecha:</label>
                                </div>
                                <input type="date" value={fechaExamenUpdate} className='w-36 px-2 bg-white border border-gray-400 rounded-md' name='fechaExamenUpdate' onChange={(e) => handleInputExamenUpdate(e)} />
                            </div>
                            <div className='flex flex-row'>
                                <div className='flex justify-end w-16 md:w-32'>
                                    <label htmlFor="" className='pr-2'>Turno:</label>
                                </div>
                                <select name="turnoExamenUpdate" id="" className='w-36 px-2 bg-white border border-gray-400 rounded-md' value={turnoExamenUpdate} onChange={(e) => handleInputExamenUpdate(e)}>
                                    <option value="" disabled>Seleccione turno</option>
                                    <option value="T01">T01</option>
                                    <option value="T02">T02</option>
                                    <option value="T03">T03</option>
                                    <option value="T04">T04</option>
                                    <option value="T05">T05</option>
                                    <option value="T06">T06</option>
                                </select>
                            </div>
                        </div>
                        <div className='w-1/3 flex flex-col gap-4 items-center justify-center h-full'>
                            <div className='flex flex-row'>
                                <div className='flex justify-end w-16 md:w-32'>
                                    <label htmlFor="" className='pr-2'>Aula:</label>
                                </div>
                                <select name="aulaExamenUpdate" id="" className='w-36 px-2 bg-white border border-gray-400 rounded-md' value={aulaExamenUpdate} onChange={(e) => handleInputExamenUpdate(e)}>
                                    <option value="" disabled>Seleccione aula</option>
                                    <option value="AULA 01">Aula 01</option>
                                    <option value="AULA 02">Aula 02</option>
                                    <option value="AULA 03">Aula 03</option>
                                    <option value="AULA 04">Aula 04</option>
                                    <option value="AULA 05">Aula 05</option>
                                </select>
                            </div>
                            <div className='flex flex-row'>
                                <div className='flex justify-end w-16 md:w-32'>
                                    <label htmlFor="" className='pr-2'>Estado:</label>
                                </div>
                                <input type="text" value={estadoExamenUpdate} className='w-36 px-2 bg-white border border-gray-400 rounded-md' name='estadoExamenUpdate' onChange={(e) => handleInputExamenUpdate(e)} />
                            </div>
                            <div className='flex flex-row'>
                                <div className='flex justify-end w-16 md:w-32'>
                                    <label htmlFor="" className='pr-2 text-nowrap'>Cantidad inscriptos:</label>
                                </div>
                                <input type="text" value={cantidadExamenUpdate} className='w-36 px-2 bg-white border border-gray-400 rounded-md' name='cantidadExamenUpdate' onChange={(e) => handleInputExamenUpdate(e)} />
                            </div>
                        </div>
                        <div className='w-1/3 flex justify-center'>
                            <button className={`bg-[#005CA2] text-white w-fit px-10 py-1 rounded-md font-semibold ${loadingUpdateExamen ? 'animate-pulse' : 'animate-none'}`} onClick={handleUpdateExamen}>ACTUALIZAR</button>
                        </div>
                    </div>
                </div>
            </div>
            {/* MODIFICAR ASPIRANTE */}
            <div className='mt-6 min-h-60 md:max-h-60 w-full flex flex-col bg-[#F0F0F0] rounded-md py-4 gap-4'>
                <h2 className='text-lg text-[#005CA2] mb-4 text-left w-full pl-3'>Modificar aspirante</h2>
                <div className='w-full h-auto flex flex-col md:flex-row'>
                    <div className='w-full md:w-1/5 flex flex-col gap-5 justify-center items-center md:items-start border-b-[1px] md:border-b-0 md:border-r-[1px] border-gray-400 mb-8 md:mb-0 pb-6 md:pb-0'>
                        <div className='flex flex-row justify-center'>
                            <div className='flex justify-end w-16'>
                                <label htmlFor="" className='pr-2'>DNI:</label>
                            </div>
                            <input type="text" value={dniSearch} className={`w-24 px-2 bg-white border border-gray-400 rounded-md ${loadingSearchAspirante ? 'animate-pulse' : 'animate-none'}`} name='dniSearch' onChange={(e) => handleInputAspiranteUpdate(e)} />
                        </div>
                        <div className='flex flex-row justify-center items-center w-full'>
                            <button className='bg-[#005CA2] text-white w-fit px-10 py-[1px] rounded-md font-semibold' onClick={handleSearchAspirante}>Buscar</button>
                        </div>
                    </div>
                    <div className='w-full md:w-4/5 h-auto flex flex-col md:flex-row justify-center items-center md:ml-6 gap-4'>
                        <div className='md:w-1/4 w-full flex flex-col gap-4 items-center justify-center h-full mr-12'>
                            <div className='flex flex-row'>
                                <div className='flex justify-end w-16 md:w-32'>
                                    <label htmlFor="" className='pr-2'>Nombre:</label>
                                </div>
                                <input type="text" value={nombre} className='w-36 px-2 bg-white border border-gray-400 rounded-md' name='nombre' onChange={(e) => handleInputAspiranteUpdate(e)} />
                            </div>
                            <div className='flex flex-row'>
                                <div className='flex justify-end w-16 md:w-32'>
                                    <label htmlFor="" className='pr-2'>Apellido:</label>
                                </div>
                                <input type="text" value={apellido} className='w-36 px-2 bg-white border border-gray-400 rounded-md' name='apellido' onChange={(e) => handleInputAspiranteUpdate(e)} />
                            </div>
                            <div className='flex flex-row'>
                                <div className='flex justify-end w-16 md:w-32'>
                                    <label htmlFor="" className='pr-2'>Genero:</label>
                                </div>
                                <select name="genero" id="" className='rounded-md min-w-36 px-2 bg-white border border-gray-400' value={genero} onChange={(e) => handleInputAspiranteUpdate(e)}>
                                    <option value="" disabled>Seleccione genero</option>
                                    <option value="M">Masculinos</option>
                                    <option value="F">Femeninas</option>
                                </select>
                            </div>
                        </div>
                        <div className='md:w-1/4 w-full flex flex-col items-center justify-center h-full'>
                            <table className='w-full'>
                                <thead className='bg-[#005CA2] text-white'>
                                    <tr>
                                        <th>Presente</th>
                                        <th>Nota</th>
                                        <th>Examen</th>
                                        <th>Modificar</th>
                                    </tr>
                                </thead>
                                <tbody className='bg-white'>
                                    {
                                        dataAspirantes && dataAspirantes.map((aspirante) => {
                                            return (
                                                <tr key={aspirante.dni} className='border-b-[1px] border-gray-400'>
                                                    <td className='text-center'>{aspirante.presencia ? aspirante.presencia : '-'}</td>
                                                    <td className='text-center'>{aspirante.nota ? aspirante.nota : '-'}</td>
                                                    <td className='text-center'>{aspirante.examen_id ? aspirante.examen_id : '-'}</td>
                                                    <td className='text-center' onClick={() => handleSelectAspirante(aspirante.presencia, aspirante.nota, aspirante.examen_id)}>
                                                        <button className='bg-[#005CA2] text-white px-2 py-1 rounded-md cursor-pointer uppercase'>Carga</button>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </table>
                        </div>
                        <div className='md:w-1/4 w-full flex flex-col gap-4 items-center justify-center h-full'>
                            <div className='flex flex-row'>
                                <div className='flex justify-end w-16 md:w-32'>
                                    <label htmlFor="" className='pr-2'>Presencia:</label>
                                </div>
                                <input type="text" value={presencia} className='w-36 px-2 bg-white border border-gray-400 rounded-md' name='presencia' onChange={(e) => handleInputAspiranteUpdate(e)} />
                            </div>
                            <div className='flex flex-row'>
                                <div className='flex justify-end w-16 md:w-32'>
                                    <label htmlFor="" className='pr-2'>Nota:</label>
                                </div>
                                <input type="text" value={nota} className='w-36 px-2 bg-white border border-gray-400 rounded-md' name='nota' onChange={(e) => handleInputAspiranteUpdate(e)} />
                            </div>
                            <div className='flex flex-row'>
                                <div className='flex justify-end w-16 md:w-32'>
                                    <label htmlFor="" className='pr-2 text-nowrap'>Examen id:</label>
                                </div>
                                <input type="text" value={examenIdAsp} className='w-36 px-2 bg-white border border-gray-400 rounded-md' name='examenIdAsp' onChange={(e) => handleInputAspiranteUpdate(e)} />
                            </div>
                        </div>
                        <div className='md:w-1/4 w-full flex justify-center'>
                            <button className={`bg-[#005CA2] text-white w-fit px-3 py-1 rounded-md font-semibold ${loadingUpdateAspirante ? 'animate-pulse' : 'animate-none'}`} onClick={handleUpdateAspirante}>ACTUALIZAR</button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default Carga