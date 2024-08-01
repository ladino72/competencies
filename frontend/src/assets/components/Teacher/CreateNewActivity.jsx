import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Define the validation schema using Yup
const validationSchema = Yup.object({
    textInput: Yup.string().max(200, 'Longitud del texto no debe exceder 100 caracteres.').required('Se requiere una descripción'),
    activityType: Yup.string().required('Se requiere una opción'),
});

// Define the CreateActivity component
const CreateNewActivity = ({ onSubmit, activityCount, isCreateActivityButtonDisable }) => {

    const [disableCreateActivityButton, SetDisableCreateActivityButton] = useState(isCreateActivityButtonDisable) //NEW
    const [description, SetDescription] = useState("")   //NEW
    const [type, SetType] = useState("")   //NEW


    const handleEnableCreateNewActivity = () => {
        if (description !== "" & type !== "") {
            SetDisableCreateActivityButton(true)
        } else { SetDisableCreateActivityButton(false) }
    }


    useEffect(() => {
        // Perform actions when isCreateActivityButtonDisabled changes
        if (disableCreateActivityButton) {
            console.log('Button disabled!');
            // Perform actions when the button is disabled
        } else {
            console.log('Button enabled!');
            // Perform actions when the button is enabled
        }
    }, [disableCreateActivityButton]); // Only re-run the effect if disableCreateActivityButton changes


    // Formik hook for managing form state and validation
    const formik = useFormik({
        initialValues: {
            textInput: '',
            activityType: '',
        },
        validationSchema,
        onSubmit: (values) => {
            // Pass data to the parent component
            SetDescription(values.textInput)        //NEW
            SetType(values.activityType)            //NEW

            onSubmit({ description: values.textInput, type: values.activityType });
        },
    });



    return (
        <form onSubmit={formik.handleSubmit}>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 items-center justify-items-center bg-blue-100 py-2 shadow-lg rounded-sm'>

                <div className='font-semibold w-full place-self-start'>
                    Actividad: {activityCount + 1}
                </div>
                {/* Text Input */}
                <div className='flex flex-col w-full lg:w-full  place-self-start px-1'> {/* Limit width for larger screens */}
                    <div className='font-semibold  '>
                        <label htmlFor="textInput">Descripción:</label>
                    </div>
                    <div className='flex flex-col '>
                        <div className='w-full'>
                            <textarea
                                id="textInput"
                                name="textInput"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.textInput}
                                placeholder='Suministre una breve descipción de la actividad realizada'
                                //style={{ maxWidth: '100%', overflow: 'auto', height: '100px' }}
                                className='w-full h-12  overflow-y-auto '
                            />
                        </div>
                        <div>
                            {formik.touched.textInput && formik.errors.textInput ? (
                                <div className='text-sm text-red-500'>{formik.errors.textInput}</div>
                            ) : null}
                        </div>
                    </div>
                </div>

                {/* Activity Type Dropdown */}
                <div className='flex flex-col w-full px-1  place-self-start'> {/* Limit width for larger screens */}
                    <div className='font-semibold '>
                        <label htmlFor="activityType">Tipo de actividad:</label>
                    </div>
                    <div className='flex flex-col'>
                        <div className='w-full'>
                            <select
                                id="activityType"
                                name="activityType"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.activityType}
                                className='w-full'

                            >
                                <option value="" label="Seleccione una opción" />
                                <option value="quiz" label="Quiz" />
                                <option value="tarea" label="Tarea" />
                                <option value="taller" label="Taller" />
                                <option value="presentacion" label="Presentación" />
                                <option value="informe" label="Informe" />
                                <option value="problemas" label="Problemas" />
                                <option value="examen" label="Examen" />
                                <option value="otro" label="Otro" />
                            </select>
                        </div>

                        <div>
                            {formik.touched.activityType && formik.errors.activityType ? (
                                <div className='text-sm text-red-500'>{formik.errors.activityType}</div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>

            {/* Submit Button */}

            <button
                id="send"
                type="submit"
                disabled={disableCreateActivityButton}
                className={`bg-blue-500 hover-bg-blue-700 text-white font-bold py-1 px-1 rounded  mt-4  mb-3 ${disableCreateActivityButton ? "bg-red-300" : "bg-blue-500"}`}
                onClick={handleEnableCreateNewActivity}
            >
                Crear actividad
            </button>

        </form>
    );
};

export default CreateNewActivity;

