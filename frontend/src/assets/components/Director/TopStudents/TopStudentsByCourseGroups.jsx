import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import api from "../../../../utils/AxiosInterceptos/interceptors";


const validationSchema = Yup.object().shape({
    courseId: Yup.string().required('Course is required'),
    threshold: Yup.number().required('Threshold is required'),

});

const TopStudentsByCourseGroups = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedCourseName, setSelectedCourseName] = useState("");
    const [threshold, setThreshold] = useState("");

    const [data, setData] = useState(null);
    const [token] = useState(localStorage.getItem('token'));



    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await api.get('http://localhost:3500/courses/allcourses', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setCourses(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching courses:', error);
            }
        };

        fetchCourses();
    }, []);

    useEffect(() => {
        if (!token) {
            // Token does not exist in local storage, handle this case
            toast.error('Token is missing or invalid');
            // You can redirect the user to the login page or show an error message
            return;
        }
    })

    const fetchData = async () => {
        try {
            const response = await api.get(`http://localhost:3500/grades/topGrades/courseId/${selectedCourse}/threshold/${threshold}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setData(response.data.activityIds);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            if (error.response && error.response.status === 404) {
                toast.error('No existen datos disponibles');
            } else if (error.response && error.response.status === 500) {
                toast.error('Internal Server Error');
            } else {
                console.error('Unhandled error response:', error.response);
                toast.error('An unexpected error occurred');
            }

            setData([]);
        }
    };

    useEffect(() => {
        if (selectedCourse && threshold) {
            fetchData();
        }
    }, [selectedCourse, threshold]);


    if (data) {
        console.log("----------------------------", data[0]?.total[0]?.grupo)
    }



    return (
        <div className="container mx-auto  flex flex-col justify-center items-center">
            <div>
                <h1 className="text-2xl font-bold mb-4">Seleccione un curso y un umbral</h1>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <Formik
                        initialValues={{ courseId: '', threshold: '' }}
                        validationSchema={validationSchema}
                        onSubmit={(values, { setSubmitting }) => {
                            setSelectedCourse(values.courseId);
                            const selectedCourseObj = courses.find(course => course._id === values.courseId);
                            setSelectedCourseName(selectedCourseObj ? selectedCourseObj.name : "");
                            setThreshold(values.threshold);

                            setSubmitting(false);
                        }}
                    >
                        {({ isSubmitting }) => (
                            <Form>
                                <div className="flex flex-col ">
                                    <Field as="select" name="courseId" className="mb-2">
                                        <option value="">Seleccione un curso</option>
                                        {courses.map(course => (
                                            <option key={course._id} value={course._id}>
                                                {course.name}
                                            </option>
                                        ))}
                                    </Field>
                                    <ErrorMessage name="courseId" component="div" className="text-red-500 ml-2" />

                                    <Field as="select" name="threshold">
                                        <option value="">Seleccione un umbral</option>
                                        {[1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9].map((value, index) => (
                                            <option key={index} value={value}>
                                                {value}
                                            </option>
                                        ))}
                                    </Field>
                                    <ErrorMessage name="threshold" component="div" className="text-red-500 ml-2" />


                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-md focus:outline-none focus:bg-blue-600 mt-2"
                                    disabled={isSubmitting}
                                >
                                    Traer datos
                                </button>
                            </Form>
                        )}
                    </Formik>
                )}
            </div>
            {data && <div className='text-blue_600 py-2'>Lista de estudiantes por grupo que alcanzaron por lo menos una competencia en los tres niveles por encima del umbral.</div>}

            {data && (
                <div className='w-full  px-4 pt-2'>
                    {data[0]?.total.map((item, index) => (
                        <div key={index}>
                            <table className="border border-collapse bg-slate-200 w-full mt-4" style={{ tableLayout: 'fixed' }}>
                                <thead>
                                    <tr>
                                        <th className="text-blue-600 px-2 text-center font-medium ">Grupo</th>
                                        <th className="text-blue-600 px-2 text-center   font-medium"># EG</th>
                                        <th className="text-blue-600 px-2 text-center    font-medium"># EC</th>
                                        <th className="text-blue-600 px-2 text-center    font-medium"># PUmbral</th>
                                        <th className="text-blue-600 px-2 text-center    font-medium">% PG</th>
                                        <th className="text-blue-600 px-2 text-center    font-medium">% PC</th>
                                    </tr>
                                </thead>
                                <tbody className='bg-sky-100 pb-4'>
                                    <tr>
                                        <td className="px-2 text-center">{item.grupo}</td>
                                        <td className="px-2 text-center">{item.numStudentsInGroup}</td>
                                        <td className="px-2 text-center">{item.totalActiveParticipantsByCourse}</td>
                                        <td className="px-2 text-center">{item.totalAchieversByGroup}</td>
                                        <td className="px-2 text-center">{item.percentageAchieversRelativeToGroup.toFixed(2)}</td>
                                        <td className="px-2 text-center">{item.percentageAchieversRelativeToCourse.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className="flex flex-col items-center bg-slate-50">
                                {item.students
                                    .slice()
                                    .sort((a, b) => b.numOfAchivedCompetencies - a.numOfAchivedCompetencies)
                                    .map((student, studentIndex) => (
                                        <div key={studentIndex}>
                                            <div>
                                                <span className="font-medium">{student.studentName}</span>
                                            </div>

                                            <table className="border border-collapse w-full " style={{ tableLayout: 'fixed' }}>
                                                <thead>
                                                    <tr>
                                                        <th className="font-normal px-2 text-center">Competencia</th>
                                                        <th className="font-normal px-2 text-center">AvgN1</th>
                                                        <th className="font-normal px-2 text-center">AvgN2</th>
                                                        <th className="font-normal px-2 text-center">AvgN3</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {student.data.map((competency, competencyIndex) => (
                                                        <tr key={competencyIndex}>
                                                            <td className="px-2 text-center  ">{competency.competency}</td>
                                                            <td className="px-2 text-center  ">{competency.avgN1 !== null ? competency.avgN1.toFixed(2) : "-"}</td>
                                                            <td className="px-2 text-center   ">{competency.avgN2 !== null ? competency.avgN2.toFixed(2) : "-"}</td>
                                                            <td className="px-2 text-center   ">{competency.avgN3 !== null ? competency.avgN3.toFixed(2) : "-"}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}




        </div>
    );
};

export default TopStudentsByCourseGroups;