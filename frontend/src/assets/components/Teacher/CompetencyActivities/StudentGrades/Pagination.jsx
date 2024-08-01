import React from 'react';

const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            onPageChange(page);
        }
    };

    console.log(":::::::::::::::::::.", currentPage, totalItems)

    return (
        <div className="flex justify-center mt-4">
            <button
                className="mr-2 px-2 py-1 border rounded"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
                <button
                    key={i}
                    className={`mx-2 px-2 py-1 border rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white' : ''}`}
                    onClick={() => handlePageChange(i + 1)}
                >
                    {i + 1}
                </button>
            ))}
            <button
                className="ml-2 px-2 py-1 border rounded"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;
