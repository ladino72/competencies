// AdditionalInfoCollection.js

import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import CustomSelectGroup from './SignupComponents/CustomSelectGroup';

const AdditionalInfoCollection = ({ groups, handleSubmit }) => {
    const renderCustomSelectGroups = () => {
        const keys = Object.keys(groups);

        return keys.map((key) => (
            <CustomSelectGroup
                key={key}
                label={key}
                name={key.toLowerCase()}
                options={groups[key].map((group) => ({
                    value: group.id,
                    label: group.g_Id,
                }))}
            />
        ));
    };

    return (
        <Formik
            initialValues={{
                fume: '',
                fime: '',
                fimel: '',
                fiem: '',
                fieml: '',
                fcop: '',
                fcopl: '',
            }}
            validationSchema={Yup.object().shape({
                fume: Yup.string(),
                fime: Yup.string(),
                fimel: Yup.string(),
                fiem: Yup.string(),
                fieml: Yup.string(),
                fcop: Yup.string(),
                fcopl: Yup.string(),

                // Ensuring at least one group is selected from the courses offered
                atLeastOneGroup: Yup.string().test('atLeastOneGroup', 'Please select at least one group', function (value) {
                    const { fume, fime, fimel, fiem, fieml, fcop, fcopl } = this.parent;
                    return fume || fime || fimel || fiem || fieml || fcop || fcopl;
                })

            })}
            onSubmit={handleSubmit}
        >
            {({ handleSubmit, handleChange, handleBlur, values, touched, errors, resetForm }) => (
                <Form>
                    {/* Courses and groups */}
                    <div className='text-normal font-bold'>Courses</div>

                    {Object.keys(groups).length > 0 && (
                        <div className='grid grid-cols-4 gap-4'>{renderCustomSelectGroups()}</div>
                    )}


                    {/* Display the error message for atLeastOneGroup */}
                    {errors.atLeastOneGroup && (
                        <div className="error-message text-red-500">{errors.atLeastOneGroup}</div>
                    )}

                    {/* Add error message handling for additional info fields if required */}

                    {/* Submit button */}
                    <button type='submit' className='flex justify-center items-center bg-blue-500 text-white font-bold py-1 mt-2 px-4 rounded focus:outline-none'>
                        Registro completado
                    </button>
                </Form>
            )}
        </Formik>
    );
};

export default AdditionalInfoCollection;
