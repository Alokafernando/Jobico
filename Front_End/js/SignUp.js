
$(document).ready(function() {
    // Toggle between Job Seeker and Employer forms
    $('#seekerBtn').click(function () {
        $(this).addClass('active');
        $('#employeeBtn').removeClass('active');
        $('#seekerForm').addClass('active');
        $('#employeeForm').removeClass('active');
    });
    $('#employeeBtn').click(function() {
        $(this).addClass('active');
        $('#seekerBtn').removeClass('active');
        $('#employeeForm').addClass('active');
        $('#seekerForm').removeClass('active');
    });

    // Password toggle
    window.togglePassword = function(inputId, toggleIconId) {
        const $pwd = $('#' + inputId);
        const $icon = $('#' + toggleIconId);
        if ($pwd.attr('type') === 'password') {
            $pwd.attr('type', 'text');
            $icon.removeClass('fa-eye').addClass('fa-eye-slash');
        } else {
            $pwd.attr('type', 'password');
            $icon.removeClass('fa-eye-slash').addClass('fa-eye');
        }
    };

    // Job Seeker form submit
    $('#seekerSignupForm').submit(function(e) {
        e.preventDefault();

        const password = $('#seekerPassword').val();
        const confirmPassword = $('#seekerConfirmPassword').val();

        if (password !== confirmPassword) {
            Swal.fire({
                title: 'Oops!',
                text: 'Passwords do not match! Please try again.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return; // Stop submission
        }

        const seekerData = {
            firstName: $('#seekerFirstName').val(),
            lastName: $('#seekerLastName').val(),
            email: $('#seekerEmail').val(),
            phone_number: $('#seekerPhone').val(),
            address: $('#seekerLocation').val(),
            profession_title: $('#seekerProfession').val(),
            experience: $('#seekerExperience').val(),
            education: $('#seekerEducation').val(),
            skills: $('#seekerSkills').val().split(",").map(s => s.trim()),
            password: password,
            resumeUrl: $('#seekerResume').val()
        };

        $.ajax({
            url: "http://localhost:8080/auth/register/jobseeker",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(seekerData),
            success: function(response) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Job Seeker registered successfully!',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true
                }).then(() => {
                    clearSeekerForm();
                    window.location.href = "SignIn.html";
                });
            },
            error: function(xhr) {
                console.error("Error:", xhr);
                Swal.fire({
                    title: 'Error!',
                    text: xhr.responseText || 'Something went wrong!',
                    icon: 'error'
                });
            }
        });
    });

    // Employer form submit
    $('#employeeSignupForm').submit(function(e) {
        e.preventDefault();

        const employeeData = {
            companyName: $('#companyName').val(),
            industry: $('#companyIndustry').val(),
            contactFirstName: $('#contactFirstName').val(),
            contactLastName: $('#contactLastName').val(),
            position: $('#contactPosition').val(),
            email: $('#contactEmail').val(),
            phone: $('#contactPhone').val(),
            location: $('#companyLocation').val(),
            description: $('#companyDescription').val(),
            password: $('#employeePassword').val()
        };

        $.ajax({
            url: "http://localhost:8080/auth/register/employee",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(employeeData),
            success: function(response) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Employer registered successfully!',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true
                }).then(() => {
                    clearEmployeeForm();
                    window.location.href = "SignIn.html";
                });
            },
            error: function(xhr) {
                console.error("Error:", xhr);
                Swal.fire({
                    title: 'Error!',
                    text: xhr.responseText || 'Something went wrong!',
                    icon: 'error'
                });
            }
        });
    });

    function clearSeekerForm() {
        $('#seekerSignupForm')[0].reset();
    }

    function clearEmployeeForm() {
        $('#employeeSignupForm')[0].reset();
    }
});

