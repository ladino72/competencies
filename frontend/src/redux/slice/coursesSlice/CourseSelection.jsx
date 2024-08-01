import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCourses, selectSelectedCourse } from './courseSelectors';
import { selectCourse, fetchCourses } from './courseActions';

function CourseSelection() {
  const courses = useSelector(selectCourses);
  const selectedCourse = useSelector(selectSelectedCourse);
  const dispatch = useDispatch();

  useEffect(() => {
    // Fetch courses when the component mounts
    dispatch(fetchCourses());
  }, [dispatch]);

  const handleCourseSelect = (courseId) => {
    dispatch(selectCourse(courseId));
  };

  // Render course selection UI and handle selections
}

export default CourseSelection;