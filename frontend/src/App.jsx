import { useState, useRef, useEffect } from 'react'
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { FaBars, FaTimes } from "react-icons/fa"


import SignUpN from './assets/components/SignUpN'
import LoginN from './assets/components/LoginN'
import Layout from './assets/components/Layout'
import Home from './assets/pages/Home'
import NoPage from './assets/pages/NoPage'
import Teacher from './assets/pages/Teacher'
import Director from './assets/pages/Director'
import Student from './assets/pages/Student_original'
import LaySignUpLogin from './assets/components/LaySignUpLogIn '
import HomePage from './assets/components/HomePage'

import InputGrades from "./assets/pages/InputGrades"
import StudentData from './assets/components/StudentData'
import Admin from './assets/pages/Admin'


// CASL imports Taken from: https://dev.to/naufalafif/dynamic-permissions-in-react-using-casl-a-guide-to-secure-your-app-2ino
import AccessProvider from "./assets/permissions/AccessProvider";
import { AuthProvider } from "./assets/permissions/AuthContext";

import LayoutCoordinator from './assets/components/Coordinator/LayoutCoordinator'
import HomeCoordinator from './assets/components/Coordinator/HomeCoordinator'
import TeacherWorkCoordinator from './assets/components/Coordinator/TeacherWorkCoordinator/TeacherWorkCoordinator'
import GroupsActivities from './assets/components/Coordinator/GroupsActivities/GroupsActivities'

import LayoutDirector from './assets/components/Director/LayoutDirector'
import HomeDirector from './assets/components/Director/HomeDirector'
import StatCourse from './assets/components/Director/StatCourse/StatCourse'
import GroupsComparison from './assets/components/Director/GroupsComparison/GroupsComparison'
import ActivitiesComparison from './assets/components/Director/ActivitiesComparison/ActivitiesComparison'
import TopStudentsByCourseGroups from './assets/components/Director/TopStudents/TopStudentsByCourseGroups'
import StudentGrades from './assets/components/Director/StudentGrades/StudentGrades'
import TeacherWork from './assets/components/Director/TeacherWork/TeacherWork'


import LayoutAdmin from './assets/components/Admin/LayoutAdmin'
import HomeAdmin from './assets/components/Admin/HomeAdmin'

import CreateCourse from './assets/components/Admin/CreateCourse'
import CreateUsers from './assets/components/Admin/CreateUsers'
import CreateOneUser from './assets/components/Admin/CreateOneUser'
import DeleteUsers from './assets/components/Admin/DeleteUsers'
import CreateGroup from './assets/components/Admin/CreateGroup'
import DeleteGroup from './assets/components/Admin/DeleteGroup'
import SetTermDates from './assets/components/Admin/SemesterDates/SetTermDates'
import LoadUsersToDatabase from './assets/components/Admin/LoadUsersToDatabase/LoadUsersToDatabase'


import GroupActivitiesLayout from './assets/components/Teacher/WorkShops/GroupActivitiesLayout'
import LayoutTeacher from "./assets/components/Teacher/LayoutTeacher"
import HomeTeacher from './assets/components/Teacher/HomeTeacher'
//import InputNotas from './assets/components/Teacher/InputNotas' //Candidato a ser eliminado por la nueva reestructuracion
import UpdateGrades from './assets/components/Teacher/UpdateGrades'
import DeleteActivityGrades from "./assets/components/Teacher/DeleteActivityGrades"
import DeactivateStudentsGradesOfAGroup from "./assets/components/Teacher/DeactivateStudentsGradesOfAGroup"


import TeacherGroupGrade from './assets/components/Teacher/WorkShops/EnterTeacherGradeToTeam/TeacherGroupGrade'
import UpdateTeacherGroupGrade from './assets/components/Teacher/WorkShops/UpdateTeacherGradeToTeam/UpdateTeacherGroupGrade'
import DisplayWorkShopGradesForGroupTeams from "./assets/components/Teacher/WorkShops/WorkShopGradesForGroupTeams/DisplayWorkShopGradesForGroupTeams"
import InputNotasN from './assets/components/Teacher/CompetencyActivities/InputGrades/InputNotasN'
import LayoutActivities from './assets/components/Teacher/CompetencyActivities/LayoutActivities'
import DeleteActivityGradesN from './assets/components/Teacher/CompetencyActivities/DeleteActivityGrades/DeleteActivityGradesN'
import UpdateGradesN from './assets/components/Teacher/CompetencyActivities/UpdateGrades/UpdateGradesN'
import DeactivateStudentsGradesFromGroup from './assets/components/Teacher/CompetencyActivities/DeactivateStudentsFromGroup/DeactivateStudentsGradesFromGroup'
import CreateWorkShopAndWorkTeams from './assets/components/Teacher/WorkShops/CreateWorkShopAndWorkTeams/CreateWorkShopAndWorkTeams'
import SeeWorkTeamStudents from './assets/components/Teacher/WorkShops/SeeWorkTeamStudents/SeeWorkTeamStudents'


