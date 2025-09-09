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
        $pageContents.removeClass("active");
        $(`#${pageId}-page`).addClass("active");
        $menuLinks.removeClass("active").filter(`[data-page="${pageId}"]`).addClass("active");
        history.pushState(null, null, `#${pageId}`);
        $(window).scrollTop(0);
    }

    $menuLinks.on("click", e => {
        e.preventDefault();
        showPage($(e.currentTarget).data("page"));
    });

    $profileImg.on("click", () => showPage("profile"));

    $("button[data-page]").on("click", function () {
        showPage($(this).data("page"));
    });

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

        // Set into account settings form
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
        if (!email) return;

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
    // Job Posts
    // -----------------------------
    function loadEmployeeJobsAndCount() {
        const email = localStorage.getItem("userEmail");
        if (!token || !email) return;

        // Load all jobs for employee
        $.ajax({
            url: `http://localhost:8080/api/jobs/employee/${encodeURIComponent(email)}`,
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` },
            success: function (jobs) {
                const tbody = $(".job-table-body");
                tbody.empty();

                jobs.forEach(job => {
                    const postedDate = new Date(job.postedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    });

                    const row = `
                        <tr id="job-${job.id}">
                            <td>
                                <div class="job-title">${job.title}</div>
                                <div class="job-company">${job.companyName}</div>
                            </td>
                            <td>0</td>
                            <td>
                                <span class="status-badge status-${job.status.toLowerCase()}">${job.status}</span>
                            </td>
                            <td>${postedDate}</td>
                            <td>
                                <button class="action-btn btn-view" data-job-id="${job.id}">View</button>
                                <button class="action-btn btn-edit" data-job-id="${job.id}">Edit</button>
                            </td>
                        </tr>`;
                    tbody.append(row);
                });
            },
            error: () => Swal.fire({ icon: "error", title: "Failed", text: "Could not load your jobs." })
        });

        // Load active jobs count
        $.ajax({
            url: `http://localhost:8080/api/jobs/my/active-job-count?email=${encodeURIComponent(email)}`,
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` },
            success: count => $("#active-post-count").text(count),
            error: xhr => console.error("Failed to fetch active job count", xhr)
        });
    }

    // -----------------------------
    // Load Job Details
    // -----------------------------
    function loadJobDetails(jobId) {
        const token = localStorage.getItem("token");
        if (!token) return;

        $.ajax({
            url: `http://localhost:8080/api/jobs/${jobId}`,
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` },
            success: function(job) {
                // Set job title
                $(".detail-title").text(job.title);

                // Posted date
                const postedDate = new Date(job.postedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                });
                $(".detail-subtitle").text(`${job.companyName} • Posted on ${postedDate}`);

                // Status
                $(".detail-status")
                    .text(job.status)
                    .removeClass()
                    .addClass(`detail-status status-${job.status.toLowerCase()}`);

                // Job Information
                const infoItems = $(".detail-content .detail-card:first .info-item .info-value");
                $(infoItems[0]).text(job.department);
                $(infoItems[1]).text(job.employmentType);
                $(infoItems[2]).text(job.location);
                $(infoItems[3]).text(job.requiredExperience);
                $(infoItems[4]).text(job.salaryRange);
                $(infoItems[5]).text(new Date(job.applicationDeadline).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                }));

                // Job Description & Requirements
                $(".detail-card").each(function() {
                    const title = $(this).find(".detail-card-title").text().trim();
                    if (title === "Job Description") {
                        const $ul = $(this).find("ul");
                        $ul.empty();

                        console.log(job)
                        const requirements = [
                            { label: "Education ", value: job.requiredEducation || "Not specified" },
                            { label: "Experience", value: job.requiredExperience || "Not specified" },
                            { label: "Gender    ", value: job.gender || "Any" },
                            { label: "Skills    ", value: (job.keySkills && job.keySkills.length > 0) ? job.keySkills.join(", ") : "Not specified" }
                        ];

                        requirements.forEach(req => $ul.append(`<li>${req.label}: ${req.value}</li>`));
                        $(this).find(".info-value").text(job.description || "No description provided");
                    }
                });

                // Applications Overview
                const appOverviewItems = $(".detail-content .detail-card:last .info-item .info-value");
                $(appOverviewItems[0]).text(job.totalApplications || 0);
                $(appOverviewItems[1]).text(job.newApplications || 0);
                $(appOverviewItems[2]).text(job.inReview || 0);
                $(appOverviewItems[3]).text(job.interviewStage || 0);
                $(appOverviewItems[4]).text(job.rejected || 0);
                $(appOverviewItems[5]).text(job.hired || 0);

                // Show the view page
                showPage("view-job");
            },
            error: function(xhr) {
                console.error("Failed to fetch job details", xhr);
                Swal.fire("Error", "Could not load job details.", "error");
            }
        });
    }

    // -----------------------------
    // Event Bindings
    // -----------------------------
    $(".job-table-body").on("click", ".btn-view", function () {
        loadJobDetails($(this).data("job-id"));
    });

    $(".job-table-body").on("click", ".btn-edit", function () {
        showPage("edit-job");
    });

    $("#createJobBtn").on("click", () => {
        $("#create-job-form").toggle().show();
        $("#job-post-table").hide();
    });

    $("#cancelCreateJob").on("click", () => {
        $("#create-job-form").hide();
        $("#job-post-table").show();
    });

    $logoutLink.on("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userEmail");
        window.location.href = "../index.html";
    });

    // Load jobs initially
    loadEmployeeJobsAndCount();
});
