import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    data: [
        {
            id: "1",
            name: 'Student 1',
            age: 23,
            grades: [
                { n1: "", n2: "", n3: "", cp: "CLF", checked: false },
                { n1: "", n2: "", n3: "", cp: "UTF", checked: false },
                { n1: "", n2: "", n3: "", cp: "UCM", checked: false },
                { n1: "", n2: "", n3: "", cp: "PRC", checked: false },
                { n1: "", n2: "", n3: "", cp: "ULC", checked: false }
            ],
        },
        {
            id: "2",
            name: 'Student 2',
            age: 20,
            grades: [
                { n1: "", n2: "", n3: "", cp: "CLF", checked: false },
                { n1: "", n2: "", n3: "", cp: "UTF", checked: false },
                { n1: "", n2: "", n3: "", cp: "UCM", checked: false },
                { n1: "", n2: "", n3: "", cp: "PRC", checked: false },
                { n1: "", n2: "", n3: "", cp: "ULC", checked: false }
            ],
        },
        {
            id: "3",
            name: 'Student 3',
            age: 18,
            grades: [
                { n1: "", n2: "", n3: "", cp: "CLF", checked: false },
                { n1: "", n2: "", n3: "", cp: "UTF", checked: false },
                { n1: "", n2: "", n3: "", cp: "UCM", checked: false },
                { n1: "", n2: "", n3: "", cp: "PRC", checked: false },
                { n1: "", n2: "", n3: "", cp: "ULC", checked: false }
            ],
        },
        {
            id: "4",
            name: 'Student 4',
            age: 19,
            grades: [
                { n1: "", n2: "", n3: "", cp: "CLF", checked: false },
                { n1: "", n2: "", n3: "", cp: "UTF", checked: false },
                { n1: "", n2: "", n3: "", cp: "UCM", checked: false },
                { n1: "", n2: "", n3: "", cp: "PRC", checked: false },
                { n1: "", n2: "", n3: "", cp: "ULC", checked: false }
            ],
        },
        {
            id: "5",
            name: 'Student 5',
            age: 21,
            grades: [
                { n1: "", n2: "", n3: "", cp: "CLF", checked: false },
                { n1: "", n2: "", n3: "", cp: "UTF", checked: false },
                { n1: "", n2: "", n3: "", cp: "UCM", checked: false },
                { n1: "", n2: "", n3: "", cp: "PRC", checked: false },
                { n1: "", n2: "", n3: "", cp: "ULC", checked: false }
            ],
        },
        {
            id: "6",
            name: 'Student 6',
            age: 19,
            grades: [
                { n1: "", n2: "", n3: "", cp: "CLF", checked: false },
                { n1: "", n2: "", n3: "", cp: "UTF", checked: false },
                { n1: "", n2: "", n3: "", cp: "UCM", checked: false },
                { n1: "", n2: "", n3: "", cp: "PRC", checked: false },
                { n1: "", n2: "", n3: "", cp: "ULC", checked: false }
            ],
        },
        {
            id: "7",
            name: 'Student 7',
            age: 19,
            grades: [
                { n1: "", n2: "", n3: "", cp: "CLF", checked: false },
                { n1: "", n2: "", n3: "", cp: "UTF", checked: false },
                { n1: "", n2: "", n3: "", cp: "UCM", checked: false },
                { n1: "", n2: "", n3: "", cp: "PRC", checked: false },
                { n1: "", n2: "", n3: "", cp: "ULC", checked: false }
            ],
        },
        // ... more student objects
    ],
    selectedStudent: null, // Array of course IDs selected by the course

};

export const studentsSlice = createSlice({
    name: 'students',
    initialState,
    reducers: {
        setStudents: (state, action) => {
            state.data = action.payload;
        },
        selectStudent: (state, action) => {
            state.selectedStudent = action.payload;
        },
    },
});

export const { setStudents, selectStudent } = studentsSlice.actions;
export default studentsSlice.reducer;