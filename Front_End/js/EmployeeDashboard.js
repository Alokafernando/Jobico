// ==============================
// Employee Dashboard JS
// ==============================
$(document).ready(function () {
    const token = localStorage.getItem("token");

    // -----------------------------
    // Cached Selectors
    // -----------------------------
    const $pageContents = $(".page-content");
    const $menuLinks = $(".menu-link");
    const $profileImg = $(".profile-img");
    const $logoutLink = $("#logout-link");
    const $editModals = $(".edit-modal");
    const $profilePictureModal = $("#edit-profile-picture-modal");
    const $confirmationModal = $("#confirmation-modal");

    // Profile display fields
    const $profileName = $("#profileName");
    const $contactPosition = $("#profile-position");
    const $profileFullName = $("#profile-name");
    const $profileEmail = $("#profile-email");
    const $profilePhone = $("#profile-number");
    const $companyName = $("#profile-full-name");
    const $industry = $("#profile-industry");
    const $companyLocation = $("#profile-address");
    const $companyDescription = $("#company-description");

    // Account Settings inputs
    const $editCompanyName = $("#company-name-setting");
    const $editEmail = $("#company-email-setting");
    const $editPhone = $("#company-number-setting");
    const $editCompanyLocation = $("#company-address-setting");
    const $editIndustry = $("#company-industry-setting");
    const $contactPersonName = $("#contact-person-name-setting");
    const $editContactPosition = $("#contact-person-position-setting");
    const $editCompanyDescription = $("#companyDescription");

    // -----------------------------
    // SPA Page Navigation
    // -----------------------------
    function showPage(pageId) {
        if (!pageId) return;
        $pageContents.removeClass("active");
        $(`#${pageId}-page`).addClass("active");
        $menuLinks.removeClass("active").filter(`[data-page="${pageId}"]`).addClass("active");
        if (window.location.hash.substring(1) !== pageId) history.pushState(null, null, `#${pageId}`);
        $(window).scrollTop(0);
    }

    $menuLinks.on("click", e => { e.preventDefault(); showPage($(e.currentTarget).data("page")); });
    $profileImg.on("click", () => showPage("profile"));
    $("button[data-page]").on("click", function () { showPage($(this).data("page")); });
    $("#backToJobs, #backToJobsFromEdit, #backToApplicants").on("click", function () {
        const target = this.id === "backToApplicants" ? "applicants" : "job-posts";
        showPage(target);
    });

    const initialPage = window.location.hash ? window.location.hash.substring(1) : "dashboard";
    showPage(initialPage);
    window.addEventListener("popstate", () => showPage(window.location.hash.substring(1) || "dashboard"));

    // -----------------------------
    // Employee Details
    // -----------------------------
    function setEmployeeDetails(emp) {
        const firstName = emp.contactFirstName || "";
        const lastName = emp.contactLastName || "";
        $profileName.text(`${firstName} ${lastName}`);
        $contactPosition.text(`${emp.contactPosition || ""}${emp.companyName ? " at " + emp.companyName : ""}`);
        $profileFullName.text(`${firstName} ${lastName}`);
        $profileEmail.text(emp.email || "");
        $profilePhone.text(emp.phoneNumber || "");
        $companyName.text(emp.companyName || "");
        $industry.text(emp.industry || "");
        $companyLocation.text(emp.companyLocation || "");
        $companyDescription.text(emp.companyDescription || "");

        $editCompanyName.val(emp.companyName || "");
        $editEmail.val(emp.email || "");
        $editPhone.val(emp.phoneNumber || "");
        $editCompanyLocation.val(emp.companyLocation || "");
        $editIndustry.val(emp.industry || "");
        $contactPersonName.val(`${firstName} ${lastName}`);
        $editContactPosition.val(emp.contactPosition || "");
        $editCompanyDescription.val(emp.companyDescription || "");

        localStorage.setItem("userEmail", emp.email);
    }

    function loadEmployeeDetails() {
        if (!token) return window.location.href = "../index.html";
        const email = localStorage.getItem("userEmail");
        if (!email) return console.error("No userEmail found in localStorage");

        $.ajax({
            url: `http://localhost:8080/api/employee/email/${encodeURIComponent(email)}`,
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` },
            success: setEmployeeDetails,
            error: () => Swal.fire({ icon: "error", title: "Error", text: "Failed to load employee data." })
        });
    }
    loadEmployeeDetails();

    // -----------------------------
    // Save Account Settings
    // -----------------------------
    $("#saveAccountSettings").on("click", function () {
        const email = localStorage.getItem("userEmail");
        if (!email) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No user email found! Please log in again.'
            });
            return;
        }

        function safeVal(selector) {
            return $(selector).length ? ($(selector).val() || "").trim() : "";
        }

        // ✅ Build object with updated values safely
        const fullName = safeVal("#contact-person-name-setting").split(" ");
        const updates = {
            companyName: safeVal("#company-name-setting"),
            email: safeVal("#company-email-setting"),
            phoneNumber: safeVal("#company-number-setting"),
            companyLocation: safeVal("#company-address-setting"),
            industry: safeVal("#company-industry-setting"),
            contactFirstName: fullName[0] || "",
            contactLastName: fullName.slice(1).join(" ") || "",
            contactPosition: safeVal("#contact-person-position-setting"),
            companyDescription: safeVal("#companyDescription") // will be "" if field missing
        };

        $.ajax({
            url: `http://localhost:8080/api/employee/update/${encodeURIComponent(email)}`,
            method: "PUT",
            headers: { "Authorization": `Bearer ${token}` },
            contentType: "application/json",
            data: JSON.stringify(updates),
            success: function (updatedEmp) {
                setEmployeeDetails(updatedEmp);
                Swal.fire({
                    icon: 'success',
                    title: 'Updated!',
                    text: 'Account settings saved successfully.'
                });
            },
            error: function (xhr) {
                const msg = xhr.responseJSON?.message || 'Failed to update account settings';
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: msg
                });
            }
        });
    });


    $("#saveSecuritySettings").on("click", function () {
        const currentPassword = $("#currentPassword").val().trim();
        const newPassword = $("#newPassword").val().trim();
        const confirmPassword = $("#confirmPassword").val().trim();
        const email = localStorage.getItem("userEmail");
        const token = localStorage.getItem("token");

        if (!currentPassword || !newPassword || !confirmPassword) {
            Swal.fire({
                icon: 'warning',
                title: 'Incomplete Form',
                text: 'Please fill in all fields.'
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Password Mismatch',
                text: 'New password and confirm password do not match.'
            });
            return;
        }

        if (!email) {
            Swal.fire({
                icon: 'error',
                title: 'Email not found',
                text: 'Please login again.'
            });
            return;
        }

        $.ajax({
            url: "http://localhost:8080/api/employee/change-password",
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            contentType: "application/json",
            data: JSON.stringify({
                email: email,
                currentPassword: currentPassword,
                newPassword: newPassword
            }),
            success: function (response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: response.message || 'Password changed successfully!'
                });
                // Clear fields
                $("#currentPassword, #newPassword, #confirmPassword").val('');
            },
            error: function (xhr) {
                const message = xhr.responseJSON?.message || 'Failed to change password';
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: message
                });
            }
        });
    });



    // -----------------------------
    // Modals
    // -----------------------------
    function closeModal(modal) { modal.hide(); }
    $(".edit-modal-close, .modal-btn-cancel").on("click", function () { closeModal($(this).closest(".edit-modal")); });
    $editModals.on("click", function (e) { if (e.target === this) closeModal($(this)); });

    // -----------------------------
    // Logout
    // -----------------------------
    $logoutLink.on("click", e => { e.preventDefault(); $confirmationModal.show(); });
    $("#modal-cancel").on("click", () => closeModal($confirmationModal));
    $("#modal-confirm").on("click", () => { localStorage.clear(); window.location.href = "../index.html"; });

    // -----------------------------
    // Profile Picture Upload
    // -----------------------------
    $("#open-profile-picture-modal").on("click", () => $profilePictureModal.show());
    $profilePictureModal.find(".edit-modal-close, .modal-btn-cancel").on("click", () => $profilePictureModal.hide());
    $("#file-upload").on("change", function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = e => $("#avatar-preview").attr("src", e.target.result);
            reader.readAsDataURL(file);
        }
    });

    // -----------------------------
    // Change Password
    // -----------------------------
    function clearPasswordFields() { $("#current-password, #new-password, #confirm-password").val(''); }

    $("#change-password-btn").on("click", () => $("#edit-password-modal").css("display", "flex"));
    $("#edit-password-modal .edit-modal-close, #edit-password-modal .modal-btn-cancel").on("click", () => { $("#edit-password-modal").hide(); clearPasswordFields(); });
    $("#edit-password-modal").on("click", function (e) { if (e.target === this) { $(this).hide(); clearPasswordFields(); } });

    $("#save-password-btn").on("click", function () {
        const currentPassword = $("#current-password").val().trim();
        const newPassword = $("#new-password").val().trim();
        const confirmPassword = $("#confirm-password").val().trim();
        if (!currentPassword || !newPassword || !confirmPassword) return Swal.fire({icon:'warning', title:'Incomplete Form', text:'Please fill in all fields.'});
        if (newPassword !== confirmPassword) return Swal.fire({icon:'error', title:'Mismatch', text:'New password and confirm password do not match.'});

        const email = localStorage.getItem("userEmail");
        if (!email) return Swal.fire({icon:'warning', title:'Email Not Found', text:'Please login again.'});

        $.ajax({
            url: "http://localhost:8080/api/employee/change-password",
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            contentType: "application/json",
            data: JSON.stringify({ email, currentPassword, newPassword }),
            success: () => { Swal.fire({icon:'success', title:'Success', text:'Password changed successfully!'}); $("#edit-password-modal").hide(); clearPasswordFields(); },
            error: xhr => Swal.fire({icon:'error', title:'Error', text: xhr.responseJSON?.message || "Failed to change password"})
        });
    });

    // -----------------------------
    // Job Posts & Applicants
    // -----------------------------
    $("#createJobBtn").on("click", () => {
        $("#create-job-form").toggle().show();
        $("#job-post-table").hide();
    });
    $("#cancelCreateJob").on("click", () => {
        $("#create-job-form").hide()
        $("#job-post-table").show();
    });

    $(".btn-view[data-job-id]").on("click", function () { showPage("view-job"); });
    $(".btn-edit[data-job-id]").on("click", function () { showPage("edit-job"); });
    $(".btn-view[data-applicant-id]").on("click", function () { showPage("view-applicant"); });

    // -----------------------------
    // Messages
    // -----------------------------
    $("#newMessageBtn, #sidebarNewMessageBtn").on("click", e => { e.preventDefault(); $("#new-message-form").toggle(); });
    $("#cancelMessage").on("click", () => $("#new-message-form").hide());

    // -----------------------------
    // Settings Tabs
    // -----------------------------
    $(".settings-tab").on("click", function () {
        const tabId = $(this).data("tab");
        $(".settings-tab").removeClass("active");
        $(this).addClass("active");
        $(".settings-content").removeClass("active");
        $(`#${tabId}-settings`).addClass("active");
    });

    // -----------------------------
    // Filter Toggle
    // -----------------------------
    $("#toggleFilterBtn").on("click", e => { e.preventDefault(); $("#filter-options").toggle(); });
});

