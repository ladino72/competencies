import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    data: [
        {
            id: "FUME",
            name: 'Fundamentos de Mecánica',
            groups: ["FU01", "FU02", "FU03"], // References to group IDs
        },
        {
            id: "FIME",
            name: 'Mecánica',
            groups: ["FI01", "FI02", "FI03"],
        },
        {
            id: "FIEM",
            name: 'Electromagnetismo',
            groups: ["EM01", "EM02", "EM03", "EM04"],
        },
        {
            id: "FCOP",
            name: 'Calor, Ondas y Partículas',
            groups: ["FC01", "FC02", "FC03", "FC04"],
        },
        // ... more course objects
    ],
    selectedCourse: null, // Array of course IDs selected by the course

};

export const coursesSlice = createSlice({
    name: 'courses',
    initialState,
    reducers: {
        setCourses: (state, action) => {
            state.data = action.payload;
        },
        selectCourse: (state, action) => {
            state.selectedCourse = action.payload;
        },
    },
});

export const { setCourses, selectCourse } = coursesSlice.actions;
export default coursesSlice.reducer;