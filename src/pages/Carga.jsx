import React, { useEffect, useContext, useState } from 'react'
import { ContextConfig } from '../context/ContextConfig';
import Swal from 'sweetalert2';
import { CiCircleInfo } from "react-icons/ci";
import { Tooltip } from 'react-tooltip';
import * as XLSX from 'xlsx';

const Carga = () => {

    const { HOST, handleSession } = useContext(ContextConfig);
    const [examenes, setExamenes] = useState([]);
    const [aspirantesFile, setAspirantesFile] = useState([]);
    const [preguntasFile, setPreguntasFile] = useState([])
    const [examenFile, setExamenFile] = useState([]);

    //PARA CREAR UN EXAMEN
    const [fechaExamen, setFechaExamen] = useState('');
    const [turnoExamen, setTurnoExamen] = useState('');
    const [aulaExamen, setAulaExamen] = useState('');
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
            setLoadinCargaAspirantes(true)
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
                                setLoadinCargaAspirantes(false)
                                Swal.fire({
                                    title: 'Aspirantes cargados',
                                    icon: 'success',
                                    text: 'Aspirantes cargados correctamente: ' + aspiranteCountOk + ' - Errores: ' + aspiranteCountError,
                                    confirmButtonText: 'Aceptar'
                                })
                            }
                        } else if (response.status === 403) {
                            setLoadinCargaAspirantes(false)
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
            try {
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
                    // console.log("Todos los aspirantes procesados");
                    const examen = { estado: 1 };
                    const examen_id = await searchExamenId(aulaCarga, turnoCarga, fechaCarga);

                    if (!examen_id) {
                        console.error("Error: examen_id no encontrado");
                        throw new Error("No se encontró el examen_id");
                    }

                    // preguntasFile.map(pregunta => {
                    //     const preguntaSubir = {
                    //         ...pregunta,
                    //         examen_id
                    //     }

                    //     fetch(`${HOST}/api/preguntas/pregunta`, {
                    //         method: 'PUT',
                    //         headers: {
                    //             'Content-Type': 'application/json',
                    //         },
                    //         credentials: 'include',
                    //         body: JSON.stringify(preguntaSubir),
                    //     });
                    // })                    

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
        // console.log(name, value)
        if (name === 'fechaCarga') {
            setFechaCarga(value);
        } else if (name === 'turnoCarga') {
            setTurnoCarga(value);
        } else if (name === 'aulaCarga') {
            setAulaCarga(value);
        }
    }

    const handleInputExamenUpdate = (e) => {
        const { name, value } = e.target;

        if (name === 'fechaExamenSearch') {
            setFechaExamenSearch(value);
        } else if (name === 'turnoExamenSearch') {
            setTurnoExamenSearch(value);
        } else if (name === 'aulaExamenSearch') {
            setAulaExamenSearch(value);
        } else if (name === 'idExamenUpdate') {
            setIdExamenUpdate(value)
        } else if (name === 'fechaExamenUpdate') {
            setFechaExamenUpdate(value)
        } else if (name === 'turnoExamenUpdate') {
            setTurnoExamenUpdate(value)
        } else if (name === 'aulaExamenUpdate') {
            setAulaExamenUpdate(value)
        } else if (name === 'estadoExamenUpdate') {
            setEstadoExamenUpdate(value)
        } else if (name === 'cantidadExamenUpdate') {
            setCantidadExamenUpdate(value)
        }
    }

    const handleInputAspiranteUpdate = (e) => {
        const { name, value } = e.target;

        if (name === 'dniSearch') {
            setDniSearch(value);
        } else if (name === 'nombre') {
            setNombre(value);
        } else if (name === 'apellido') {
            setApellido(value);
        } else if (name === 'genero') {
            setGenero(value)
        } else if (name === 'presencia') {
            setPresencia(value)
        } else if (name === 'nota') {
            setNota(value)
        } else if (name === 'examenIdAsp') {
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
                    setPresencia(data[0].presencia)
                    setNota(data[0].nota)
                    setExamenIdAsp(data[0].examen_id)
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
        if (idExamenUpdate && fechaExamenUpdate && turnoExamenUpdate && aulaExamenUpdate && estadoExamenUpdate && cantidadExamenUpdate) {
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
            setLoadinUpdateAspirante(true)
            const aspiranteUpdate = {
                dni: dniSearch,
                nombre,
                apellido,
                genero,
                presencia,
                nota,
                examen_id: examenIdAsp
            }

            fetch(`${HOST}/api/aspirantes/update/${dniSearch}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(aspiranteUpdate),
            })
                .then(response => {
                    if (response.status === 200) {
                        setLoadinUpdateAspirante(false)
                        setDniSearch('')
                        setNombre('')
                        setApellido('')
                        setGenero('')
                        setPresencia('')
                        setNota('')
                        setExamenIdAsp('')

                        Swal.fire({
                            title: 'Aspirante actualizado',
                            icon: 'success',
                            text: 'Aspirante actualizado correctamente',
                            confirmButtonText: 'Aceptar'
                        })
                        return response.json();
                    } else if (response.status === 403) {
                        setLoadinUpdateAspirante(false)
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
            setLoadinUpdateAspirante(false)
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
                            </select>
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
                <div className='mt-6 min-h-60 max-h-60 w-full md:w-1/2 flex flex-col items-center justify-center bg-[#f0f0f0] rounded-md py-4'>
                    <div className='flex flex-row items-center justify-center'>
                        <h2 className='text-lg text-[#005CA2] mb-2'>Carga aspirantes</h2>
                        <CiCircleInfo className='text-lg text-[#005CA2] mb-1 ml-2' data-tooltip-id="tooltip2" data-tooltip-html="
                        <div style='max-width: 170px; text-align: center; background-color: #005CA2; color: white; border-radius: 8px;'>
                            <p>
                                El archivo a cargar debe ser un archivo .xlsx con las siguientes columnas en este orden: dni, apellido, nombre, genero, aula, turno, fecha
                            </p>
                            </div>"/>
                        <Tooltip
                            id="tooltip2"
                            events={['click']}
                            place='right'
                            style={{ backgroundColor: "#005CA2" }}
                        />
                    </div>
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
                    <div className='w-full md:w-1/4 flex flex-col gap-5 justify-center items-center md:items-start border-b-[1px] md:border-b-0 md:border-r-[1px] border-gray-400 mb-8 md:mb-0 pb-6 md:pb-0'>
                        <div className='flex flex-row justify-center'>
                            <div className='flex justify-end w-16'>
                                <label htmlFor="" className='pr-2'>DNI:</label>
                            </div>
                            <input type="text" value={dniSearch} className={`w-36 px-2 bg-white border border-gray-400 rounded-md ${loadingSearchAspirante ? 'animate-pulse' : 'animate-none'}`} name='dniSearch' onChange={(e) => handleInputAspiranteUpdate(e)} />
                        </div>
                        <div className='flex flex-row justify-center items-center w-full'>
                            <button className='bg-[#005CA2] text-white w-fit px-10 py-[1px] rounded-md font-semibold' onClick={handleSearchAspirante}>Buscar</button>
                        </div>
                    </div>
                    <div className='w-full md:w-3/4 h-auto flex flex-col md:flex-row justify-center items-center md:ml-8 gap-4'>
                        <div className='md:w-1/3 w-full flex flex-col gap-4 items-center justify-center h-full'>
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
                        <div className='md:w-1/3 w-full flex flex-col gap-4 items-center justify-center h-full'>
                            <div className='flex flex-row'>
                                <div className='flex justify-end w-16 md:w-32'>
                                    <label htmlFor="" className='pr-2'>Presencia:</label>
                                </div>
                                <input type="text" value={presencia} className='w-36 px-2 bg-white border border-gray-400 rounded-md' name='presencia' onChange={(e) => handleInputExamen(e)} />
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
                        <div className='md:w-1/3 w-full flex justify-center'>
                            <button className={`bg-[#005CA2] text-white w-fit px-10 py-1 rounded-md font-semibold ${loadingUpdateAspirante ? 'animate-pulse' : 'animate-none'}`} onClick={handleUpdateAspirante}>ACTUALIZAR</button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default Carga