$("#publishJobBtn").on("click", function () {
    const token = localStorage.getItem("token");
    if (!token) return Swal.fire({ icon: "error", title: "Error", text: "You are not logged in." });

    // Collect form values
    const title = $("#jobTitle").val().trim();
    const department = $("#jobDepartment").val();
    const type = $("#jobType").val();
    const location = $("#jobLocation").val().trim();
    const description = $("#jobDescription").val().trim();
    const deadline = $("#jobDeadline").val();
    const salaryRange = $("#jobSalary").val().trim();
    const requirements = $("#requirements").val().trim();
    const gender = $("#gender").val();
    const requiredExperience = $("#experience").val().trim();
    const requiredEducation = $("#qualification").val();
    const keySkillsInput = $("#keySkills").val().trim();
    const keySkills = keySkillsInput ? keySkillsInput.split(',').map(skill => skill.trim()) : [];


    const logoFile = $("#jobLogo")[0].files[0];
    const today = new Date().toISOString().split("T")[0];

    // Employee info from localStorage
    const companyEmail = localStorage.getItem("userEmail");
    const companyName = localStorage.getItem("companyName");
    const companyPhone = localStorage.getItem("phoneNumber");

    if (!title || !description) {
        return Swal.fire({
            icon: "warning",
            title: "Incomplete Form",
            text: "Please fill all required fields."
        });
    }

    const jobData = {
        title,
        department,
        employmentType: type,
        location,
        description,
        applicationDeadline: deadline,
        postedAt: today,
        salaryRange,
        requirements,
        keySkills,
        gender,
        requiredExperience,
        requiredEducation,
        status: "Active",
        companyEmail,
        companyName,
        companyPhone
    };


    const formData = new FormData();
    formData.append("job", new Blob([JSON.stringify(jobData)], { type: "application/json" }));
    if (logoFile) formData.append("logo", logoFile);

    $.ajax({
        url: "http://localhost:8080/api/jobs/create",
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        processData: false,
        contentType: false,
        data: formData,
        success: function (response) {
            Swal.fire({ icon: "success", title: "Job Posted!", text: "Your job post has been successfully published." });
            $("#create-job-form").hide();
            $("#job-post-table").show()
            // Optionally reload job posts list here
        },
        error: function (xhr) {
            Swal.fire({
                icon: "error",
                title: "Failed",
                text: xhr.responseJSON?.message || "Could not create job. Please try again."
            });
        }
    });
});

