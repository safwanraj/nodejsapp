$(document).ready(function() {
  // Fetch and display the list of students
  function displayStudents() {
      $.get('/api/crud/students', function(data) {
          $('#student-list').empty();
          data.forEach(function(student) {
              $('#student-list').append(`
                  <tr>
                      <td>${student.name}</td>
                      <td>${student.age}</td>
                      <td>${student.grade}</td>
                      <td>
                          <button class="edit-btn" data-id="${student._id}">Edit</button>
                          <button class="delete-btn" data-id="${student._id}">Delete</button>
                      </td>
                  </tr>
              `);
          });
      });
  }
  $.get('/api/crud/students', function(data) {
    console.log(data); // Log the response data to the console
    // Rest of your code...
});
  displayStudents();

  // Handle the submission of the "Add New Student" form
  $('#add-student-form').submit(function(event) {
      event.preventDefault();
      const name = $('#name').val();
      const age = $('#age').val();
      const grade = $('#grade').val();

      $.post('/api/crud/students', { name, age, grade }, function() {
          displayStudents();
          $('#add-student-form')[0].reset();
      });
  });

  // Handle the click of "Edit" button
  $('#student-list').on('click', '.edit-btn', function() {
      const studentId = $(this).data('id');

      $.get(`/api/crud/students/${studentId}`, function(student) {
          $('#edit-student-id').val(student._id);
          $('#edit-name').val(student.name);
          $('#edit-age').val(student.age);
          $('#edit-grade').val(student.grade);
          $('#edit-student-form').show();
      });
  });

  // Handle the submission of the "Edit Student" form
  $('#edit-student-form').submit(function(event) {
      event.preventDefault();
      const studentId = $('#edit-student-id').val();
      const name = $('#edit-name').val();
      const age = $('#edit-age').val();
      const grade = $('#edit-grade').val();

      $.ajax({
          url: `/api/crud/students/${studentId}`,
          type: 'PUT',
          data: { name, age, grade },
          success: function() {
              displayStudents();
              $('#edit-student-form').hide();
          }
      });
  });

  // Handle the click of "Delete" button
  $('#student-list').on('click', '.delete-btn', function() {
      const studentId = $(this).data('id');

      $.ajax({
          url: `/api/crud/students/${studentId}`,
          type: 'DELETE',
          success: function() {
              displayStudents();
          }
      });
  });
});
