$(document).ready(function () {
    // -----------------------------
    // Page Navigation
    // -----------------------------
    const $menuLinks = $(".menu-link");
    const $pageContents = $(".page-content");

    function showPage(pageId) {
        $pageContents.removeClass("active");
        $("#" + pageId + "-page").addClass("active");

        // Update URL hash
        window.location.hash = pageId;

        // Update active menu link
        $menuLinks.removeClass("active").filter(`[data-page='${pageId}']`).addClass("active");
    }

    $menuLinks.on("click", function (e) {
        e.preventDefault();
        showPage($(this).data("page"));
    });

    // Initial page
    const initialPage = window.location.hash.substring(1) || 'dashboard';
    showPage(initialPage);

    // -----------------------------
    // Notifications
    // -----------------------------
    $(".notification-btn").on("click", function () {
        showToast("You have 3 new notifications!", "info");
    });

    // -----------------------------
    // Profile Image Click
    // -----------------------------
    $(".profile-img").on("click", function () {
        showPage("profile");
    });

    // -----------------------------
    // Create Job Form
    // -----------------------------
    const $createJobBtn = $("#createJobBtn");
    const $createJobForm = $("#create-job-form");

    $createJobBtn.on("click", function () {
        $createJobForm.toggle();
    });

    $("#cancelCreateJob").on("click", function () {
        $createJobForm.hide();
    });

    $("#publishJobBtn").on("click", function () {
        $createJobForm.hide();
        showToast("Job published successfully!", "success");
    });

    // -----------------------------
    // Filter Options
    // -----------------------------
    $("#toggleFilterBtn").on("click", function (e) {
        e.preventDefault();
        $("#filter-options").toggle();
    });

    // -----------------------------
    // New Message Form
    // -----------------------------
    const $newMessageForm = $("#new-message-form");

    $("#newMessageBtn, #sidebarNewMessageBtn").on("click", function (e) {
        e.preventDefault();
        $newMessageForm.toggle();
    });

    $("#cancelMessage").on("click", function () {
        $newMessageForm.hide();
    });

    $("#sendMessageBtn").on("click", function () {
        $newMessageForm.hide();
        showToast("Message sent successfully!", "success");
    });

    $("#sendReplyBtn").on("click", function () {
        showToast("Reply sent successfully!", "success");
    });

    // -----------------------------
    // View/Edit Job Buttons
    // -----------------------------
    $(".btn-view[data-job-id]").on("click", function () {
        showPage("view-job");
    });

    $(".btn-edit[data-job-id]").on("click", function () {
        showPage("edit-job");
    });

    $("#updateJobBtn").on("click", function () {
        showToast("Job updated successfully!", "success");
        setTimeout(() => showPage("job-posts"), 1500);
    });

    // -----------------------------
    // View Applicant
    // -----------------------------
    $(".btn-view[data-applicant-id]").on("click", function () {
        showPage("view-applicant");
    });

    $("#saveApplicantChanges").on("click", function () {
        showToast("Applicant details updated successfully!", "success");
    });

    // -----------------------------
    // Back Buttons
    // -----------------------------
    $("#backToJobs, #backToJobsFromEdit").on("click", function (e) {
        e.preventDefault();
        showPage("job-posts");
    });

    $("#backToApplicants").on("click", function (e) {
        e.preventDefault();
        showPage("applicants");
    });

    // -----------------------------
    // Settings Tabs
    // -----------------------------
    $(".settings-tab").on("click", function () {
        const tabId = $(this).data("tab");

        $(".settings-tab").removeClass("active");
        $(this).addClass("active");

        $(".settings-content").removeClass("active");
        $("#" + tabId + "-settings").addClass("active");
    });

    // -----------------------------
    // Password Toggle
    // -----------------------------
    function togglePassword(inputId, toggleId) {
        $("#" + toggleId).on("click", function () {
            const $input = $("#" + inputId);
            const type = $input.attr("type") === "password" ? "text" : "password";
            $input.attr("type", type);
            $(this).toggleClass("fa-eye fa-eye-slash");
        });
    }

    togglePassword("currentPassword", "toggleCurrentPassword");
    togglePassword("newPassword", "toggleNewPassword");
    togglePassword("confirmPassword", "toggleConfirmPassword");

    // -----------------------------
    // Settings Save Buttons
    // -----------------------------
    $("#saveAccountSettings").on("click", function () {
        showToast("Account settings saved successfully!", "success");
    });

    $("#saveSecuritySettings").on("click", function () {
        showToast("Security settings updated successfully!", "success");
    });

    $("#saveNotificationSettings").on("click", function () {
        showToast("Notification preferences saved!", "success");
    });

    // -----------------------------
    // Toast Notification
    // -----------------------------
    function showToast(message, type = "info") {
        const icon = type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle";
        const $toast = $(`
            <div class="toast ${type}">
                <i class="fas fa-${icon}"></i>
                <span style="margin-left:10px;">${message}</span>
            </div>
        `);

        $("#toastContainer").append($toast);

        setTimeout(() => $toast.addClass("show"), 50);

        setTimeout(() => {
            $toast.removeClass("show");
            setTimeout(() => $toast.remove(), 300);
        }, 3000);
    }
});
