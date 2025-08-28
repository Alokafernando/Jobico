$(document).ready(function() {
    // =======================
    // Form Toggle
    // =======================
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

    // =======================
    // Password Toggle
    // =======================
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

    // =======================
    // Validations
    // =======================
    function validateEmail(email) {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return pattern.test(email);
    }

    function validatePhone(phone) {
        const pattern = /^[0-9]{7,15}$/;
        return pattern.test(phone);
    }

    function validateName(name) {
        const pattern = /^[a-zA-Z]+$/;
        return pattern.test(name);
    }

    function validateTextWithSpaces(text) {
        const pattern = /^[a-zA-Z\s]+$/;
        return pattern.test(text);
    }

    // =======================
    // Job Seeker Registration
    // =======================
    $('#seekerSignupForm').submit(function(e) {
        e.preventDefault();

        const password = $('#seekerPassword').val();
        const confirmPassword = $('#seekerConfirmPassword').val();

        if (password !== confirmPassword) {
            Swal.fire('Error', 'Passwords do not match!', 'error');
            return;
        }

        const seekerData = {
            firstName: $('#seekerFirstName').val().trim(),
            lastName: $('#seekerLastName').val().trim(),
            email: $('#seekerEmail').val().trim(),
            phone_number: $('#seekerPhone').val().trim(),
            address: $('#seekerLocation').val().trim(),
            profession_title: $('#seekerProfession').val().trim(),
            experience: $('#seekerExperience').val().trim(),
            education: $('#seekerEducation').val().trim(),
            skills: $('#seekerSkills').val().split(",").map(s => s.trim()).filter(s => s),
            password: password,
            resumeUrl: $('#seekerResume').val().trim()
        };

        // Client-side validations
        if (!seekerData.firstName || !seekerData.lastName || !seekerData.email || !seekerData.password) {
            Swal.fire('Error', 'Please fill all mandatory fields.', 'error');
            return;
        }

        if (!validateName(seekerData.firstName)) {
            Swal.fire('Error', 'First name should contain only letters.', 'error');
            return;
        }

        if (!validateName(seekerData.lastName)) {
            Swal.fire('Error', 'Last name should contain only letters.', 'error');
            return;
        }

        if (!validateTextWithSpaces(seekerData.profession_title)) {
            Swal.fire('Error', 'Profession title should contain only letters and spaces.', 'error');
            return;
        }

        if (!validateEmail(seekerData.email)) {
            Swal.fire('Error', 'Invalid email address.', 'error');
            return;
        }

        if (seekerData.phone_number && !validatePhone(seekerData.phone_number)) {
            Swal.fire('Error', 'Invalid phone number.', 'error');
            return;
        }

        if (!seekerData.skills.length) {
            Swal.fire('Error', 'Please enter at least one skill.', 'error');
            return;
        }

        // AJAX request
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
                let errorMessage = 'Something went wrong!';
                try {
                    const res = JSON.parse(xhr.responseText);
                    if (res.message) errorMessage = res.message;
                } catch(e) {}
                Swal.fire('Error', errorMessage, 'error');
            }
        });
    });

    // =======================
    // Employer Registration
    // =======================
    $('#employeeSignupForm').submit(function(e) {
        e.preventDefault();

        const employeeData = {
            companyName: $('#companyName').val().trim(),
            industry: $('#companyIndustry').val().trim(),
            contactFirstName: $('#contactFirstName').val().trim(),
            contactLastName: $('#contactLastName').val().trim(),
            contactPosition: $('#contactPosition').val().trim(),
            email: $('#contactEmail').val().trim(),
            phone: $('#contactPhone').val().trim(),
            location: $('#companyLocation').val().trim(),
            description: $('#companyDescription').val().trim(),
            password: $('#employeePassword').val().trim()
        };

        // Basic validations
        if (!employeeData.companyName || !employeeData.email || !employeeData.password) {
            Swal.fire('Error', 'Please fill all mandatory fields.', 'error');
            return;
        }

         if (!validateName(employeeData.companyName)){
             Swal.fire('Error', 'Company name should contain only letters.', 'error');
             return;
         }

        if (!validateName(employeeData.contactPosition)){
            Swal.fire('Error', 'Position should contain only letters.', 'error');
            return;
        }

        if (!validateName(employeeData.contactFirstName)){
            Swal.fire('Error', 'First name should contain only letters.', 'error');
            return;
        }

        if (!validateName(employeeData.contactLastName)){
            Swal.fire('Error', 'Last name should contain only letters.', 'error');
            return;
        }

        if (!validateEmail(employeeData.email)) {
            Swal.fire('Error', 'Invalid email address.', 'error');
            return;
        }

        if (employeeData.phone && !validatePhone(employeeData.phone)) {
            Swal.fire('Error', 'Invalid phone number.', 'error');
            return;
        }

        // AJAX request
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
                let errorMessage = 'Something went wrong!';
                try {
                    const res = JSON.parse(xhr.responseText);
                    if (res.message) errorMessage = res.message;
                } catch(e) {}
                Swal.fire('Error', errorMessage, 'error');
            }
        });
    });

    // =======================
    // Clear Forms
    // =======================
    function clearSeekerForm() {
        $('#seekerSignupForm')[0].reset();
    }

    function clearEmployeeForm() {
        $('#employeeSignupForm')[0].reset();
    }
});
