import React, { useContext, useEffect, useState } from 'react'
import { Bar, Chart, Pie } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Legend,
    Filler,
} from "chart.js/auto";
import Swal from 'sweetalert2';
import { ContextConfig } from '../context/ContextConfig';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CiCircleInfo } from "react-icons/ci";
import { Tooltip } from 'react-tooltip';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Legend,
    Filler,
    ChartDataLabels
);

const Estadisticas = () => {

    const [loading, setLoading] = useState(false)

    const { HOST, handleSession } = useContext(ContextConfig)
    const [fecha, setFecha] = useState('aaaa-mm-dd')
    const [turno, setTurno] = useState('')
    const [aula, setAula] = useState('')
    const [genero, setGenero] = useState('')
    const [corte, setCorte] = useState('')

    const [aprobadosFinal, setAprobadosFinal] = useState(null)
    const [desaprobadosFinal, setDesaprobadosFinal] = useState(null)
    const [ausentesFinal, setAusentesFinal] = useState(null)
    const [aprobadosPorc, setAprobadosPorc] = useState(null)
    const [desaprobadosPorc, setDesaprobadosPorc] = useState(null)
    const [ausentesPorc, setAusentesPorc] = useState(null)
    const [aprobadosAula, setAprobadosAula] = useState([])
    const [desaprobadosAula, setDesaprobadosAula] = useState([])
    const [ausentesAula, setAusentesAula] = useState([])
    const [preguntasRespondidas, setPreguntasRespondidas] = useState([])
    const [aprobadosGenero, setAprobadosGenero] = useState([])
    const [desaprobadosGenero, setDesaprobadosGenero] = useState([])

    const dataAprobados = {
        labels: [
            'Aprobados',
            'Desaprobados',
            'Ausentes'
        ],
        datasets: [{
            type: 'pie',
            data: [aprobadosPorc, desaprobadosPorc, ausentesPorc],
            backgroundColor: [
                '#48c146',
                '#ec5353',
                '#c0c0c0'
            ],
            hoverOffset: 4
        }]
    };

    const optionsAprobados = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                align: 'center',
                labels: {
                    boxWidth: 20,
                    boxHeight: 15,
                    padding: 10,
                    usePointStyle: true,
                    color: 'black',
                }
            },
            datalabels: {
                display: true,
                color: 'white',
                font: {
                    weight: 'bold', // Pone los datos en negrita
                    size: 17, // Ajusta el tamaño del texto
                },
                formatter: (value) => {
                    // Si el porcentaje es menor a 5, no mostrar el label
                    if (value < 5) {
                        return '';  // Devolver vacío para no mostrar el label
                    }

                    // Si no, muestra el valor con 2 decimales
                    return `${value}%`;
                }
            },
        },
    };

    const dataAulas = {
        labels: ['AULA 01', 'AULA 02', 'AULA 03', 'AULA 04', 'AULA 05'],
        datasets: [
            {
                label: 'Aprobados',
                data: aprobadosAula,
                backgroundColor: '#48c146',
                stack: 'stack1',
            },
            {
                label: 'Desaprobados',
                data: desaprobadosAula,
                backgroundColor: '#ec5353',
                stack: 'stack1',
            },
            {
                label: 'Ausentes',
                data: ausentesAula,
                backgroundColor: '#c0c0c0',
                stack: 'stack1',
            },
        ],
    };

    const optionsAulas = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                align: 'center',
                labels: {
                    boxWidth: 20,
                    boxHeight: 15,
                    padding: 10,
                    usePointStyle: true,
                    color: 'black',
                },
            },
            tooltip: {
                enabled: true,
            },
            datalabels: {
                display: true,
                color: 'white',
                font: {
                    weight: 'bold',
                    size: 17,
                },
                formatter: (value) => {
                    if (value < 5) {
                        return '';
                    }

                    return `${value}`;
                }
            }
        },
        scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true,
            },
        },
    };

    const dataPreguntas = {
        labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'],
        datasets: [
            {
                label: 'Preguntas respondidas',
                data: preguntasRespondidas,
                backgroundColor: '#48c146',
                stack: 'stack1',
            }
        ],
    };

    const optionsPreguntas = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                align: 'center',
                labels: {
                    boxWidth: 20,
                    boxHeight: 15,
                    padding: 10,
                    usePointStyle: true,
                    color: 'black',
                },
            },
            tooltip: {
                enabled: true,
            },
            datalabels: {
                display: true,
                color: 'white',
                font: {
                    weight: 'bold', // Pone los datos en negrita
                    size: 13, // Ajusta el tamaño del texto
                },
                formatter: (value) => {
                    // Si el porcentaje es menor a 5, no mostrar el label
                    if (value < 2) {
                        return '';  // Devolver vacío para no mostrar el label
                    }

                    // Si no, muestra el valor con 2 decimales
                    return `${value}`;
                }
            }
        },
        scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true,
            },
        },
    };

    const dataGenero = {
        labels: ['Masculinos', 'Femeninos'],
        datasets: [
            {
                label: 'Aprobados',
                data: aprobadosGenero,
                backgroundColor: '#48c146',
                stack: 'stack1',
            },
            {
                label: 'Desaprobados',
                data: desaprobadosGenero,
                backgroundColor: '#ec5353',
                stack: 'stack1',
            }
        ],
    };

    const optionsGenero = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    boxWidth: 20,
                    boxHeight: 15,
                    padding: 10,
                    usePointStyle: true,
                    color: 'black',
                },
            },
            tooltip: {
                enabled: true,
            },
            datalabels: {
                display: true,
                color: 'white',
                font: {
                    weight: 'bold',
                    size: 17,
                },
                formatter: (value) => {
                    // Si el porcentaje es menor a 5, no mostrar el label
                    if (value < 5) {
                        return '';  // Devolver vacío para no mostrar el label
                    }

                    // Si no, muestra el valor con 2 decimales
                    return `${value}`;
                }
            }
        },
        scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true,
            },
        }
    };

    const handleChangeInput = (e) => {
        const { name, value } = e.target;
        //console.log(name, value)
        if (name === 'fecha') {
            setFecha(value);
        } else if (name === 'turno') {
            setTurno(value);
        } else if (name === 'aula') {
            setAula(value);
        } else if (name === 'genero') {
            setGenero(value);
        } else if (name === 'corte') {
            setCorte(value);
        }
    }

    const handleExportPDF = () => {
        setLoading(true);

        const input = document.getElementById('componente-exportar');

        const inputWidth = input.offsetWidth;
        const inputHeight = input.offsetHeight;
        const aspectRatio = inputWidth / inputHeight;
        const pdfWidth = 210;
        const pdfHeight = pdfWidth / aspectRatio;

        html2canvas(input, {
            scale: 5,
            scrollY: -window.scrollY,
            windowWidth: document.documentElement.offsetWidth,
            windowHeight: document.documentElement.offsetHeight,
            useCORS: true,
            logging: true
        })
            .then((canvas) => {
                const imgData = canvas.toDataURL('image/jpeg', 1.0);
                const pdf = new jsPDF({
                    orientation: pdfWidth > pdfHeight ? 'l' : 'p',
                    unit: 'mm',
                    format: [pdfWidth, pdfHeight]
                });

                const margin = 10;
                const titleHeight = 5;
                const remainingHeight = pdfHeight - margin * 2 - titleHeight;

                const imgWidth = pdfWidth - margin * 2;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                const scaledImgHeight = Math.min(imgHeight, remainingHeight);
                const imgX = margin;
                // const imgY = (pdfHeight - imgHeight) / 2;
                const imgY = margin + titleHeight;

                const title = "Reporte de Resultados";
                const fontSize = 13; // Tamaño de la fuente del título
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(fontSize);
                pdf.text(title, pdfWidth / 2, margin, { align: 'center' });

                pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth, scaledImgHeight);

                const date = new Date();
                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const year = date.getFullYear();
                const hour = date.getHours().toString().padStart(2, '0');
                const minute = date.getMinutes().toString().padStart(2, '0');
                const second = date.getSeconds().toString().padStart(2, '0');
                const formattedDate = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

                //pdf.text(`REPORTE DE RESULTADOS - ${formattedDate}`, pdfWidth / 2, margin, { align: 'center' });
                pdf.save('resultados-ingreso.pdf');
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error al exportar a PDF:', error);
                setLoading(false);
            });
    };

    const borrarFiltros = () => {
        setFecha(`'aaaa-mm-dd'`)
        setTurno('')
        setAula('')
        setGenero('')
        setCorte('')
    }

    useEffect(() => {
        const ejecucion = () => {
            setAprobadosFinal(null)
            setDesaprobadosFinal(null)
            setAusentesFinal(null)
            setAprobadosPorc(null)
            setDesaprobadosPorc(null)
            setAusentesPorc(null)
            setAprobadosAula([])
            setDesaprobadosAula([])
            setAusentesAula([])
            setPreguntasRespondidas([])
            setAprobadosGenero([])
            setDesaprobadosGenero([])

            let resumenAula = {}
            let ultimoExamenId = null

            let aprobados = 0;
            let desaprobados = 0;
            let ausentes = 0;

            let aprobaula01 = 0;
            let aprobaula02 = 0;
            let aprobaula03 = 0;
            let aprobaula04 = 0
            let aprobaula05 = 0
            let desaprobaula01 = 0;
            let desaprobaula02 = 0;
            let desaprobaula03 = 0;
            let desaprobaula04 = 0;
            let desaprobaula05 = 0;

            let pregunta1 = 0;
            let pregunta2 = 0;
            let pregunta3 = 0;
            let pregunta4 = 0;
            let pregunta5 = 0;
            let pregunta6 = 0;
            let pregunta7 = 0;
            let pregunta8 = 0;
            let pregunta9 = 0;
            let pregunta10 = 0;
            let pregunta11 = 0;
            let pregunta12 = 0;
            let pregunta13 = 0;
            let pregunta14 = 0;
            let pregunta15 = 0;
            let pregunta16 = 0;
            let pregunta17 = 0;
            let pregunta18 = 0;
            let pregunta19 = 0;
            let pregunta20 = 0;

            let masculinosAprobados = 0
            let femeninasAprobados = 0
            let masculinosDesaprobados = 0
            let femeninasDesaprobadas = 0

            let parametros = {
                fecha,
                turno,
                aula,
                genero
            }

            fetch(`${HOST}/api/examenAspirantes/aprobados`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(parametros)
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
                    //const corte = parseInt(data.corte)
                    const informacion = data.aspirantes;

                    console.log("Informacion: ", informacion)
                    const procesados = new Set();

                    informacion.forEach(info => {
                        if (!procesados.has(info.examen_id)) {
                            //console.log("Ingreso al if principal");

                            if (!resumenAula[info.aula]) {
                                resumenAula[info.aula] = info.cantidad_inscriptos;
                            } else {
                                resumenAula[info.aula] += info.cantidad_inscriptos;
                            }

                            procesados.add(info.examen_id); // Marcamos el examen_id como procesado
                        }

                        // if (info.examen_id !== ultimoExamenId) {
                        //     console.log("Ingreso al if principal")
                        //     if (!resumenAula[info.aula]) {
                        //         resumenAula[info.aula] = info.cantidad_inscriptos;
                        //     } 
                        //     else {
                        //         resumenAula[info.aula] += info.cantidad_inscriptos;
                        //     }

                        //     ultimoExamenId = info.examen_id
                        // }

                        //APROBADOS Y DESAPROBADOS
                        if (info.nota >= corte) {
                            aprobados++;
                        } else {
                            desaprobados++;
                        }

                        //APROBADOS Y DESAPROBADOS AULAs
                        if (info.nota >= corte) {
                            if (info.aula === "AULA 01") {
                                aprobaula01++;
                            } else if (info.aula === "AULA 02") {
                                aprobaula02++;
                            } else if (info.aula === "AULA 03") {
                                aprobaula03++;
                            } else if (info.aula === "AULA 04") {
                                aprobaula04++;
                            } else if (info.aula === "AULA 05") {
                                aprobaula05++;
                            }
                        } else {
                            if (info.aula === "AULA 01") {
                                desaprobaula01++;
                            } else if (info.aula === "AULA 02") {
                                desaprobaula02++;
                            } else if (info.aula === "AULA 03") {
                                desaprobaula03++;
                            } else if (info.aula === "AULA 04") {
                                desaprobaula04++;
                            } else if (info.aula === "AULA 05") {
                                desaprobaula05++;
                            }
                        }

                        //PREGUNTAS
                        if (info.nota === 1) {
                            pregunta1++
                        } else if (info.nota === 2) {
                            pregunta2++
                        } else if (info.nota === 3) {
                            pregunta3++
                        } else if (info.nota === 4) {
                            pregunta4++
                        } else if (info.nota === 5) {
                            pregunta5++
                        } else if (info.nota === 6) {
                            pregunta6++
                        } else if (info.nota === 7) {
                            pregunta7++
                        } else if (info.nota === 8) {
                            pregunta8++
                        } else if (info.nota === 9) {
                            pregunta9++
                        } else if (info.nota === 10) {
                            pregunta10++
                        } else if (info.nota === 11) {
                            pregunta11++
                        } else if (info.nota === 12) {
                            pregunta12++
                        } else if (info.nota === 13) {
                            pregunta13++
                        } else if (info.nota === 14) {
                            pregunta14++
                        } else if (info.nota === 15) {
                            pregunta15++
                        } else if (info.nota === 16) {
                            pregunta16++
                        } else if (info.nota === 17) {
                            pregunta17++
                        } else if (info.nota === 18) {
                            pregunta18++
                        } else if (info.nota === 19) {
                            pregunta19++
                        } else if (info.nota === 20) {
                            pregunta20++
                        }

                        //MASCULINOS Y FEMENINOS APROBADOS
                        if (info.genero === "M" && info.nota >= corte) {
                            masculinosAprobados++
                        }
                        if (info.genero === "F" && info.nota >= corte) {
                            femeninasAprobados++
                        }

                        //MASCULINOS Y FEMENINOS DESAPROBADOS
                        if (info.genero === "M" && info.nota < corte) {
                            masculinosDesaprobados++
                        }
                        if (info.genero === "F" && info.nota < corte) {
                            femeninasDesaprobadas++
                        }
                    })

                    const aulas = ["AULA 01", "AULA 02", "AULA 03", "AULA 04", "AULA 05"];
                    const ausentesAulaAux = [];

                    for (let i = 0; i < aulas.length; i++) {
                        const aula = aulas[i];
                        if (resumenAula[aula]) {
                            if (aula === "AULA 01") {
                                ausentesAulaAux.push(resumenAula[aula] - aprobaula01 - desaprobaula01);
                            } else if (aula === "AULA 02") {
                                ausentesAulaAux.push(resumenAula[aula] - aprobaula02 - desaprobaula02);
                            } else if (aula === "AULA 03") {
                                ausentesAulaAux.push(resumenAula[aula] - aprobaula03 - desaprobaula03);
                            } else if (aula === "AULA 04") {
                                ausentesAulaAux.push(resumenAula[aula] - aprobaula04 - desaprobaula04);
                            } else if (aula === "AULA 05") {
                                ausentesAulaAux.push(resumenAula[aula] - aprobaula05 - desaprobaula05);
                            }
                        } else {
                            ausentesAulaAux.push(0);
                        }
                    }

                    //console.log("Resumen aula: ", resumenAula)

                    const totalInscriptos = Object.values(resumenAula).reduce((acc, inscriptos) => acc + inscriptos, 0);
                    // const totalInscriptos = informacion.length
                    ausentes = totalInscriptos - aprobados - desaprobados

                    //console.log("Total inscriptos: ", totalInscriptos)

                    let aprobadosAulaAux = [aprobaula01, aprobaula02, aprobaula03, aprobaula04, aprobaula05]
                    let desaprobadosAulaAux = [desaprobaula01, desaprobaula02, desaprobaula03, desaprobaula04, desaprobaula05]

                    let preguntasAux = [pregunta1, pregunta2, pregunta3, pregunta4, pregunta5, pregunta6, pregunta7, pregunta8, pregunta9, pregunta10, pregunta11, pregunta12, pregunta13, pregunta14, pregunta15, pregunta16, pregunta17, pregunta18, pregunta19, pregunta20]
                    let aprobadosGeneroAux = [masculinosAprobados, femeninasAprobados]
                    let desaprobadosGeneroAux = [masculinosDesaprobados, femeninasDesaprobadas]

                    setAprobadosFinal(aprobados)
                    setDesaprobadosFinal(desaprobados)
                    setAusentesFinal(genero ? null : ausentes)
                    setAprobadosPorc(((aprobados * 100) / totalInscriptos).toFixed(2))
                    setDesaprobadosPorc(((desaprobados * 100) / totalInscriptos).toFixed(2))
                    setAusentesPorc(genero ? null : ((ausentes * 100) / totalInscriptos).toFixed(2))
                    setAprobadosAula(aprobadosAulaAux)
                    setDesaprobadosAula(desaprobadosAulaAux)
                    setAusentesAula(genero ? null : ausentesAulaAux)
                    setPreguntasRespondidas(preguntasAux)
                    setAprobadosGenero(aprobadosGeneroAux)
                    setDesaprobadosGenero(desaprobadosGeneroAux)
                })
        }

        const intervalo = setInterval(ejecucion, 10 * 60 * 1000);

        ejecucion()

        return () => clearInterval(intervalo);

    }, [fecha, aula, turno, genero, corte])

    useEffect(() => {
        if (corte === '') {
            Swal.fire({
                title: 'Información',
                icon: 'info',
                text: 'Para visualizar las estadísticas, por favor ingrese primero la nota de corte, luego puede usar los filtros de fecha, turno, aula y género para obtener los resultados deseados.',
            });
        }
    }, [])

    useEffect(() => {
        if (corte === '') {
            setFecha('aaaa-mm-dd')
            setTurno('')
            setAula('')
            setGenero('')
            setCorte('')
        }
    }, [corte])

    return (
        <div className='text-xs flex flex-col w-full h-full lg:relative lg:left-52'>
            <h1 className='text-[#005CA2] font-bold text-2xl'>ESTADISTICAS</h1>
            <div className='bg-[#f0f0f0] p-4 mt-4 rounded-md flex flex-col md:flex-row md:justify-around'>
                <div className='lg:w-2/3 w-full flex flex-col md:flex-row mb-4 lg:mb-0'>
                    <div className=' flex flex-col mb-2 w-full md:w-1/2 justify-center gap-2'>
                        <div className='flex justify-center flex-row'>
                            <div className='flex justify-end w-28 mr-6'>
                                <label htmlFor="" className='font-bold'>Nota corte:</label>
                            </div>
                            <input type="number" name="corte" id="" className='rounded-md min-w-36 pl-2' value={corte} onChange={(e) => handleChangeInput(e)} />
                        </div>
                        <div className='flex justify-center flex-row'>
                            <div className='flex justify-end w-28 mr-4'>
                                <label htmlFor="" className=''>Ingrese fecha:</label>
                            </div>
                            <input type="date" name="fecha" id="" className={`rounded-md min-w-36 px-2`} value={fecha} onChange={(e) => handleChangeInput(e)} disabled={!corte} />
                        </div>
                        <div className='flex justify-center flex-row'>
                            <div className='flex justify-end w-28 mr-4'>
                                <label htmlFor="" className=''>Ingrese turno:</label>
                            </div>
                            <select name="turno" id="" className='rounded-md min-w-36 px-2' value={turno} onChange={(e) => handleChangeInput(e)} disabled={!corte}>
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
                    <div className=' flex flex-col mb-2 w-full md:w-1/2 justify-center gap-2'>
                        <div className='flex justify-center items-center flex-row'>
                            <div className='flex justify-end w-28 mr-4'>
                                <label htmlFor="" className=''>Ingrese aula:</label>
                            </div>
                            <select name="aula" id="" className='rounded-md min-w-36 px-2' value={aula} onChange={(e) => handleChangeInput(e)} disabled={!corte}>
                                <option value="" disabled>Seleccione aula</option>
                                <option value="AULA 01">Aula 01</option>
                                <option value="AULA 02">Aula 02</option>
                                <option value="AULA 03">Aula 03</option>
                                <option value="AULA 04">Aula 04</option>
                                <option value="AULA 05">Aula 05</option>
                            </select>
                        </div>
                        <div className='flex justify-center items-center flex-row'>
                            <div className='flex justify-end w-28 ml-3'>
                                <label htmlFor="" className=''>Ingrese genero:</label>
                            </div>
                            <select name="genero" id="" className='rounded-md min-w-36 px-2' value={genero} onChange={(e) => handleChangeInput(e)} disabled={!corte}>
                                <option value="" disabled>Seleccione genero</option>
                                <option value="M">Masculinos</option>
                                <option value="F">Femeninas</option>
                            </select>
                            <CiCircleInfo className='text-lg text-[#005CA2] ml-2' data-tooltip-id="tooltip3" data-tooltip-html="
                                                    <div style='max-width: 170px; text-align: center; background-color: #005CA2; color: white; border-radius: 8px;'>
                                                        <p>
                                                            Al usar este filtro se ignora el número de ausentes  ya que la misma se la toma de la poblacion total
                                                        </p>
                                                        </div>"/>
                            <Tooltip
                                id="tooltip3"
                                events={['click']}
                                place='right'
                                style={{ backgroundColor: "#005CA2" }}
                            />
                        </div>

                    </div>
                </div>
                <div className='lg:w-1/3 w-full flex flex-col md:flex-row gap-3 justify-center items-center'>
                    <button className='bg-black text-white px-4 rounded-md min-w-32 max-w-32' onClick={borrarFiltros}>BORRAR FILTROS</button>
                    <button className='bg-black text-white px-4 rounded-md min-w-32 max-w-32' onClick={handleExportPDF}>EXPORTAR</button>
                </div>
            </div>
            <div id='componente-exportar'>
                <div className='w-full justify-center items-center flex flex-col md:flex-row gap-4 mt-8'>
                    <div className='bg-[#48c146] py-2 rounded-md w-full md:w-1/2'>
                        <p className='text-center text-3xl font-bold text-white'>{aprobadosFinal ? aprobadosFinal : '-'}</p>
                        <p className='text-center text-xl text-white'>APROBADOS</p>
                    </div>
                    <div className='bg-[#ec5353] py-2 rounded-md w-full md:w-1/2'>
                        <p className='text-center text-3xl font-bold text-white'>{desaprobadosFinal ? desaprobadosFinal : '-'}</p>
                        <p className='text-center text-xl text-white'>DESAPROBADOS</p>
                    </div>
                    <div className='bg-gray-500 py-2 rounded-md w-full md:w-1/2'>
                        <p className='text-center text-3xl font-bold text-white'>{ausentesFinal ? ausentesFinal : '-'}</p>
                        <p className='text-center text-xl text-white'>AUSENTES</p>
                    </div>
                </div>
                <div className='w-full h-auto lg:h-80 flex flex-col justify-center items-center lg:flex-row my-8'>
                    <div className='lg:w-1/2 w-full justify-center flex h-full min-h-60'>
                        <Pie data={dataAprobados} options={optionsAprobados} />
                    </div>
                    <div className='lg:w-1/2 w-full justify-center flex h-full min-h-80 mt-8 md:mt-0'>
                        <Bar data={dataAulas} options={optionsAulas} />
                    </div>
                </div>
                <div className='w-full h-auto lg:h-80 flex flex-col justify-center items-center lg:flex-row mt-8'>
                    <div className='lg:w-full w-full justify-center md:flex h-full px-5 md:min-h-[337px] overflow-x-scroll overflow-y-auto'>
                        <div className='min-w-[500px] md:w-full min-h-80 md:h-auto'>
                            <Bar data={dataPreguntas} options={optionsPreguntas} />
                        </div>
                    </div>
                    {/* <div className='lg:w-1/3 w-full justify-center flex px-5 md:px-12 min-h-[337px] mt-8 md:mt-0'>
                        <Bar data={dataGenero} options={optionsGenero} />
                    </div> */}
                </div>
            </div>
        </div>
    )
}

export default Estadisticas