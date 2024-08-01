import { setStudents, selectStudent } from './studentsSlice';

// This is just an example. You should implement actual API calls.
export const fetchStudents = () => async (dispatch) => {
    try {
        // Fetch teachers data from an API
        const response = await fetch('/api/students');
        const data = await response.json();

        dispatch(setStudents(data));
    } catch (error) {
        // Handle error
    }
};
