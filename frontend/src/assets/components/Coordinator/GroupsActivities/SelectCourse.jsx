import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const SelectCourse = ({ courses, onCourseSelect }) => {
    const formik = useFormik({
        initialValues: {
            courseId: ''
        },
        validationSchema: Yup.object({
            courseId: Yup.string().required('Please select a course')
        }),
        onSubmit: values => {
            onCourseSelect(values.courseId);
        }
    });

    const handleCourseChange = (e) => {
        formik.handleChange(e);
        formik.setFieldValue('courseId', e.target.value);
        onCourseSelect(e.target.value);
    };

    return (
        <form>
            <div className="mb-4">
                <label className="block text-gray-700 text-lg font-bold mb-2">Seleccione un curso:</label>
                {courses.map(course => (
                    <div key={course._id} className="mb-2">
                        <label>
                            <input
                                type="radio"
                                name="courseId"
                                value={course._id}
                                onChange={handleCourseChange}
                                checked={formik.values.courseId === course._id}
                                className="mr-2 leading-tight"
                            />
                            <span className="text-sm">{course.name}</span>
                        </label>
                    </div>
                ))}
            </div>
            {formik.errors.courseId ? (
                <div className="text-red-500 text-xs">{formik.errors.courseId}</div>
            ) : null}
        </form>
    );
};

export default SelectCourse;
