import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectStudents, selectSelectedStudent } from './studentSelectors';
import { selectStudent, fetchStudents } from './studentActions';

function StudentSelection() {
  const students = useSelector(selectStudents);
  const selectedStudent = useSelector(selectSelectedStudent);
  const dispatch = useDispatch();

  useEffect(() => {
    // Fetch students when the component mounts
    dispatch(fetchStudents());
  }, [dispatch]);

  const handleStudentSelect = (studentId) => {
    dispatch(selectCourse(studentId));
  };

  // Render student selection UI and handle selections
}

export default StudentSelection;