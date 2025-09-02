$('#loginForm').on('submit', function(e) {
    e.preventDefault();

    const btn = $('.login-btn');
    btn.addClass('btn-loading').text('');

    // Get login form values
    const loginData = {
        email: $('#email').val().trim(),
        password: $('#password').val().trim()
    };

    // Call API using jQuery AJAX
    $.ajax({
        url: "http://localhost:8080/auth/login",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(loginData),
        success: function(data) {
            btn.removeClass('btn-loading').text('Sign In to Your Future');

            // Save token, role, and firstName
            localStorage.setItem("token", data.accessToken);
            localStorage.setItem("role", data.role);
            localStorage.setItem("firstName", data.firstName);

            showMessage(`Welcome back, ${data.firstName}! Redirecting to your dashboard... 🎉`);

            // Redirect based on role
            if (data.role === "ROLE_ADMIN") {
                console.log('admin dashboard');
                // window.location.href = "/admin/dashboard.html";
            } else if (data.role === "ROLE_EMPLOYEE") {
                window.location.href = "EmployeeDashboard.html";
            } else if (data.role === "ROLE_JOB_SEEKER") {
                window.location.href = "JobSeekerDashboard.html";
            } else {
                alert("Unknown role!");
            }
        },
        error: function(xhr) {
            btn.removeClass('btn-loading').text('Sign In to Your Future');
            showMessage(xhr.responseJSON?.message || "Login failed ❌");
        }
    });
});

// Toggle password visibility
function togglePassword() {
    const passwordField = $('#password');
    const toggleBtn = $('.password-toggle');

    if (passwordField.attr('type') === 'password') {
        passwordField.attr('type', 'text');
        toggleBtn.html('<i class="fa-solid fa-eye-slash"></i>');
    } else {
        passwordField.attr('type', 'password');
        toggleBtn.html('<i class="fa-solid fa-eye"></i>');
    }
}

// Display temporary notification
function showMessage(message) {
    $('.notification').remove();
    const notification = $('<div class="notification"></div>').text(message);
    $('body').append(notification);
    setTimeout(() => notification.remove(), 3000);
}
