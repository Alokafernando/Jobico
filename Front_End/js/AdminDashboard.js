$(document).ready(function() {

    loadAllJobs();
    loadEmployees()
    loadSeekers();
    loadApplications();
    loadAdmin();


    // Sidebar navigation
    $('.menu-item').on('click', function() {
        $('.menu-item').removeClass('active');
        $(this).addClass('active');

        const sectionId = $(this).data('section');
        $('main section').addClass('hidden');
        if (sectionId) {
            $('#' + sectionId).removeClass('hidden');
            $('#page-title').text($(this).text());
        }
    });

    // Modal controls
    window.openModal = function(id) {
        $('#' + id).addClass('show');
    }

    window.closeModal = function(id) {
        $('#' + id).removeClass('show');
    }


    function loadAllJobs() {
        const $tbody = $('#admin-post-panel');
        $tbody.empty(); // Clear existing rows

        $.ajax({
            url: 'http://localhost:8080/api/jobs/jobs',
            method: 'GET',
            dataType: 'json',
            success: function(data) {
                const jobs = data.content || []; // <-- jobs array
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
                                <button class="btn secondary view-job" data-id="${job.id}"><i class="fas fa-eye"></i></button>
                                <button class="btn danger delete-job" data-id="${job.id}"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>
                    `;
                        $tbody.append(row);
                    });
                } else {
                    $tbody.append('<tr><td colspan="6" style="text-align:center;">No jobs found</td></tr>');
                }
            },
            error: function(err) {
                console.error('Failed to load jobs:', err);
                $tbody.append('<tr><td colspan="6" style="text-align:center; color:red;">Error loading jobs</td></tr>');
            }
        });
    }

    // Optional: add click handlers for dynamically created buttons
    $('#admin-post-panel').on('click', '.view-job', function() {
        const jobId = $(this).data('id');
        console.log('View job:', jobId);
        // open view modal
    });

    $('#admin-post-panel').on('click', '.delete-job', function() {
        const jobId = $(this).data('id');
        console.log('Delete job:', jobId);
        // call delete API
    });

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
            headers: { "Authorization": "Bearer " + token },
            success: function(data) {
                let tbody = $("#admin-employee-panel");
                tbody.empty();

                if (data.length === 0) {
                    tbody.append('<tr><td colspan="6" style="text-align:center;">No employees found</td></tr>');
                    return;
                }

                data.forEach(emp => {
                    let row = `
                <tr>
                    <td>#E${emp.id}</td>
                    <td>${emp.companyName || emp.contactFirstName + ' ' + emp.contactLastName}</td>
                    <td>${emp.email}</td>
                    <td><span class="status">${emp.role || 'Reviewing'}</span></td>
                    <td>0</td>
                    <td>
                        <button class="btn secondary"><i class="fas fa-edit"></i></button>
                        <button class="btn danger"><i class="fas fa-trash"></i></button>
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

    function loadSeekers() {
        const $tbody = $('#admin-seeker-panel');
        $tbody.empty();

        $.ajax({
            url: "http://localhost:8080/api/jobseekers",
            method: "GET",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            success: function(data) {
                if (data.length === 0) {
                    $tbody.append('<tr><td colspan="6" style="text-align:center;">No job seekers found</td></tr>');
                    return;
                }
                data.forEach(seeker => {
                    const row = `
                        <tr>
                            <td>#JS${seeker.id}</td>
                            <td>${seeker.firstName} ${seeker.lastName}</td>
                            <td>${seeker.email}</td>
                            <td>0</td>
<!--                            <td>${seeker.experience || '-'}</td>-->
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

    function loadApplications() {
        const $tbody = $("#admin-application-panel");
        $tbody.empty();

        $.ajax({
            url: "http://localhost:8080/api/applications",
            method: "GET",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
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
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
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
            url: "http://localhost:8080/admin/update", // backend endpoint to update admin
            method: "PUT",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            contentType: "application/json",
            data: JSON.stringify(adminData),
            success: function(response) {
                $("#statusMessage").text("Admin details updated successfully").css("color", "green");
                $("#adminPassword").val(""); // clear password field
            },
            error: function(err) {
                console.error("Failed to update admin details:", err);
                $("#statusMessage").text("Failed to update admin details").css("color", "red");
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
