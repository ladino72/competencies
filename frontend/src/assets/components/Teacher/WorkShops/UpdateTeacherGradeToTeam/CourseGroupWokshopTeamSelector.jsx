import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import api from "../../../../../utils/AxiosInterceptos/interceptors";

const CourseGroupWorkshopTeamSelector = ({ teacherId, onSubmit }) => {
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedWorkshopId, setSelectedWorkshopId] = useState('');
  const [token] = useState(localStorage.getItem('token'));
  const [groupRubric, setGroupRubric] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get(`http://localhost:3500/teacher/getCoursesForATeacher/${teacherId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setCourses(response.data.courses);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, [teacherId, token]);

  useEffect(() => {
    const fetchRubric = async () => {
      try {
        const response = await api.get('http://localhost:3500/workshop/get-teacher-rubric', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setGroupRubric(response.data);
      } catch (error) {
        console.error('Error fetching rubric:', error);
      }
    };

    fetchRubric();
  }, [token]);

  const handleCourseChange = (event) => {
    const courseId = event.target.value;
    setSelectedCourseId(courseId);
    setSelectedGroupId('');
    setSelectedWorkshopId('');
    const selectedCourse = courses.find(course => course._id === courseId);
    setGroups(selectedCourse ? selectedCourse.groups : []);
    setWorkshops([]);
    setTeams([]);
  };

  const handleGroupChange = async (event) => {
    const groupId = event.target.value;
    setSelectedGroupId(groupId);
    setSelectedWorkshopId('');

    try {
      const response = await api.get(`http://localhost:3500/workshop/getWorkshopsCourseIdGroupId/courseId/${selectedCourseId}/groupId/${groupId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setWorkshops(response.data.workshops);
      setTeams([]);
    } catch (error) {
      console.error('Error fetching workshops:', error);
    }
  };

  const handleWorkshopChange = (event) => {
    const workshopId = event.target.value;
    setSelectedWorkshopId(workshopId);

    const selectedWorkshop = workshops.find(workshop => workshop._id === workshopId);
    setTeams(selectedWorkshop ? selectedWorkshop.teamsInfo : []);
  };

  const validationSchema = Yup.object({
    courseId: Yup.string().required('Course is required'),
    groupId: Yup.string().required('Group is required'),
    workshopId: Yup.string().required('Workshop is required'),
    teamId: Yup.string().required('Team is required')
  });

  return (
    <div className="max-w-md mx-auto mt-2 p-4 bg-white rounded shadow-md">
      <h1 className="text-2xl font-bold mb-4">Seleccione un curso, grupo, taller y equipo</h1>
      <Formik
        initialValues={{ courseId: '', groupId: '', workshopId: '', teamId: '' }}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          console.log('Selected Values:', values);
          onSubmit(values, groupRubric); // Pass the form values to the parent component
        }}
      >
        {({ setFieldValue }) => (
          <Form>
            <div className="mb-4">
              <label htmlFor="courseId" className="block text-sm font-medium text-gray-700">Curso</label>
              <Field as="select" name="courseId" onChange={(e) => {
                handleCourseChange(e);
                setFieldValue('courseId', e.target.value);
                setFieldValue('groupId', '');
                setFieldValue('workshopId', '');
                setFieldValue('teamId', '');
              }} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>{course.name}</option>
                ))}
              </Field>
              <ErrorMessage name="courseId" component="div" className="text-red-500 text-sm" />
            </div>

            {selectedCourseId && (
              <div className="mb-4">
                <label htmlFor="groupId" className="block text-sm font-medium text-gray-700">Grupo</label>
                <Field as="select" name="groupId" onChange={(e) => {
                  handleGroupChange(e);
                  setFieldValue('groupId', e.target.value);
                  setFieldValue('workshopId', '');
                  setFieldValue('teamId', '');
                }} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <option value="">Select a group</option>
                  {groups.map((group) => (
                    <option key={group._id} value={group._id}>{group.g_Id}</option>
                  ))}
                </Field>
                <ErrorMessage name="groupId" component="div" className="text-red-500 text-sm" />
              </div>
            )}

            {selectedGroupId && (
              <div className="mb-4">
                <label htmlFor="workshopId" className="block text-sm font-medium text-gray-700">Taller</label>
                <Field as="select" name="workshopId" onChange={(e) => {
                  handleWorkshopChange(e);
                  setFieldValue('workshopId', e.target.value);
                  setFieldValue('teamId', '');
                }} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <option value="">Select a workshop</option>
                  {workshops.map((workshop) => (
                    <option key={workshop._id} value={workshop._id}>{workshop.name} (Tercio {workshop.term})</option>
                  ))}
                </Field>
                <ErrorMessage name="workshopId" component="div" className="text-red-500 text-sm" />
              </div>
            )}

            {selectedWorkshopId && (
              <div className="mb-4">
                <label htmlFor="teamId" className="block text-sm font-medium text-gray-700">Equipo</label>
                <Field as="select" name="teamId" className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <option value="">Select a team</option>
                  {teams.map((team) => (
                    <option key={team.teamsId} value={team.teamsId}>{team.teamsName}</option>
                  ))}
                </Field>
                <ErrorMessage name="teamId" component="div" className="text-red-500 text-sm" />
              </div>
            )}

            <button type="submit" className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              Traer datos
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CourseGroupWorkshopTeamSelector;
