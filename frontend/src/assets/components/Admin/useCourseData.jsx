import { useState, useEffect } from 'react';
import api from '../../../utils/AxiosInterceptos/interceptors';

const useCourseData = (token) => {
    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [coursesAndGroups, setCoursesAndGroups] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch courses
                const coursesResponse = await api.get('http://localhost:3500/courses/allcourses', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });
                setCourses(coursesResponse.data);

                // Fetch courses with groups
                const coursesAndGroupsResponse = await api.get('http://localhost:3500/courses/courses-and-groups', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });
                setCoursesAndGroups(coursesAndGroupsResponse.data);

                // Fetch teachers
                const teachersResponse = await api.get('http://localhost:3500/users/?role=teacher', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });
                setTeachers(teachersResponse.data);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchData();
    }, [token]);

    return { courses, teachers, coursesAndGroups, error };
};

export default useCourseData;
