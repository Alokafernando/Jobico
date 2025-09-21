$(document).ready(function() {

    // --- Sidebar Navigation ---
    $('.menu-item').on('click', function () {
        $('.menu-item').removeClass('active');
        $(this).addClass('active');

        const sectionId = $(this).data('section');
        $('main section').addClass('hidden');
        if (sectionId) {
            $('#' + sectionId).removeClass('hidden');
            $('#page-title').text($(this).text());
        }
    });

    // --- Load Data ---
    loadAllJobs();
    loadEmployees();
    loadSeekers();
    loadApplications();
    loadAdmin();

    function openModal() {
        $("#editJobModal").removeClass("hidden");
        $("body").css("overflow", "hidden");
    }

    function closeModal() {
        $("#editJobModal").addClass("hidden");
        $("body").css("overflow", "auto");
    }

    $("#closeEditModal").click(closeModal);

    function loadAllJobs() {
        const $tbody = $('#admin-post-panel');
        $tbody.empty();

        $.ajax({
            url: 'http://localhost:8080/api/jobs/admin/jobs',
            method: 'GET',
            dataType: 'json',
                success: function (data) {
                    const jobs = data || [];   // not data.content
                    if (jobs.length > 0) {
                        jobs.forEach(job => {
                            const row = `
                <tr>
                    <td>#${job.id}</td>
                    <td>${job.title}</td>
                    <td>${job.companyName || job.postedBy?.companyName}</td>
                    <td><span class="status ${job.status.toLowerCase()}">${job.status}</span></td>
                    <td>${job.applicantsCount || 0}</td>
                    <td>
                        <button class="btn secondary view-job" id="postEdit" data-id="${job.id}"><i class="fas fa-edit"></i></button>
                        <button class="btn danger delete-job" id="deletePost" data-id="${job.id}"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
                            $tbody.append(row);
                        });
                    } else {
                        $tbody.append('<tr><td colspan="6" style="text-align:center;">No jobs found</td></tr>');
                    }
                },
            error: function (err) {
                console.error('Failed to load jobs:', err);
                $tbody.append('<tr><td colspan="6" style="text-align:center;color:red;">Error loading jobs</td></tr>');
            }
        });
    }

    localStorage.getItem("token");
    $(document).on("click", ".view-job", function () {
        const jobId = $(this).data("id");
        console.log("Clicked jobId:", jobId);

        $.ajax({
            url: "http://localhost:8080/api/jobs/" + jobId,
            method: "GET",
             headers: { "Authorization": "Bearer "},
            success: function(job) {
                console.log("Job received:", job);

                // Fill modal inputs correctly
                $("#editJobId").val(job.id);
                $("#editJobTitle").val(job.title);
                $("#editJobStatus").val(job.status);
                $("#editCompany").val(job.companyName);
                $("#editLocation").val(job.location);
                $("#editJobType").val(job.jobType);
                $("#editSalary").val(job.salaryRange);
                $("#editDeadline").val(job.applicationDeadline);

                // Show modal
                $("#editJobModal").addClass("show");
            },
            error: function(err) {
                console.error("Error fetching job details:", err);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: err,
                    confirmButtonText: "OK"
                });
            }
        });
    });

// Close modal
    $("#closeEditModal").on("click", function () {
        $("#editJobModal").removeClass("show");
    });

// Close modal when clicking outside
    $(window).on("click", function(event) {
        if ($(event.target).is("#editJobModal")) {
            $("#editJobModal").removeClass("show");
        }
    });

// --- Submit Job Status Update ---
    $("#editJobForm").on("submit", function (e) {
        e.preventDefault();

        const jobId = $("#editJobId").val();
        const updatedStatus = $("#editJobStatus").val();

        $.ajax({
            url: "http://localhost:8080/api/jobs/jobs/update-status/" + jobId,
            method: "PUT",
            headers: { "Authorization": "Bearer "},
            contentType: "application/json",
            data: JSON.stringify({ status: updatedStatus }),
            success: function () {
                Swal.fire({
                    icon: "success",
                    title: "Success!",
                    text: "Job status updated successfully!",
                    showConfirmButton: false,
                });
                $("#editJobModal").removeClass("show");
                loadAllJobs();
            },
            error: function (err) {
                console.error("Error updating job status:", err);
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Failed to update job status.",
                    confirmButtonText: "Try Again"
                });

            }
        });
    });

    // Handle Delete (Close) Job
    $(document).on("click", ".delete-job", function () {
        const jobId = $(this).data("id");

        Swal.fire({
            title: "Are you sure?",
            text: "This job will be marked as CLOSED!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, close it!",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#e74c3c"
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: `http://localhost:8080/api/jobs/${jobId}/close`,
                    method: "PUT",
                    success: function (response) {
                        Swal.fire({
                            icon: "success",
                            title: "Closed!",
                            text: response.message,
                            confirmButtonColor: "#3085d6"
                        }).then(() => {
                            // Refresh job table
                            loadAllJobs(0);
                        });
                    },
                    error: function (xhr) {
                        Swal.fire({
                            icon: "error",
                            title: "Failed",
                            text: xhr.responseJSON?.error || "Failed to close job",
                            confirmButtonColor: "#3085d6"
                        });
                    }
                });
            }
        });
    });


    // $('#admin-post-panel').on('click', '.view-job', function() {
    //     const jobId = $(this).data('id');
    //     console.log('View job:', jobId);
    //     // open view modal
    // });
    //
    // $('#admin-post-panel').on('click', '.delete-job', function() {
    //     const jobId = $(this).data('id');
    //     console.log('Delete job:', jobId);
    //     // call delete API
    // });

    function loadEmployees() {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No JWT token found!");
            $("#admin-employee-panel").html('<tr><td colspan="6" style="text-align:center;color:red;">Not logged in</td></tr>');
            return;
        }

        $.ajax({
            url: "http://localhost:8080/api/employee",
            method: "GET",
            headers: { "Authorization": "Bearer "},
            success: function(data) {
                console.log(data)
                let tbody = $("#admin-employee-panel");
                tbody.empty();

                if (data.length === 0) {
                    tbody.append('<tr><td colspan="6" style="text-align:center;">No employees found</td></tr>');
                    return;
                }

                data.forEach(emp => {
                    const statusClass = emp.status === "Active" ? "active" : "inactive";

                    const row = `
                <tr>
                    <td>#E${emp.id}</td>
                    <td>${emp.companyName || emp.contactFirstName + ' ' + emp.contactLastName}</td>
                    <td>${emp.email}</td>
                    <td><span class="status-badge ${statusClass}">${emp.status}</span></td>
                    <td>
                        <button class="btn secondary"><i class="fas fa-edit"></i></button>
                        <button class="btn danger change-status" data-id="${emp.id}"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
                    tbody.append(row);
                });
            },
            error: function(err) {
                console.error("Error fetching employees:", err);
                $("#admin-employee-panel").html('<tr><td colspan="6" style="text-align:center;color:red;">Failed to load employees</td></tr>');
            }
        });
    }

    $(document).on('click', '.change-status', function() {
        const employeeId = $(this).data('id');
        const $row = $(this).closest('tr');
        const $statusBadge = $row.find('.status-badge');
        const currentStatus = $statusBadge.text().trim();
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';

        Swal.fire({
            title: `Are you sure?`,
            text: `You want to set this employee as ${newStatus}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#aaa',
            confirmButtonText: `Yes, ${newStatus}!`
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: `http://localhost:8080/api/employee/status/${employeeId}`,
                    method: 'PUT',
                    headers: {
                        "Authorization": "Bearer " },
                    contentType: "application/json",
                    data: JSON.stringify({ status: newStatus }),
                    success: function(response) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Updated!',
                            text: `Employee status is now ${newStatus}`,
                            timer: 1500,
                            showConfirmButton: false
                        });

                        // Update badge text and class
                        $statusBadge
                            .text(newStatus)
                            .removeClass('active inactive')
                            .addClass(newStatus.toLowerCase());
                    },
                    error: function(err) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Failed',
                            text: 'Cannot update employee status'
                        });
                    }
                });
            }
        });
    });



    function loadSeekers() {
        const $tbody = $('#admin-seeker-panel');
        $tbody.empty();

        $.ajax({
            url: "http://localhost:8080/api/jobseekers",
            method: "GET",
            headers: {
                "Authorization": "Bearer "},
            success: function(data) {
                if (data.length === 0) {
                    $tbody.append('<tr><td colspan="6" style="text-align:center;">No job seekers found</td></tr>');
                    return;
                }
                data.forEach(seeker => {
                    const isActive = seeker.active;
                    const statusClass = isActive ? 'active' : 'inactive';
                    const statusText = isActive ? 'Active' : 'Inactive';

                    const row = `
                        <tr>
                            <td>#JS${seeker.id}</td>
                            <td>${seeker.firstName} ${seeker.lastName}</td>
                            <td>${seeker.email}</td>
                            <td class="status" data-active="${isActive}">
                                <span class="status-badge ${statusClass}">${statusText}</span>
                            </td>
                            <td>
                                <button class="btn secondary view-seeker" data-id="${seeker.id}">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn danger delete-seeker" data-id="${seeker.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                        `;
                    $tbody.append(row);
                });
            },
            error: function(err) {
                console.error("Error fetching job seekers:", err);
                $tbody.append('<tr><td colspan="6" style="text-align:center;color:red;">Failed to load job seekers</td></tr>');
            }
        });
    }

    const $seekerModal = $("#seekerDetailsModal");
    const $closeSeekerModal = $("#closeSeekerModal");

    $(document).on("click", ".view-seeker", function () {
        const seekerId = $(this).data("id");

        $.ajax({
            url: `http://localhost:8080/api/jobseekers/${seekerId}`,
            method: "GET",
            success: function (seeker) {
                $("#seekerId").val(seeker.id);
                $("#seekerFirstName").val(seeker.firstName + " " + seeker.lastName);
                $("#seekerEmail").val(seeker.email);
                $("#seekerPhone").val(seeker.phone);
                $("#seekerAddress").val(seeker.address);
                $("#seekerEducation").val(seeker.education);
                $("#seekerExperience").val(seeker.experience);
                $("#seekerProfession").val(seeker.professionTitle);
                // $("#seekerJobType").val(seeker.preferredJobType);
                // $("#seekerActive").val(seeker.active ? "true" : "false");

                if (seeker.resumeUrl) {
                    $("#seekerResume").attr("href", seeker.resumeUrl).show();
                } else {
                    $("#seekerResume").hide();
                }

                // ✅ Use the same method as Job modal
                $seekerModal.addClass("show");
                $("body").css("overflow", "hidden"); // prevent scroll
            },
            error: function () {
                alert("Error fetching seeker details!");
            }
        });
    });