import LayoutStudent from './assets/components/Student/LayoutStudent'
import HomeStudent from './assets/components/Student/HomeStudent'
import StudentGradesDetailed from './assets/components/Student/StudentGrades/StudentGrades'
import GroupsComparisonTableC from './assets/components/Coordinator/GroupsComparisonTableC/GroupsComparisonTableC'
import GroupsComparisonGraphC from './assets/components/Coordinator/GroupsComparisonGraphC/GroupsComparisonGraphC'
import JoinLeaveWorkTeam from './assets/components/Student/Workshop/JoinLeaveWorkTeam/JoinLeaveWorkTeam'
import Self_Peers_Grades from './assets/components/Student/Workshop/Self_Peers_Grades/Self_Peers_Grades'
import StudentsGetTheirWorkShopGrades from './assets/components/Student/StudentWorkShopGrades/StudentsGetTheirWorkShopGrades'
import TeacherCompetencies from './assets/components/Teacher/CompetencyActivities/TeacherCompetencies/TeacherCompetencies'
import StudentCompetencyGrades from './assets/components/Teacher/CompetencyActivities/StudentGrades/StudentCompetencyGrades'




function App() {

    return (
        <AuthProvider>
            <AccessProvider>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="student" element={<Student />} />

                        <Route path="coordinator/*" element={<LayoutCoordinator />}>
                            <Route index element={<HomeCoordinator />} />
                            <Route path="statsTeacher" element={<TeacherWorkCoordinator />} />
                            <Route path="groupsActivities" element={<GroupsActivities />} />
                            <Route path="groupsComparisonTableC" element={<GroupsComparisonTableC />} />
                            <Route path="groupsComparisonGraphC" element={<GroupsComparisonGraphC />} />
                        </Route>

                        <Route path="director/*" element={<LayoutDirector />}>
                            <Route index element={<HomeDirector />} />
                            <Route path="stat" element={<Director />} />
                            <Route path="statCourse" element={<StatCourse />} />
                            <Route path="statGroupsComparison" element={<GroupsComparison />} />
                            <Route path="statActivitiesComparison" element={<ActivitiesComparison />} />
                            <Route path="statTopStudents" element={<TopStudentsByCourseGroups />} />
                            <Route path="statStudentGrades" element={<StudentGrades />} />
                            <Route path="statsTeacher" element={<TeacherWork />} />
                        </Route>

                        <Route path="estudiante/*" element={<LayoutStudent />}>
                            <Route index element={<HomeStudent />} />
                            <Route path="student_grades" element={<StudentGradesDetailed />} />
                            <Route path="join_leave_workteam" element={<JoinLeaveWorkTeam />} />
                            <Route path="self_peers_grades" element={<Self_Peers_Grades />} />
                            <Route path="studentsGetTheirWorkShopGrades" element={<StudentsGetTheirWorkShopGrades />} />
                        </Route>


                        <Route path="admin/*" element={<LayoutAdmin />}>
                            <Route index element={<HomeAdmin />} />
                            <Route path="create_users" element={<CreateUsers />} />
                            <Route path="create_user" element={<CreateOneUser />} />
                            <Route path="delete_user" element={<DeleteUsers />} />
                            <Route path="create_course" element={<CreateCourse />} />
                            <Route path="create_group" element={<CreateGroup />} />
                            <Route path="delete_group" element={<DeleteGroup />} />
                            <Route path="setTermDates" element={<SetTermDates />} />
                            <Route path="loadUsersToDatabase" element={<LoadUsersToDatabase />} />



                        </Route>

                        <Route path="teacher/*" element={<LayoutTeacher />}>
                            <Route index element={<HomeTeacher />} />

                            <Route path="inputgrades" element={<InputGrades />} />
                            <Route path="studentdata" element={<StudentData />} />
                            {/* <Route path="ingresarNotas" element={<InputNotas />} /> */}
                            <Route path="updateGrades" element={<UpdateGrades />} />
                            <Route path="deleteActivityGrades" element={<DeleteActivityGrades />} />
                            <Route path="deactivateStudentsGradesOfAGroup" element={<DeactivateStudentsGradesOfAGroup />} />


                            <Route path="competencyActivities/*" element={<LayoutActivities />}>

                                <Route path="ingresarNotas" element={<InputNotasN />} />
                                <Route path="updateGrades" element={<UpdateGradesN />} />
                                <Route path="deleteActivityGrades" element={<DeleteActivityGradesN />} />
                                <Route path="deactivateStudentFromGroup" element={<DeactivateStudentsGradesFromGroup />} />
                                <Route path="teacherStatCompetencies" element={<TeacherCompetencies />} />
                                <Route path="studentCompetencyGrades" element={<StudentCompetencyGrades />} />

                            </Route>

                            <Route path="groupActivities/*" element={<GroupActivitiesLayout />}>
                                <Route path="enterGroupGrades" element={<TeacherGroupGrade />} />
                                <Route path="updateGroupGrades" element={<UpdateTeacherGroupGrade />} />
                                <Route path="displayWorkshopGradesForGroupTeams" element={<DisplayWorkShopGradesForGroupTeams />} />
                                <Route path="createWorkShopAndTeams" element={<CreateWorkShopAndWorkTeams />} />
                                <Route path="seeStudentsInWorkTeams" element={<SeeWorkTeamStudents />} />


                            </Route>
                        </Route>
                        <Route path="*" element={<NoPage />} />
                    </Route>

                    <Route path="/phys" element={<LaySignUpLogin />}>
                        <Route index element={<HomePage />} />
                        <Route path="signupN" element={<SignUpN />} />
                        <Route path="loginN" element={<LoginN />} />
                    </Route>
                </Routes>
            </AccessProvider>
        </AuthProvider>
    );
}

export default App
