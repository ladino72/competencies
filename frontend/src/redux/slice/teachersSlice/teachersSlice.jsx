import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    data: [
        {
            id: "1",
            name: 'Heindel Ricardo Otero Arévalo',
            courses: ["FIME", "FIEM", "FCOP"], // References to course IDs
            course_groups: [{ "FIME": ["FI01"] }, { "FIEM": ["EM01"] }, { "FCOP": ["FC01"] }]
        },
        {
            id: "2",
            name: 'Raúl Alberto Ruiz Fandiño',
            courses: ["FIME", "FIEM"],
            course_groups: [{ "FIME": ["FI02", "FI03"] }, { "FIEM": ["EM02"] }]
        },
        {
            id: "3",
            name: 'Jorge Enrique Clavijo Ramirez',
            courses: ["FIME", "FIEM", "FCOP"],
            course_groups: [{ "FIME": ["FI04"] }, { "FIEM": ["EM03"] }, { "FCOP": ["FC02"] }]
        },
        {
            id: "4",
            name: 'Daissy Haidee Garcés Najar',
            courses: ["FUME", "FIME"],
            course_groups: [{ "FUME": ["FU01", "FU02"] }, { "FIME": ["FI04"] }]
        },
        {
            id: "5",
            name: 'Luis Alejandro Ladino Gaspar',
            courses: ["FUME", "FIEM", "FCOP"],
            course_groups: [{ "FUME": ["FU03"] }, { "FIEM": ["EM04"] }, { "FCOP": ["FC03", "FC04"] }]

        },

        // ... more teacher objects
    ],
    selectedTeacher: null, // ID of the currently selected teacher
};

export const teachersSlice = createSlice({
    name: 'teachers',
    initialState,
    reducers: {
        setTeachers: (state, action) => {
            state.data = action.payload;
        },
        selectTeacher: (state, action) => {
            state.selectedTeacher = action.payload;
        },
    },
});

export const { setTeachers, selectTeacher } = teachersSlice.actions;


export default teachersSlice.reducer;