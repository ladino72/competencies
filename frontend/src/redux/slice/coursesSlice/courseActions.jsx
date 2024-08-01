import { setCourses, selectCourse } from './coursesSlice';

// This is just an example. You should implement actual API calls.
export const fetchCourses = () => async (dispatch) => {
    try {
        // Fetch teachers data from an API
        const response = await fetch('/api/courses');
        const data = await response.json();

        dispatch(setCourses(data));
    } catch (error) {
        // Handle error
    }
};