// Close modal
    $closeSeekerModal.on("click", function () {
        $seekerModal.removeClass("show");
        $("body").css("overflow", "auto");
    });

// Close modal by clicking outside
    $seekerModal.on("click", function (e) {
        if ($(e.target).is($seekerModal)) {
            $seekerModal.removeClass("show");
            $("body").css("overflow", "auto");
        }
    });


// Save changes (update status)
    $("#editSeekerForm").on("submit", function (e) {
        e.preventDefault();
        const seekerId = $("#seekerId").val();
        const active = $("#seekerActive").val() === "true";

        $.ajax({
            url: `http://localhost:8080/api/jobseekers/update-status/${seekerId}`, // backend endpoint for updating status
            method: "PUT",
            contentType: "application/json",
            data: JSON.stringify({ active: active }),
            success: function () {
                alert("Seeker status updated!");
                $seekerModal.fadeOut();
                loadSeekers(0);
            },
            error: function () {
                alert("Error updating seeker!");
            }
        });
    });


    // Handle Deactivate/Activate Seeker button click
    $('#admin-seeker-panel').on('click', '.delete-seeker', function() {
        const seekerId = $(this).data('id');
        const $row = $(this).closest('tr');
        const isActive = $row.find('.status').data('active')

        const actionText = isActive ? 'deactivate' : 'activate';
        const confirmBtnColor = isActive ? '#d33' : '#28a745';

        Swal.fire({
            title: `Are you sure?`,
            text: `You are about to ${actionText} this job seeker.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: confirmBtnColor,
            cancelButtonColor: '#3085d6',
            confirmButtonText: `Yes, ${actionText}!`,
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: `http://localhost:8080/api/jobseekers/deactivate/${seekerId}`,
                    method: 'PUT',
                    headers: {
                        "Authorization": "Bearer "},
                    success: function(response) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Success!',
                            text: response.message,
                            timer: 1500,
                            showConfirmButton: false
                        });
                        loadSeekers(); // reload table
                    },
                    error: function(err) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Failed to update seeker status',
                        });
                    }
                });
            }
        });
    });


    function loadApplications() {
        const $tbody = $("#admin-application-panel");
        $tbody.empty();

        $.ajax({
            url: "http://localhost:8080/api/applications",
            method: "GET",
            headers: {
                "Authorization": "Bearer "},
            success: function(data) {
                if (!data || data.length === 0) {
                    $tbody.append('<tr><td colspan="6" style="text-align:center;">No applications found</td></tr>');
                    return;
                }

                data.forEach(app => {
                    const seeker = app.jobSeeker || {};
                    const job = app.jobPost || {};

                    const resumeLink = app.resumeUrl
                        ? `<a href="${app.resumeUrl}" target="_blank">View</a>`
                        : '-';

                    const row = `
                    <tr>
                        <td>#A${app.id}</td>
                        <td>${seeker.firstName || ''} ${seeker.lastName || ''}</td>
                        <td>${job.title || '-'}</td>
                        <td><span class="status ${app.status?.toLowerCase() || 'pending'}">${app.status || 'Pending'}</span></td>
                        <td>${resumeLink}</td>
                        <td>
                            <button class="btn primary invite-applicant" data-id="${app.id}">
                                <i class="fas fa-envelope"></i> Invite
                            </button>
                        </td>
                    </tr>
                `;
                    $tbody.append(row);
                });
            },
            error: function(err) {
                console.error("Error fetching applications:", err);
                $tbody.append('<tr><td colspan="6" style="text-align:center;color:red;">Failed to load applications</td></tr>');
            }
        });
    }

