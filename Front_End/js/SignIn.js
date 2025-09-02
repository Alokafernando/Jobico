$('#loginForm').on('submit', function(e) {
    e.preventDefault();

    const btn = $('.login-btn');
    btn.addClass('btn-loading').text('');

    // Get login form values
    const loginData = {
        email: $('#email').val().trim(),
        password: $('#password').val().trim()
    };

    // Call API
    fetch("http://localhost:8080/auth/login", {
        method: "POST",
        body: JSON.stringify(loginData),
        headers: { "Content-Type": "application/json" }
    })
        .then(res => {
            if (!res.ok) throw new Error("Invalid credentials");
            return res.json();
        })
        .then(data => {
            btn.removeClass('btn-loading').text('Sign In to Your Future');

            // Save token and role
            localStorage.setItem("token", data.accessToken);
            localStorage.setItem("role", data.role);

            showMessage('Welcome back! Redirecting to your dashboard... 🎉');

            // Redirect based on role
            if (data.role === "ROLE_ADMIN") {
                // window.location.href = "/admin/dashboard.html";
                console.log('admin dashboard')
            } else if (data.role === "ROLE_EMPLOYEE") {
                window.location.href = "EmployeeDashboard.html";
                console.log('employee dashboard')
            } else if (data.role === "ROLE_JOB_SEEKER") {
                window.location.href = "JobSeekerDashboard.html";
            } else {
                alert("Unknown role!");
            }
        })
        .catch(err => {
            btn.removeClass('btn-loading').text('Sign In to Your Future');
            showMessage(err.message || "Login failed ❌");
        });
});

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

function showMessage(message) {
    $('.notification').remove();
    const notification = $('<div class="notification"></div>').text(message);
    $('body').append(notification);
    setTimeout(() => notification.remove(), 3000);
}