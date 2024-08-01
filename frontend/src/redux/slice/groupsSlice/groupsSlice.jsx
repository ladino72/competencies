import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    data: [
        {
            id: "FU01",
            name: 'Group 01',
            students: ["1", "7"], // References to student IDs
        },
        {
            id: "FU02",
            name: 'Group 02',
            students: ["1", "2"], // References to student IDs
        },
        {
            id: "FU03",
            name: 'Group 03',
            students: ["1", "2"], // References to student IDs
        },
        {
            id: "FU04",
            name: 'Group 04',
            students: ["2", "7"], // References to student IDs
        },

        {
            id: "FI01",
            name: 'Group 01',
            students: ["5", "6"],
        },
        {
            id: "FI02",
            name: 'Group 02',
            students: ["3", "4", "1"],
        },
        {
            id: "FI03",
            name: 'Group 03',
            students: ["3", "4", "1"],
        },
        {
            id: "FI04",
            name: 'Group 04',
            students: ["3", "4", "1"],
        },
        {
            id: "EM01",
            name: 'Group 01',
            students: ["1", "4", "7"],
        },
        {
            id: "EM02",
            name: 'Group 02',
            students: ["1", "4", "7"],
        },
        {
            id: "EM03",
            name: 'Group 03',
            students: ["1", "2", "3", "4", "5", "6", "7"],
        },
        {
            id: "EM04",
            name: 'Group 0',
            students: ["1", "5", "7"],
        },
        {
            id: "FC01",
            name: 'Group 01',
            students: ["3", "4", "7"],
        },
        {
            id: "FC02",
            name: 'Group 02',
            students: ["3", "1", "7"],
        },
        {
            id: "FC03",
            name: 'Group 03',
            students: ["1", "2", "5", "6"],
        },
        {
            id: "FC04",
            name: 'Group 04',
            students: ["3", "4", "2", "7"],
        },
        // ... more group objects
    ],
    selectedGroup: null, // ID of the currently selected group
};

export const groupsSlice = createSlice({
    name: 'groups',
    initialState,
    reducers: {
        setGroups: (state, action) => {
            state.data = action.payload;
        },
        selectGroup: (state, action) => {
            state.selectedGroup = action.payload;
        },
    },
});

export const { setGroups, selectGroup } = groupsSlice.actions;
export default groupsSlice.reducer;