// Handle invite button click
    $('#admin-application-panel').on('click', '.invite-applicant', function() {
        const appId = $(this).data('id');
        console.log("Invite applicant for application ID:", appId);
        // Call your backend invite API here
    });

    // Load admin details into the form
    function loadAdmin() {
        $.ajax({
            url: "http://localhost:8080/admin/details",
            method: "GET",
            headers: {
                "Authorization": "Bearer " },
            success: function(response) {
                if (response.status === 200 && response.data) {
                    $("#adminName").val(response.data.name);
                    $("#adminEmail").val(response.data.email);
                    $("#adminPassword").val(""); // Never show real password
                } else {
                    $("#statusMessage").text("Admin details not found").css("color", "red");
                }
            },
            error: function(err) {
                console.error("Failed to load admin details:", err);
                $("#statusMessage").text("Failed to load admin details").css("color", "red");
            }
        });
    }

// Handle form submission
    $("#admin-settings-form").on("submit", function(e) {
        e.preventDefault();

        const adminData = {
            name: $("#adminName").val(),
            email: $("#adminEmail").val(),
            password: $("#adminPassword").val() // send only if changed
        };

        $.ajax({
            url: "http://localhost:8080/admin/update",
            method: "PUT",
            headers: {
                "Authorization": "Bearer " },
            contentType: "application/json",
            data: JSON.stringify(adminData),
            success: function(response) {
                $("#statusMessage").text("Admin details updated successfully").css("color", "green");
                $("#adminPassword").val("");
            },
            error: function(err) {
                console.error("Failed to update admin details:", err);
                $("#statusMessage").text("Failed to update admin details").css("color", "red");
            }
        });
    });


    // Logout from sidebar menu
    $(document).on("click", ".menu-item.logout", function() {
        Swal.fire({
            title: "Are you sure?",
            text: "You will be logged out from the system.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, logout",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#e74c3c",
            cancelButtonColor: "#3085d6"
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem("adminData");
                window.location.href = "../index.html";
            }
        });
    });


    // // Chart (Reports)
    // const ctx = $('#reportChart')[0].getContext('2d');
    // new Chart(ctx, {
    //     type: 'bar',
    //     data: {
    //         labels: ['Jobs', 'Employers', 'Seekers', 'Applications'],
    //         datasets: [{
    //             label: 'Platform Stats',
    //             data: [120, 45, 350, 560],
    //             backgroundColor: '#FF6A00'
    //         }]
    //     }
    // });

});