function loadAllJobs() {
    const token = localStorage.getItem("token");
    if (!token) return;

    $.ajax({
        url: "http://localhost:8080/api/jobs",
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` },
        success: function(jobs) {
            const tbody = $(".job-table-body");
            tbody.empty();

            jobs.forEach(job => {
                // Convert ISO date to human-readable format
                const postedDate = new Date(job.postedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });

                const row = `
                    <tr id="job-${job.id}">
                        <td>
                            <div class="job-title" id="job-title-${job.id}">${job.title}</div>
                            <div class="job-company" id="job-company-${job.id}">${job.companyName}</div>
                        </td>
                        <td id="job-id-${job.id}">0</td>
                        <td id="job-status-${job.id}">
                            <span class="status-badge status-${job.status.toLowerCase()}">${job.status}</span>
                        </td>
                        <td id="job-posted-${job.id}">${postedDate}</td> <!-- Formatted date here -->
                        <td>
                            <button class="action-btn btn-view" id="btn-view-${job.id}" data-job-id="${job.id}">View</button>
                            <button class="action-btn btn-edit" id="btn-edit-${job.id}" data-job-id="${job.id}">Edit</button>
                        </td>
                    </tr>
                `;
                tbody.append(row);
            });

        },
        error: function(xhr) {
            Swal.fire({
                icon: "error",
                title: "Failed",
                text: "Could not load jobs."
            });
        }
    });
}

// Delegate click handlers once
$(".job-table-body").on("click", ".btn-view", function() {
    const jobId = $(this).data("job-id");
    showPage("view-job");
});

$(".job-table-body").on("click", ".btn-edit", function() {
    const jobId = $(this).data("job-id");
    showPage("edit-job");
});

loadAllJobs();

