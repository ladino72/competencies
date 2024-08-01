import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import api from "../../../../utils/AxiosInterceptos/interceptors";

const SearchForm = ({ setListOfSudents, onSearchClean }) => {
    const token = localStorage.getItem('token');
    const [totalPages, setTotalPages] = useState(1); // Total number of pages
    const [currentPage, setCurrentPage] = useState(1); // Current page number
    const [isSubmitting, setIsSubmitting] = useState(false); // Form submission state
    const [searchQuery, setSearchQuery] = useState(''); // Search query
    const [showResults, setShowResults] = useState(false); // Flag to control displaying results

    const perPage = 5; // Results per page
    const sortBy = 'name'; // Field to sort by
    const sortOrder = 'asc'; // Sorting order ('asc' or 'desc')

    const validationSchema = Yup.object().shape({
        searchQuery: Yup.string().required('Search query is required'),
    });

    const handleSubmit = async (values) => {
        try {
            setIsSubmitting(true);

            const response = await api.get(
                `http://localhost:3500/users/search/?searchQuery=${values.searchQuery}&page=${currentPage}&perPage=${perPage}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setListOfSudents(response.data.users);
            setTotalPages(Math.ceil(response.data.totalCount / perPage));
            setShowResults(true); // Show results after fetching
            console.log("List of Students>>>::::::::::::::::", response.data)
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    useEffect(() => {
        if (!searchQuery) {
            setShowResults(false); // Hide results if search query is empty
        }
        else {
            handleSubmit({ searchQuery }); // Fetch data on initial render and page change
        }
    }, [currentPage, searchQuery]); // Dependency array: trigger effect on currentPage or searchQuery change

    return (
        <div className='flex justify-center min-w-full'>
            <Formik
                initialValues={{ searchQuery: '' }}
                validationSchema={validationSchema}
                onSubmit={(values) => {
                    setSearchQuery(values.searchQuery);
                    setCurrentPage(1); // Reset currentPage to 1 when performing a new search
                }}
            >
                {({ values, resetForm }) => (
                    <Form className="flex items-center flex-wrap">
                        <div className='flex flex-col'>
                            <div className="flex items-center">
                                <div className='flex flex-col'>
                                    <Field type="text" name="searchQuery" placeholder="Buscar usuario" className="mr-2 w-40 " />
                                    <ErrorMessage name="searchQuery" component="div" className="text-red-500 text-sm mt-1" />
                                </div>

                                <button type="submit" disabled={isSubmitting} className="px-3 py-2 bg-blue-500 text-white rounded self-start">
                                    Buscar
                                </button>
                                <button type="button" onClick={() => { resetForm(); onSearchClean(); }} className="px-3 py-2 ml-2 bg-gray-300 rounded self-start">
                                    Limpiar campo
                                </button>
                            </div>

                            {showResults && (
                                <div className='flex justify-between items-center pt-2'>
                                    <button
                                        className="px-3 py-1 min-w-min bg-blue-500 text-white rounded"
                                        type="button"
                                        onClick={() => handlePageChange(currentPage - 1 > 0 ? currentPage - 1 : 1)} // Ensure currentPage doesn't go below 1
                                        disabled={currentPage === 1} // Disable previous button if already on the first page
                                    >
                                        Previous
                                    </button>
                                    <span>{currentPage} of {totalPages}</span>
                                    <button
                                        className="px-3 py-1 min-w-min bg-blue-500 text-white rounded"
                                        type="button"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages} // Disable next button if already on the last page
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default SearchForm;
