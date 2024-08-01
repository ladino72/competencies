import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectStudentsByTeacherCourseGroup } from '../../redux/slice/selectors';


function StudentList() {

    const students = useSelector(selectStudentsByTeacherCourseGroup("5", "FIEM", "EM07"));
    const listItems = students.map((student, index) => <li key={index}>Name:{student.name} : age: {student.age} years</li>);


    return (
        <div>
            <h2>Student List</h2>
            <ul>{listItems}</ul>
        </div>
    );
}

export default StudentList;
