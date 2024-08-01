import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectTeachers, selectSelectedTeacher } from './teacherSelectors';
import { selectTeacher, fetchTeachers } from './teacherActions';

function TeacherSelection() {
  const teachers = useSelector(selectTeachers);
  const selectedTeacher = useSelector(selectSelectedTeacher);
  const dispatch = useDispatch();

  useEffect(() => {
    // Fetch teachers when the component mounts
    dispatch(fetchTeachers());
  }, [dispatch]);

  const handleTeacherSelect = (teacherId) => {
    dispatch(selectTeacher(teacherId));
  };

  // Render teacher selection UI and handle selections
}

export default TeacherSelection;