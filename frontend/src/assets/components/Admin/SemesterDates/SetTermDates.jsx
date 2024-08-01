import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import api from "../../../../utils/AxiosInterceptos/interceptors";


import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const SetTermDates = () => {
    const [token] = useState(localStorage.getItem('token'));

    const initialValues = {
        initDateT1: '',
        endDateT1: '',
        endDateT2: '',
        endDateT3: '',
    };

    const validationSchema = Yup.object({
        initDateT1: Yup.date().required('Required'),
        endDateT1: Yup.date().required('Required').min(Yup.ref('initDateT1'), 'La fecha final debe ser posterior a la fecha de inicio'),
        endDateT2: Yup.date().required('Required').min(Yup.ref('endDateT1'), 'La fecha final debe ser posterior a la fecha final anterior'),
        endDateT3: Yup.date().required('Required').min(Yup.ref('endDateT2'), 'La fecha final debe ser posterior a la fecha final anterior'),
    });

    const handleSubmit = (values) => {
        const { initDateT1, endDateT1, endDateT2, endDateT3 } = values;

        const result = {
            initDateT1,
            endDateT1,
            initDateT2: endDateT1,
            endDateT2: endDateT2,
            initDateT3: endDateT2,
            endDateT3: endDateT3,
        };

        api.post('http://localhost:3500/dates', result, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(response => {
                console.log(response.data);
                toast.success("Fechas establecidas exitosamente")

            })
            .catch(error => {
                console.error(error);
            });
    };

    return (
        <div className="max-w-lg mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Fechas de corte de tercios</h1>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ setFieldValue }) => (
                    <Form className="space-y-4">
                        <div className="flex flex-col w-full">
                            <label className="block text-sm font-medium text-gray-700">Fecha inicio T1</label>
                            <Field name="initDateT1">
                                {({ field }) => (
                                    <DatePicker
                                        selected={(field.value && new Date(field.value)) || null}
                                        onChange={val => setFieldValue(field.name, val)}
                                        showTimeSelect
                                        dateFormat="Pp"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                )}
                            </Field>
                            <ErrorMessage name="initDateT1" component="div" className="text-red-600 text-sm" />
                        </div>
                        <div className="flex flex-col w-full">
                            <label className="block text-sm font-medium text-gray-700">Fecha finalización T1</label>
                            <Field name="endDateT1">
                                {({ field }) => (
                                    <DatePicker
                                        selected={(field.value && new Date(field.value)) || null}
                                        onChange={val => setFieldValue(field.name, val)}
                                        showTimeSelect
                                        dateFormat="Pp"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                )}
                            </Field>
                            <ErrorMessage name="endDateT1" component="div" className="text-red-600 text-sm" />
                        </div>
                        <div className="flex flex-col w-full">
                            <label className="block text-sm font-medium text-gray-700">Fecha finalización T2</label>
                            <Field name="endDateT2">
                                {({ field }) => (
                                    <DatePicker
                                        selected={(field.value && new Date(field.value)) || null}
                                        onChange={val => setFieldValue(field.name, val)}
                                        showTimeSelect
                                        dateFormat="Pp"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                )}
                            </Field>
                            <ErrorMessage name="endDateT2" component="div" className="text-red-600 text-sm" />
                        </div>
                        <div className="flex flex-col w-full">
                            <label className="block text-sm font-medium text-gray-700">Fecha finalización T3</label>
                            <Field name="endDateT3">
                                {({ field }) => (
                                    <DatePicker
                                        selected={(field.value && new Date(field.value)) || null}
                                        onChange={val => setFieldValue(field.name, val)}
                                        showTimeSelect
                                        dateFormat="Pp"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                )}
                            </Field>
                            <ErrorMessage name="endDateT3" component="div" className="text-red-600 text-sm" />
                        </div>
                        <button type="submit" className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-md">
                            Enviar
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );



};

export default SetTermDates;
