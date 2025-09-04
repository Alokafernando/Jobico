$('#loginForm').on('submit', function(e) {
    e.preventDefault();

    const btn = $('.login-btn');
    btn.addClass('btn-loading').text('');

    const email = $('#email').val().trim();
    const password = $('#password').val().trim();

    const loginData = { email, password };

    // Login API call
    $.ajax({
        url: "http://localhost:8080/auth/login",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(loginData),
        success: function(data) {
            btn.removeClass('btn-loading').text('Sign In to Your Future');

            localStorage.setItem("token", data.accessToken);
            localStorage.setItem("role", data.role);

            if (data.role === "ROLE_ADMIN") {
                console.log('admin dashboard');
            } else if (data.role === "ROLE_EMPLOYEE") {
                window.location.href = "EmployeeDashboard.html";
            } else if (data.role === "ROLE_JOB_SEEKER") {
                $.ajax({
                    url: `http://localhost:8080/api/jobseekers/email/${email}`,
                    method: "GET",
                    headers: { "Authorization": `Bearer ${data.accessToken}` },
                    success: function(user) {
                        localStorage.setItem("userEmail", user.email || email);
                        localStorage.setItem("firstName", user.firstName || "");
                        localStorage.setItem("lastName", user.lastName || "");
                        localStorage.setItem("professionTitle", user.professionTitle || "");
                        localStorage.setItem("phoneNumber", user.phoneNumber || "");
                        localStorage.setItem("experience", user.experience || "");
                        localStorage.setItem("education", user.education || "");
                        localStorage.setItem("skills", JSON.stringify(user.skills || []));

                        const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
                        showMessage(`Welcome back, ${fullName}! 🎉`);

                        // ✅ Redirect only after user data is stored
                        window.location.href = "JobSeekerDashboard.html";
                    },
                    error: function(xhr) {
                        // ❌ Do NOT redirect if AJAX fails
                        showMessage("Failed to get user details. Please try logging in again.");
                        console.error("Error fetching user details:", xhr);
                    }
                });

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
