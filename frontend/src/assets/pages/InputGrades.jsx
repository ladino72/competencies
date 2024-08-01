import { useState, useContext } from 'react'
import ListBox from '../components/ListBox';
import RadioButton_1 from '../components/RadioButton_1';
import { FcRight } from "react-icons/fc";
import CourseGradesModal from '../components/CourseGradesModal';
//CASL
//import { AbilityContext } from '../permissions/AbilityContext';
import Unauthorized from '../components/UnauthorizedAccess';

import { useAuth } from "./../permissions/AuthContext";
import { Can } from "./../permissions/Can";



function Teacher() {
    const { user } = useAuth()

    console.log("useAuth:::::", user)

    const CourseOptions = [
        {
            id: "mecánica",
            value: "Mecánica"
        },
        {
            id: "electromagnetismo",
            value: "Electromagnetismo",
        },
        {
            id: "termodinámica y ondas",
            value: "Termodinámica y Ondas"
        }
    ]


    const teachersLabMC = [
        {
            name: "Olga Lucía Godoy",
            group: 1
        },
        {
            name: "Eliseo Perez",
            group: 2
        },
        {
            name: "Raúl Panqueva",
            group: 3
        },
        {
            name: "Ricardo Otero",
            group: 4
        },

        {
            name: "Olga Lucía Godoy",
            group: 7
        },
        {
            name: "Sandra Motta",
            group: 10
        },
        {
            name: "Patricia Ordúz",
            group: 11
        },
        {
            name: "Sebastian Ramirez",
            group: 12
        },

    ];

    const teachersLabEM = [
        {
            name: "Rafael Guzmán",
            group: 1
        },
        {
            name: "Sandra Gutierrez",
            group: 2
        },
        {
            name: "Nadia Molano",
            group: 3
        },
        {
            name: "Elva Molina",
            group: 9
        },

        {
            name: "William Aponte",
            group: 10
        },
        {
            name: "Herney Ortiz",
            group: 12
        },
        {
            name: "Gabriel Chaparro",
            group: 11
        },
        {
            name: "Andres Felipe Londoño",
            group: 13
        },

    ];

    const teachersLabTW = [
        {
            name: "Raúl Ruiz",
            group: 1
        },
        {
            name: "Daniel Fonseca",
            group: 2
        },
        {
            name: "Henry Moreno",
            group: 3
        },
        {
            name: "Ricardo Otero",
            group: 4
        },

        {
            name: "Olga Lucía Godoy",
            group: 5
        },
        {
            name: "Sandra González",
            group: 6
        },
        {
            name: "Isabel Rodriguez",
            group: 7
        },
        {
            name: "Amalia Quintero",
            group: 8
        },

    ];

    const teachersTeoMC = [
        {
            name: "Olga Lucía Godoy",
            group: 1
        },
        {
            name: "Eliseo Perez",
            group: 2
        },
        {
            name: "Raúl Panqueva",
            group: 3
        },
        {
            name: "Ricardo Otero",
            group: 4
        },

        {
            name: "Olga Lucía Godoy",
            group: 7
        },
        {
            name: "Sandra Motta",
            group: 10
        },
        {
            name: "Patricia Ordúz",
            group: 11
        },
        {
            name: "Sebastian Ramirez",
            group: 12
        },

    ];

    const teachersTeoEM = [
        {
            name: "Rafael Guzmán",
            group: 1
        },
        {
            name: "Sandra Gutierrez",
            group: 2
        },
        {
            name: "Nadia Molano",
            group: 3
        },
        {
            name: "Elva Molina",
            group: 9
        },

        {
            name: "William Aponte",
            group: 10
        },
        {
            name: "Herney Ortiz",
            group: 12
        },
        {
            name: "Gabriel Chaparro",
            group: 11
        },
        {
            name: "Andres Felipe Londoño",
            group: 13
        },

    ];

    const teachersTeoTW = [
        {
            name: "Raúl Ruiz",
            group: 1
        },
        {
            name: "Daniel Fonseca",
            group: 2
        },
        {
            name: "Henry Moreno",
            group: 3
        },
        {
            name: "Ricardo Otero",
            group: 4
        },

        {
            name: "Olga Lucía Godoy",
            group: 5
        },
        {
            name: "Sandra González",
            group: 6
        },
        {
            name: "Isabel Rodriguez",
            group: 7
        },
        {
            name: "Amalia Quintero",
            group: 8
        },

    ];

    let GroupsTeoMC = []
    let TeachersTeoMC = []
    let GroupsTeoEM = []
    let TeachersTeoEM = []
    let GroupsTeoTW = []
    let TeachersTeoTW = []

    let GroupsLabMC = []
    let TeachersLabMC = []
    let GroupsLabEM = []
    let TeachersLabEM = []
    let GroupsLabTW = []
    let TeachersLabTW = []

    teachersTeoMC.forEach((item) => {
        GroupsTeoMC.push(item.group);
        TeachersTeoMC.push(item.name);
    });
    teachersTeoEM.forEach((item) => {
        GroupsTeoEM.push(item.group);
        TeachersTeoEM.push(item.name);
    });
    teachersTeoTW.forEach((item) => {
        GroupsTeoTW.push(item.group);
        TeachersTeoTW.push(item.name);
    });

    teachersLabMC.forEach((item) => {
        GroupsLabMC.push(item.group);
        TeachersLabMC.push(item.name);
    });
    teachersLabEM.forEach((item) => {
        GroupsLabEM.push(item.group);
        TeachersLabEM.push(item.name);
    });
    teachersLabTW.forEach((item) => {
        GroupsLabTW.push(item.group);
        TeachersLabTW.push(item.name);
    });

    const getTeacherName = (teacherList, a) => {

        const index = teacherList.findIndex(object => {
            return object.group === a;
        });
        return index

    }


    const [selectLabGroupMC, setSelectLabGroupMC] = useState(GroupsLabMC[0]);
    const [selectLabGroupEM, setSelectLabGroupEM] = useState(GroupsLabEM[0]);
    const [selectLabGroupTW, setSelectLabGroupTW] = useState(GroupsLabTW[0]);

    const [selectTeoGroupMC, setSelectTeoGroupMC] = useState(GroupsTeoMC[0]);
    const [selectTeoGroupEM, setSelectTeoGroupEM] = useState(GroupsTeoEM[0]);
    const [selectTeoGroupTW, setSelectTeoGroupTW] = useState(GroupsTeoTW[0]);

    const [teocourse, setTeoCourse] = useState("")
    const [labcourse, setLabCourse] = useState("")

    const [labcourseErr, setLabCourseErr] = useState(false)
    const [teocourseErr, setTeoCourseErr] = useState(false)

    const [typeOfCourse, setTypeOfCourse] = useState(null)
    const [typeOfCourseErr, setTypeOfCoursErr] = useState(false)


    const TypeOfCourse = [
        {
            id: "teoria",
            value: "Teoria"
        },
        {
            id: "laboratorio",
            value: "Laboratorio",
        }
    ]

    const [displayList, setDisplayList] = useState(false)

    const handleDisplayList = (e) => {
        setDisplayList(true)
    }

    const handleSubmit = (event) => {
        event.preventDefault();


        let labGroup = null
        let teoGroup = null


        if (labcourse == "Mecánica") {
            labGroup = selectLabGroupMC
            let index
            index = getTeacherName(teachersLabMC, selectLabGroupMC)
            console.log("Laboratorio", selectLabGroupMC, labcourse, teachersLabMC[index].name)
        }
        if (labcourse == "Electromagnetismo") {
            labGroup = selectLabGroupEM
            let index
            index = getTeacherName(teachersLabEM, selectLabGroupEM)
            console.log("Laboratorio", selectLabGroupEM, labcourse, teachersLabEM[index].name)
        }


        if (labcourse == "Termodinámica y Ondas") {
            labGroup = selectLabGroupTW
            let index
            index = getTeacherName(teachersLabTW, selectLabGroupTW)
            console.log("Laboratorio", selectLabGroupTW, labcourse, teachersLabTW[index].name)
        }


        if (teocourse == "Mecánica") {
            let index
            teoGroup = selectTeoGroupMC
            index = getTeacherName(teachersTeoMC, selectTeoGroupMC)
            console.log("Teoria", selectTeoGroupMC, teocourse, teachersTeoMC[index].name)
        }
        if (teocourse == "Electromagnetismo") {
            teoGroup = selectTeoGroupEM
            let index
            index = getTeacherName(teachersTeoEM, selectTeoGroupEM)
            console.log("Teoria", selectTeoGroupEM, teocourse, teachersTeoEM[index].name)
        }
        if (teocourse == "Termodinámica y Ondas") {
            teoGroup = selectTeoGroupTW
            let index
            index = getTeacherName(teachersTeoTW, selectTeoGroupTW)
            console.log("Teoria", selectTeoGroupTW, teocourse, teachersTeoTW[index].name)
        }



        console.log("=========>", "labcourse=", labcourse, "group=", labGroup, "Teocourse", teocourse, "TeoGrroup", teoGroup, "Type Of Course", typeOfCourse)

    }


    return (
        <div className="container mx-auto w-full mt-5 z-10 ">


            {/* <Can I="read" a="Grades"> */}
            <>
                <div className='font-bold uppercase text-center text-blue-600 text-1xl font-roboto'>Registrar notas </div>
                <div className='inline-flex font-normal text-slate-600 text-base pl-2 mt-2 font-nunito items-center'>
                    <p> Para ingresar las notas de una actividad debe seguir el siguiente orden: seleccionar el tipo de curso (Laboratorio o Teoria), en seguida la asignatura (Mecánica, Electromagnetismo o Ondas y Termodinámica), luego el grupo y finalmente presionar el botón Mostrar lista</p>
                </div>
                <form onSubmit={handleSubmit}>

                    <div className=" flex  justify-start  px-2 w-fit">

                        <RadioButton_1 course={typeOfCourse} setCourse={setTypeOfCourse} phys="Curso" curso={typeOfCourseErr} setCourseErr={setTypeOfCoursErr} options={TypeOfCourse} />
                    </div>

                    {typeOfCourse == "Laboratorio" && typeOfCourse != null ? <div className='flex flex-col  md:flex-row md:space-x-40 px-2'>
                        <div className="basis-1/2  flex justify-between">

                            <RadioButton_1 course={labcourse} setCourse={setLabCourse} phys="Laboratorio" curso={labcourseErr} setCourseErr={setLabCourseErr} options={CourseOptions} />
                        </div>


                        <div className="basis-1/2 mt-1  ">
                            {labcourse == "Mecánica" ? <ListBox teachers={TeachersTeoMC} groups={GroupsTeoMC} selectGroup={selectLabGroupMC} setSelectGroup={setSelectLabGroupMC} phys="laboratorio" /> : null}
                            {labcourse == "Electromagnetismo" ? <ListBox teachers={TeachersTeoEM} groups={GroupsTeoEM} selectGroup={selectLabGroupEM} setSelectGroup={setSelectLabGroupEM} phys="laboratorio" /> : null}
                            {labcourse == "Termodinámica y Ondas" ? <ListBox teachers={TeachersTeoTW} groups={GroupsTeoTW} selectGroup={selectLabGroupTW} setSelectGroup={setSelectLabGroupTW} phys="laboratorio" /> : null}
                        </div>
                    </div>
                        : null}

                    {typeOfCourse == "Teoria" && typeOfCourse != null ?
                        <div className='flex flex-col  md:flex-row md:space-x-40 px-2'>
                            <div className="basis-1/2  flex justify-between">
                                <RadioButton_1 course={teocourse} setCourse={setTeoCourse} phys="Teoria" curso={teocourseErr} setCourseErr={setTeoCourseErr} options={CourseOptions} />
                            </div>

                            <div className="basis-1/2 mt-1 ">
                                {teocourse == "Mecánica" ? <ListBox teachers={TeachersTeoMC} groups={GroupsTeoMC} selectGroup={selectTeoGroupMC} setSelectGroup={setSelectTeoGroupMC} phys="teoría" /> : null}
                                {teocourse == "Electromagnetismo" ? <ListBox teachers={TeachersTeoEM} groups={GroupsTeoEM} selectGroup={selectTeoGroupEM} setSelectGroup={setSelectTeoGroupEM} phys="teoría" /> : null}
                                {teocourse == "Termodinámica y Ondas" ? <ListBox teachers={TeachersTeoTW} groups={GroupsTeoTW} selectGroup={selectTeoGroupTW} setSelectGroup={setSelectTeoGroupTW} phys="teoría" /> : null}
                            </div>
                        </div>
                        : null}

                    <div className='flex justify-start px-2'>
                        {typeOfCourse != null && teocourse != "" || typeOfCourse != null && labcourse != "" ? <button type="submit" onClick={handleDisplayList} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-1 w-fit h-fit rounded  mt-2 ">
                            Mostrar lista
                        </button> : null}

                    </div>
                </form>
                {typeOfCourse != null && teocourse != "" && displayList == true || typeOfCourse != null && labcourse != "" && displayList == true ? <CourseGradesModal /> : null}
            </>
            {/* </Can> */}
            {/* <Can not I="read" a="Grades">
                <Unauthorized />
            </Can> */}



        </div>

    )
}



export default Teacher