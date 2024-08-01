import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import api from "../../../../utils/AxiosInterceptos/interceptors";
import { useSelector } from 'react-redux';
import SelectCourse from './SelectCourse';
import GroupedBarChart from './GroupedBarChart ';

const validationSchema = Yup.object().shape({

    threshold: Yup.number().required('Threshold is required'),
});

const GroupsComparisonGraphC = () => {

    const [loading, setLoading] = useState(true);

    const [threshold, setThreshold] = useState("");
    const [data, setData] = useState(null);
    const [token] = useState(localStorage.getItem('token'));

    const [infoChartGroup, setInfoChartGroup] = useState([]);
    const [infoChartCourse, setInfoChartCourse] = useState([]);
    const [competencyLabelsGroup, setCompetencyLabelsGroup] = useState([]);
    const [competencyLabelsCourse, setCompetencyLabelsCourse] = useState([]);

    const [courseIds, setCourseIds] = useState(null);
    const coordinatorID = useSelector((state) => state.user.user.id);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [error, setError] = useState(null);

    const handleCourseSelect = (courseId) => {
        setSelectedCourseId(courseId);
        console.log('Selected Course ID:', courseId);
    };


    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get(`http://localhost:3500/courses/coordinator/${coordinatorID}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setCourseIds(response.data.courses);
            } catch (err) {
                if (err.response) {
                    if (err.response.status === 404) {
                        setError(err.response.data.message || 'No courses found for this coordinator.');
                        toast.error(err.response.data.message || 'No courses found for this coordinator.');
                    } else {
                        setError(`Server responded with status ${err.response.status}: ${err.response.data.message || err.response.statusText}`);
                        toast.error(`Server responded with status ${err.response.status}: ${err.response.data.message || err.response.statusText}`);
                    }
                } else if (err.request) {
                    setError('No response received from the server. Please try again later.');
                    toast.error('No response received from the server. Please try again later.');
                } else {
                    setError(`Error in setting up the request: ${err.message}`);
                    toast.error(`Error in setting up the request: ${err.message}`);
                }
            } finally {
                setLoading(false);
            }
        };

        if (coordinatorID) {
            fetchCourses();
        }
    }, [coordinatorID, token]);

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
            const response = await api.get(`http://localhost:3500/statistics/course/${selectedCourseId}/threshold/${threshold}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setData(response.data.activities);
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
        if (selectedCourseId && threshold) {
            fetchData();
        }
    }, [selectedCourseId, threshold]);


    useEffect(() => {
        if (data) {

            const transformDataGgroup = (activities) => {
                const competencyData = {};

                activities.forEach((activity) => {
                    const competency = activity._id; // Assuming competency name is directly in activity._id

                    // Initialize competency data for all five competencies (CLF, PRC, UCM, ULC, UTF)
                    if (!competencyData[competency]) {
                        competencyData[competency] = [];
                    }

                    activity.info.forEach((infoItem) => {
                        const { _id: { group: { g_Id } }, passsedPercentN1_RelativeToGroup, passsedPercentN2_RelativeToGroup, passsedPercentN3_RelativeToGroup } = infoItem;

                        // Find group data for this competency
                        let groupData = competencyData[competency].find((group) => group.group === g_Id);

                        // If group doesn't exist, create a new one
                        if (!groupData) {
                            groupData = {
                                group: g_Id,
                                grades: [],
                            };
                            competencyData[competency].push(groupData);
                        }

                        // Update existing group data with grades
                        groupData.grades.push(passsedPercentN1_RelativeToGroup, passsedPercentN2_RelativeToGroup, passsedPercentN3_RelativeToGroup);
                    });
                });

                // Convert competency data object to desired array structure
                return Object.keys(competencyData).map((competency) => {
                    return {
                        competency: competency, // Include competency name
                        groups: competencyData[competency],
                    };
                });
            };


            const gradesData = transformDataGgroup(data);

            // Sorted groups names alphabetically, for example FIEM05, FIEM01 ----------> FIEM01, FIEM05
            const sortedGradesData = gradesData.map(element => {
                // Clone the element object (including the groups array)
                const sortedElement = { ...element };
                // Sort the groups array by the "group" property of its objects
                sortedElement.groups.sort((a, b) => (a.group < b.group ? -1 : 1));
                // Return the element with the sorted groups array
                return sortedElement;
            });



            // Generate competency labels array
            const Labels = sortedGradesData.map((competency) => {
                const labels = [];
                for (let i = 1; i <= 3; i++) {
                    labels.push(`${competency.competency}N${i}`);
                }
                return labels;
            });


            setCompetencyLabelsGroup(Labels)
            setInfoChartGroup(sortedGradesData)

            console.log("DATA:::::::::::::>", sortedGradesData)
            console.log("Competency Labels:::::::::::::", Labels);
        }
    }, [data]);


    useEffect(() => {
        if (data) {
            const transformDataCourse = (activities) => {
                const competencyData = {};

                activities.forEach((activity) => {
                    const competency = activity._id; // Assuming competency name is directly in activity._id

                    // Initialize competency data for all five competencies (CLF, PRC, UCM, ULC, UTF)
                    if (!competencyData[competency]) {
                        competencyData[competency] = [];
                    }

                    activity.info.forEach((infoItem) => {
                        const { _id: { group: { g_Id } }, passsedPercentN1_RelativeToCourse, passsedPercentN2_RelativeToCourse, passsedPercentN3_RelativeToCourse } = infoItem;

                        // Find group data for this competency
                        let groupData = competencyData[competency].find((group) => group.group === g_Id);

                        // If group doesn't exist, create a new one
                        if (!groupData) {
                            groupData = {
                                group: g_Id,
                                grades: [],
                            };
                            competencyData[competency].push(groupData);
                        }

                        // Update existing group data with grades
                        groupData.grades.push(passsedPercentN1_RelativeToCourse, passsedPercentN2_RelativeToCourse, passsedPercentN3_RelativeToCourse);
                    });
                });

                // Convert competency data object to desired array structure
                return Object.keys(competencyData).map((competency) => {
                    return {
                        competency: competency, // Include competency name
                        groups: competencyData[competency],
                    };
                });
            };


            const gradesData = transformDataCourse(data);

            // Sorted groups names alphabetically, for example FIEM05, FIEM01 ----------> FIEM01, FIEM05
            const sortedGradesData = gradesData.map(element => {
                // Clone the element object (including the groups array)
                const sortedElement = { ...element };
                // Sort the groups array by the "group" property of its objects
                sortedElement.groups.sort((a, b) => (a.group < b.group ? -1 : 1));
                // Return the element with the sorted groups array
                return sortedElement;
            });



            // Generate competency labels array
            const Labels = sortedGradesData.map((competency) => {
                const labels = [];
                for (let i = 1; i <= 3; i++) {
                    labels.push(`${competency.competency}N${i}`);
                }
                return labels;
            });


            setCompetencyLabelsCourse(Labels)
            setInfoChartCourse(sortedGradesData)

            console.log("DATA:::::::::::::", sortedGradesData)
            console.log("Competency Labels:::::::::::::", Labels);
        }
    }, [data]);

    // const gradesData = [
    //     { group: 'Group 01', grades: [85, 72, 90] },
    //     { group: 'Group 02', grades: [78, 81, 75] },
    //     { group: 'Group 03', grades: [38, 11, 65] },
    //     { group: 'Group 04', grades: [58, 91, 95] },
    //     { group: 'Group 05', grades: [88, 71, 15] },
    //     { group: 'Group 06', grades: [68, 61, 25] },
    //     { group: 'Group 07', grades: [48, 31, 55] },
    //     // Add more courses here as needed
    // ];

    // const competencyLabels1 = ['CLFN1', 'CLFN2', 'CLFN3'];

    return (
        <div className="container mx-auto  flex flex-col justify-center items-center">
            <div className="flex justify-center items-center ">
                {courseIds && <SelectCourse courses={courseIds} onCourseSelect={handleCourseSelect} />}
            </div>
            <div>
                <h1 className="text-2xl font-bold mb-4">Seleccione un umbral</h1>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <Formik
                        initialValues={{ threshold: '' }}
                        validationSchema={validationSchema}
                        onSubmit={(values, { setSubmitting }) => {

                            setThreshold(values.threshold);
                            setSubmitting(false);
                        }}
                    >
                        {({ isSubmitting }) => (
                            <Form>
                                <div className="flex flex-col">


                                    <Field as="select" name="threshold">
                                        <option value="">Seleccione un umbral</option>
                                        {[1.0, 1.1, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9].map((value, index) => (
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

            {infoChartCourse.length > 0 && <div className='text-lg text-blue-500 font-semibold py-6 capitalize'>Porcentajes de aprobación mayores al umbral con respecto al total de estudiantes del grupo</div>}


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50">
                {infoChartGroup.length > 0 &&
                    infoChartGroup.map((data, index) => (
                        <div key={index}>
                            <GroupedBarChart
                                gradesData={data.groups}
                                competencyLabels={competencyLabelsGroup[index]}
                            />
                        </div>
                    ))}
            </div>

            {infoChartCourse.length > 0 && <div className='text-lg text-blue-500 font-semibold py-2 capitalize'>Porcentajes de aprobación mayores al umbral con respecto al total de estudiantes del curso</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50">
                {infoChartCourse.length > 0 &&
                    infoChartCourse.map((data, index) => (
                        <div key={index}>
                            <GroupedBarChart
                                gradesData={data.groups}
                                competencyLabels={competencyLabelsCourse[index]}
                            />
                        </div>
                    ))}
            </div>

        </div>
    );
};

export default GroupsComparisonGraphC;