import React from 'react'
import { configureStore } from '@reduxjs/toolkit'
import listStudentsReducer from '../slice/listStudentsSlice'
import teachersReducer from '../slice/teachersSlice/teachersSlice';
import coursesReducer from "../slice/coursesSlice/coursesSlice"
import groupsReducer from "../slice/groupsSlice/groupsSlice"
import studentsReducer from "../slice/studentsSlice/studentsSlice"
import userReducer from "../slice/userSlice/userSlice"



export const store = configureStore({
    reducer: {
        ListStudents: listStudentsReducer,
        teachers: teachersReducer,
        courses: coursesReducer,
        groups: groupsReducer,
        students: studentsReducer,
        user: userReducer
    },
    // Enable Redux DevTools Extension
    devTools: process.env.NODE_ENV !== 'production',
})



export default store;