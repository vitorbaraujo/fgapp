import { connect } from 'react-redux';
import ProfessorsService from '../services/professors-service';
import FgaProfessors from '../components/fga-professors';

import { ALL } from '../config/professor-communities';

const mapStateToProps = (state) => {
  const selectedCourse = state.professors[state.professors.currentCourse];

  console.info(
    `
      Current Course: ${state.professors.currentCourse}
      Number of professors: ${selectedCourse.data.length}
      Actual page: ${selectedCourse.page}
      Last page: ${selectedCourse.lastPage}
    `
  );

  return {
    professors: selectedCourse.data,
    page: selectedCourse.page,
    lastPage: selectedCourse.lastPage,
    clearListView: state.professors.clearListView,
    course: state.professors.currentCourse,
    error: state.professors.error
  }
};

const mapDispatchToProps = (dispatch) => ({
  fetchProfessors: (courseId) => {
    dispatch({
      type: 'SET_CLEAR_PROFESSORS_LIST_VIEW',
      clearListView: true
    });

    ProfessorsService.get(courseId)
      .then((response) => response.data)
      .then((data) => {
        const professors = data.people.map(professor => {
          return {
            id: professor.id,
            name: professor.name,
            image: professor.image,
            additional_data: professor.additional_data,
            course_id: courseId
          }
        });

        dispatch({
          type: 'ADD_PROFESSORS',
          professors,
          course: courseId,
          clearListView: false
        });
      })
      .catch(error => {
        dispatch({
          type: 'SET_PROFESSORS_ERROR',
          error: true
        })
      });
  },

  professorsError(error){
    dispatch({
      type: 'SET_PROFESSORS_ERROR',
      error
    })
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
