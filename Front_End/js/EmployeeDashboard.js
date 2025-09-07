// ==============================
// Employee Dashboard JS
// ==============================
$(document).ready(function () {
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
    const $welcomeUser = $("#welcomeUser");
    const $profileName = $("#profileName");
    const $contactPosition = $("#profile-position");
    const $profileFullName = $("#profile-name");
    const $profileEmail = $("#profile-email");
    const $profilePhone = $("#profile-number");
    const $companyName = $("#profile-full-name");
    const $industry = $("#profile-industry");
    const $companyLocation = $("#profile-address");
    const $companyDescription = $("#company-description");
    // const $companyIndustry= $("#profile-industry");

    // setting page inputs
    // const $editProfileName = $("#company-name-setting");
    const $editContactPosition = $("#contact-person-position-setting");
    const $editEmail = $("#company-email-setting");
    const $editPhone = $("#company-number-setting");
    const $editCompanyName = $("#company-name-setting");
    const $editIndustry = $("#company-industry-setting");
    const $editCompanyLocation = $("#company-address-setting");
    const $editCompanyDescription = $("#companyDescription");
    const $contactPersonName = $("#contact-person-name-setting");

    const token = localStorage.getItem("token");

    // -----------------------------
    // SPA Page Navigation - FIXED
    // -----------------------------
    function showPage(pageId) {
        if (!pageId) return;

        // Hide all page contents
        $pageContents.removeClass("active");

        // Show the requested page
        $(`#${pageId}-page`).addClass("active");

        // Update menu active state
        $menuLinks.removeClass("active")
            .filter(`[data-page="${pageId}"]`)
            .addClass("active");

        // Update URL hash
        if (window.location.hash.substring(1) !== pageId) {
            history.pushState(null, null, `#${pageId}`);
        }

        // Scroll to top
        $(window).scrollTop(0);
    }

    // Click menu links
    $menuLinks.on("click", function (e) {
        e.preventDefault();
        const pageId = $(this).data("page");
        showPage(pageId);
    });

    // Profile image click
    $profileImg.on("click", () => showPage("profile"));

    // Buttons with data-page attribute
    $("button[data-page]").on("click", function () {
        showPage($(this).data("page"));
    });

    // Back buttons
    $("#backToJobs, #backToJobsFromEdit, #backToApplicants").on("click", function (e) {
        e.preventDefault();
        const targetPage = $(this).attr("id") === "backToApplicants" ? "applicants" : "job-posts";
        showPage(targetPage);
    });

    // Load initial page based on hash
    const initialPage = window.location.hash ? window.location.hash.substring(1) : "dashboard";
    showPage(initialPage);

    // Handle browser back/forward buttons
    window.addEventListener("popstate", () => {
        const pageId = window.location.hash.substring(1) || "dashboard";
        showPage(pageId);
    });

    // -----------------------------
    // Employee Details
    // -----------------------------
    function setEmployeeDetails(emp) {

        // Then populate profile fields as usual
        const firstName = emp.contactFirstName || "";
        const lastName = emp.contactLastName || "";

        $profileName.text(`${firstName} ${lastName}`);
        $contactPosition.text(
            (emp.contactPosition || "") + (emp.companyName ? " at " + emp.companyName : "")
        );

        $profileFullName.text(`${firstName} ${lastName}`);
        $profileEmail.text(emp.email || "");
        $profilePhone.text(emp.phoneNumber || "");
        $companyName.text(emp.companyName || "");
        $industry.text(emp.industry || "");
        $companyLocation.text(emp.companyLocation || "");
        $companyDescription.text(emp.companyDescription || "");

        // Prefill modals
        $editCompanyName.val(emp.companyName || "");
        $editEmail.val(emp.email || "");
        $editPhone.val(emp.phoneNumber || "");
        $editCompanyLocation.val(emp.companyLocation || "");
        $editIndustry.val(emp.industry || "")
        $contactPersonName.val(`${emp.contactFirstName} ${emp.contactLastName}`);
        $editContactPosition.val(emp.contactPosition || "")

        localStorage.setItem("userEmail", emp.email);
    }


    function loadEmployeeDetails() {
        if (!token) return window.location.href = "../index.html";

        const email = localStorage.getItem("userEmail");
        if (!email) return console.error("No userEmail found in localStorage");

        $.ajax({
            url: `http://localhost:8080/api/employee/email/${encodeURIComponent(email)}`,
            method: "GET",
            headers: {"Authorization": `Bearer ${token}`},
            success: function (response) {
                console.log("API Response:", response);
                setEmployeeDetails(response);
            },
            error: function (xhr) {
                console.error("Failed to load profile", xhr);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Unable to load profile. Please refresh or contact support.',
                });
            }
        });
    }


    loadEmployeeDetails();

    // -----------------------------
    // Save Changes (Profile Edit)
    // -----------------------------
    $(".modal-btn-save").on("click", function () {
        const $modal = $(this).closest(".edit-modal");
        const editType = $modal.attr("id")?.replace("edit-", "").replace("-modal", "");
        if (!editType) return;

        const updates = {};

        if (editType === "profile") {
            const fullName = ($editProfileName.val() || "").split(" ");
            updates.contactFirstName = fullName[0] || "";
            updates.contactLastName = fullName.slice(1).join(" ") || "";
            updates.contactPosition = $editContactPosition.val();
        }

        if (editType === "details") {
            updates.email = $editEmail.val();
            updates.phoneNumber = $editPhone.val();
            updates.companyName = $editCompanyName.val();
            updates.industry = $editIndustry.val();
            updates.companyLocation = $editCompanyLocation.val();
            updates.companyDescription = $editCompanyDescription.val();
        }

        const email = localStorage.getItem("userEmail");
        if (!email) return Swal.fire({icon: 'error', title: 'Error', text: 'No user email found!'});

        if (!Object.keys(updates).length) return;

        $.ajax({
            url: `http://localhost:8080/api/employee/update/${encodeURIComponent(email)}`,
            method: "PUT",
            headers: {"Authorization": `Bearer ${token}`},
            contentType: "application/json",
            data: JSON.stringify(updates),
            success: function (updatedEmp) {
                setEmployeeDetails(updatedEmp);
                closeModals();
                Swal.fire({icon: 'success', title: 'Success', text: 'Profile updated successfully!'});
            },
            error: function (xhr) {
                console.error("Failed to update profile", xhr);
                Swal.fire({icon: 'error', title: 'Error', text: 'Failed to update profile.'});
            }
        });
    });

    // -----------------------------
    // Modals
    // -----------------------------
    function closeModal() {
        $confirmationModal.hide();
    }

    $(".edit-modal-close, .modal-btn-cancel").on("click", closeModal);
    $editModals.on("click", function (e) {
        if (e.target === this) closeModal();
    });

    // -----------------------------
    // Logout
    // -----------------------------

    $logoutLink.on("click", function (e) {
        e.preventDefault();
        $confirmationModal.show();
    });

    $("#modal-cancel").on("click", closeModal);

    $("#modal-confirm").on("click", function () {
        localStorage.clear();
        window.location.href = "../index.html";
    });

    $confirmationModal.on("click", function (e) {
        if (e.target === this) closeModal();
    });

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

    $("#save-profile-picture").on("click", function () {
        const file = $("#file-upload")[0].files[0];
        if (!file) return Swal.fire({icon: 'warning', title: 'No File Selected', text: 'Please select a file.'});

        const email = localStorage.getItem("userEmail");
        const formData = new FormData();
        formData.append("file", file);
        formData.append("email", email);

        $.ajax({
            url: "http://localhost:8080/api/employee/profile-picture",
            method: "POST",
            headers: {"Authorization": `Bearer ${token}`},
            processData: false,
            contentType: false,
            data: formData,
            success: function () {
                Swal.fire({icon: 'success', title: 'Success', text: 'Profile picture updated!'});
                $profilePictureModal.hide();
            },
            error: function (xhr) {
                console.error("Failed to upload picture", xhr);
                Swal.fire({icon: 'error', title: 'Error', text: 'Failed to upload picture'});
            }
        });
    });

    // -----------------------------
    // Change Password
    // -----------------------------
    $("#change-password-btn").on("click", function () {
        $("#edit-password-modal").css("display", "flex");
    });

    $("#edit-password-modal .edit-modal-close, #edit-password-modal .modal-btn-cancel").on("click", function () {
        $("#edit-password-modal").hide();
        clearPasswordFields();
    });

    $("#edit-password-modal").on("click", function (e) {
        if (e.target === this) {
            $(this).hide();
            clearPasswordFields();
        }
    });

    function clearPasswordFields() {
        $("#current-password").val('');
        $("#new-password").val('');
        $("#confirm-password").val('');
    }

    $("#save-password-btn").on("click", function () {
        const currentPassword = $("#current-password").val().trim();
        const newPassword = $("#new-password").val().trim();
        const confirmPassword = $("#confirm-password").val().trim();

        if (!currentPassword || !newPassword || !confirmPassword) {
            return Swal.fire({icon: 'warning', title: 'Incomplete Form', text: 'Please fill in all fields.'});
        }

        if (newPassword !== confirmPassword) {
            return Swal.fire({
                icon: 'error',
                title: 'Mismatch',
                text: 'New password and confirm password do not match.'
            });
        }

        const email = localStorage.getItem("userEmail");
        if (!email) return Swal.fire({icon: 'warning', title: 'Email Not Found', text: 'Please login again.'});

        $.ajax({
            url: "http://localhost:8080/api/employee/change-password",
            method: "POST",
            headers: {"Authorization": `Bearer ${token}`},
            contentType: "application/json",
            data: JSON.stringify({email, currentPassword, newPassword}),
            success: function () {
                Swal.fire({icon: 'success', title: 'Success', text: 'Password changed successfully!'});
                $("#edit-password-modal").hide();
                clearPasswordFields();
            },
            error: function (xhr) {
                const message = xhr.responseJSON?.message || "Failed to change password";
                Swal.fire({icon: 'error', title: 'Error', text: message});
            }
        });
    });

    // -----------------------------
    // Job Post Management
    // -----------------------------
    $("#createJobBtn").on("click", function () {
        $("#create-job-form").toggle();
    });

    $("#cancelCreateJob").on("click", function () {
        $("#create-job-form").hide();
    });

    // View job details
    $(".btn-view[data-job-id]").on("click", function () {
        const jobId = $(this).data("job-id");
        showPage("view-job");
        // Here you would typically load the specific job data
    });

    // Edit job
    $(".btn-edit[data-job-id]").on("click", function () {
        const jobId = $(this).data("job-id");
        showPage("edit-job");
        // Here you would typically load the specific job data for editing
    });

    // View applicant details
    $(".btn-view[data-applicant-id]").on("click", function () {
        const applicantId = $(this).data("applicant-id");
        showPage("view-applicant");
        // Here you would typically load the specific applicant data
    });

    // -----------------------------
    // Messages
    // -----------------------------
    $("#newMessageBtn, #sidebarNewMessageBtn").on("click", function (e) {
        e.preventDefault();
        $("#new-message-form").toggle();
    });

    $("#cancelMessage").on("click", function () {
        $("#new-message-form").hide();
    });

    // -----------------------------
    // Settings Tabs
    // -----------------------------
    $(".settings-tab").on("click", function () {
        const tabId = $(this).data("tab");

        // Update active tab
        $(".settings-tab").removeClass("active");
        $(this).addClass("active");

        // Show corresponding content
        $(".settings-content").removeClass("active");
        $(`#${tabId}-settings`).addClass("active");
    });

    // -----------------------------
    // Filter Toggle
    // -----------------------------
    $("#toggleFilterBtn").on("click", function (e) {
        e.preventDefault();
        $("#filter-options").toggle();
    });
});