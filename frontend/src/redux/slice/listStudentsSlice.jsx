import React from 'react'
import { createAsyncThunk, createSlice, nanoid } from "@reduxjs/toolkit"
import axios from "axios"

// Redux ToolKit
// https://www.google.com/search?q=video+reduxtoolkit+carlos+azaustre&client=ubuntu-sn&hs=PS6&channel=fs&sxsrf=APwXEdet5HT-qQGS7cTr8-TzTT2WsE8_fQ%3A1686576400496&ei=EB2HZIz7He78wbkP3_qRsAY&ved=0ahUKEwiMw_PZ6r3_AhVufjABHV99BGYQ4dUDCA4&uact=5&oq=video+reduxtoolkit+carlos+azaustre&gs_lp=Egxnd3Mtd2l6LXNlcnAiInZpZGVvIHJlZHV4dG9vbGtpdCBjYXJsb3MgYXphdXN0cmUyBxAhGKABGApIoi9Q8g5Yti5wAXgBkAEAmAHFAaABrxOqAQQwLjE1uAEDyAEA-AEBwgIKEAAYRxjWBBiwA8ICBhAAGBYYHsICCBAAGIoFGIYDwgIFEAAYogTCAgQQIRgV4gMEGAAgQYgGAZAGCA&sclient=gws-wiz-serp#fpstate=ive&vld=cid:43c03b12,vid:fMiFnbufAP4


const studentList = [
    {
        name: "Fernando Guillermo Baez Salamanca",
        grades: [
            { n1: "", n2: "", n3: "", cp: "CLF", checked: false },
            { n1: "", n2: "", n3: "", cp: "UTF", checked: false },
            { n1: "", n2: "", n3: "", cp: "UCM", checked: false },
            { n1: "", n2: "", n3: "", cp: "PRC", checked: false },
            { n1: "", n2: "", n3: "", cp: "ULC", checked: false }
        ],
        id: nanoid(),




    },
    {
        name: "Elkin Hernando Losada Gaspar",
        grades: [
            { n1: "", n2: "", n3: "", cp: "CLF", checked: false },
            { n1: "", n2: "", n3: "", cp: "UTF", checked: false },
            { n1: "", n2: "", n3: "", cp: "UCM", checked: false },
            { n1: "", n2: "", n3: "", cp: "PRC", checked: false },
            { n1: "", n2: "", n3: "", cp: "ULC", checked: false }
        ],
        id: nanoid(),




    },
    {
        name: "Karla Helena Perez Pollard ",
        grades: [
            { n1: "", n2: "", n3: "", cp: "CLF", checked: false },
            { n1: "", n2: "", n3: "", cp: "UTF", checked: false },
            { n1: "", n2: "", n3: "", cp: "UCM", checked: false },
            { n1: "", n2: "", n3: "", cp: "PRC", checked: false },
            { n1: "", n2: "", n3: "", cp: "ULC", checked: false }
        ],
        id: nanoid(),

    },
    {
        name: "Daniel Efrain Zacarías Malaquías",
        grades: [
            { n1: "", n2: "", n3: "", cp: "CLF", checked: false },
            { n1: "", n2: "", n3: "", cp: "UTF", checked: false },
            { n1: "", n2: "", n3: "", cp: "UCM", checked: false },
            { n1: "", n2: "", n3: "", cp: "PRC", checked: false },
            { n1: "", n2: "", n3: "", cp: "ULC", checked: false }
        ],
        id: nanoid(),

    },
    {
        name: "Daniela Lorena Ladino Acevedo",
        grades: [
            { n1: "", n2: "", n3: "", cp: "CLF", checked: false },
            { n1: "", n2: "", n3: "", cp: "UTF", checked: false },
            { n1: "", n2: "", n3: "", cp: "UCM", checked: false },
            { n1: "", n2: "", n3: "", cp: "PRC", checked: false },
            { n1: "", n2: "", n3: "", cp: "ULC", checked: false }
        ],
        id: nanoid(),

    },
    {
        name: "Angela Lorena López Acevedo",
        grades: [
            { n1: "", n2: "", n3: "", cp: "CLF", checked: false },
            { n1: "", n2: "", n3: "", cp: "UTF", checked: false },
            { n1: "", n2: "", n3: "", cp: "UCM", checked: false },
            { n1: "", n2: "", n3: "", cp: "PRC", checked: false },
            { n1: "", n2: "", n3: "", cp: "ULC", checked: false }
        ],
        id: nanoid(),

    },
    {
        name: "Andrea Lesmes Acevedo",
        grades: [
            { n1: "", n2: "", n3: "", cp: "CLF", checked: false },
            { n1: "", n2: "", n3: "", cp: "UTF", checked: false },
            { n1: "", n2: "", n3: "", cp: "UCM", checked: false },
            { n1: "", n2: "", n3: "", cp: "PRC", checked: false },
            { n1: "", n2: "", n3: "", cp: "ULC", checked: false }
        ],
        id: nanoid(),

    },
    {
        name: "Pedro Lancheros Sears",
        grades: [
            { n1: "", n2: "", n3: "", cp: "CLF", checked: false },
            { n1: "", n2: "", n3: "", cp: "UTF", checked: false },
            { n1: "", n2: "", n3: "", cp: "UCM", checked: false },
            { n1: "", n2: "", n3: "", cp: "PRC", checked: false },
            { n1: "", n2: "", n3: "", cp: "ULC", checked: false }
        ],
        id: nanoid(),

    }
]

const initialState = {
    studentList: [],
    loading: false,
    error: null,
}

export const listStudentsSlice = createSlice({
    name: "ListStudents",
    initialState,
    reducers: {
        initState: (state, action) => {
            state.studentList = action.payload.updatedStudents;
            // const { updatedStudents } = action.payload;
            // console.log("from slice::::::::::::::", updatedStudents)
            // state.studentList = updatedStudents;
        },

        inputGrades: (state, action) => {

            const { studentID_: id, gradesParcel: gradesParcel } = action.payload

            //const index = state.studentList.map(object => object.id).indexOf(id);  OK

            const index = state.studentList.findIndex(student => student.id === id);

            state.studentList[index].scores = gradesParcel
        },

        clearStudentList: (state) => {
            state.studentList = []; // Clear the studentList array
        },

        removeStudents: (state, action) => {
            const studentIdsToRemove = action.payload;
            state.studentList = state.studentList.filter(student => !studentIdsToRemove.includes(student.id));
        },
    },
});

export const { initState, inputGrades, clearStudentList, removeStudents } = listStudentsSlice.actions;
export default listStudentsSlice.reducer;


