$(document).ready(function () {
    const token = localStorage.getItem("token");

    const $pageContents = $(".page-content");
    const $menuLinks = $(".menu-link");
    const $profileImg = $(".profile-img");
    const $logoutLink = $("#logout-link");
    const $confirmationModal = $("#confirmation-modal");

    const $profileName = $("#profileName");
    const $contactPosition = $("#profile-position");
    const $profileFullName = $("#profile-name");
    const $profileEmail = $("#profile-email");
    const $profilePhone = $("#profile-number");
    const $companyName = $("#profile-full-name");
    const $industry = $("#profile-industry");
    const $companyLocation = $("#profile-address");
    const $companyDescription = $("#company-description");

    const $editCompanyName = $("#company-name-setting");
    const $editEmail = $("#company-email-setting");
    const $editPhone = $("#company-number-setting");
    const $editCompanyLocation = $("#company-address-setting");
    const $editIndustry = $("#company-industry-setting");
    const $contactPersonName = $("#contact-person-name-setting");
    const $editContactPosition = $("#contact-person-position-setting");
    const $editCompanyDescription = $("#companyDescription");

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
        localStorage.setItem("employeeId", emp.id);
        loadApplicants(emp.id);
        loadRecentApplicants();
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

    function loadEmployeeJobsAndCount() {
        const email = localStorage.getItem("userEmail");
        if (!token || !email) return;

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

        $.ajax({
            url: `http://localhost:8080/api/jobs/my/active-job-count?email=${encodeURIComponent(email)}`,
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` },
            success: count => $("#active-post-count").text(count),
            error: xhr => console.error("Failed to fetch active job count", xhr)
        });
    }

    loadEmployeeJobsAndCount();

    function loadJobDetails(jobId) {
        if (!token) return;

        $.ajax({
            url: `http://localhost:8080/api/jobs/${jobId}`,
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` },
            success: function(job) {
                $(".detail-title").text(job.title);
                const postedDate = new Date(job.postedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                });
                $(".detail-subtitle").text(`${job.companyName} • Posted on ${postedDate}`);
                $(".detail-status").text(job.status).removeClass().addClass(`detail-status status-${job.status.toLowerCase()}`);

                $("#view-job-department").text(job.department);
                $("#view-job-type").text(job.employmentType);
                $("#view-job-address").text(job.location);
                $("#view-job-experience").text(job.requiredExperience);
                $("#view-job-salaryRange").text(job.salaryRange);
                $("#view-job-deadline").text(new Date(job.applicationDeadline).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }));
                $("#view-job-description").text(job.description);

                $("#view-all-requirement").empty();
                if (job.requirements) {
                    job.requirements.split(/[.\n]/).forEach(item => {
                        let trimmed = item.trim();
                        if (trimmed) $("#view-all-requirement").append(`<li>${trimmed.charAt(0).toUpperCase() + trimmed.slice(1)}</li>`);
                    });
                }

                $("#view-all-skills").empty();
                if (Array.isArray(job.keySkills)) {
                    job.keySkills.forEach(skill => $("#view-all-skills").append(`<li>${skill}</li>`));
                }

                showPage("view-job");
            },
            error: function(xhr) {
                console.error("Failed to fetch job details", xhr);
                Swal.fire("Error", "Could not load job details.", "error");
            }
        });
    }

    $(".job-table-body").on("click", ".btn-view", function () {
        loadJobDetails($(this).data("job-id"));
    });

    $(".job-table-body").on("click", ".btn-edit", function () {
        const jobId = $(this).data("job-id");
        if (!token) return Swal.fire("Error", "Not logged in.", "error");

        $.ajax({
            url: `http://localhost:8080/api/jobs/${jobId}`,
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` },
            success: function(job) {
                $("#jobTitle-update1").text("Edit Job: " + job.title);
                $("#jobTitle-update2").val(job.title);
                $("#jobDepartment-update").val(job.department);
                $("#jobType-update").val(job.employmentType);
                $("#jobLocation-update").val(job.location);
                $("#jobDescription-update").val(job.description);
                $("#jobDeadline-update").val(new Date(job.applicationDeadline).toISOString().split("T")[0]);
                $("#jobSalary-update").val(job.salaryRange);
                $("#requirements-update").val(job.requirements);
                $("#jobExperience").val(job.requiredExperience);
                $("#jobLogo-preview").attr("src", job.companyLogo || "/default-logo.png");
                $("#gender-update").val(job.gender);
                $("#keySkills-update").val(job.keySkills ? job.keySkills.join(", ") : "");
                $("#updateJobBtn").data("job-id", job.id);
                status: "Pending"
                showPage("edit-job");
            },
            error: () => Swal.fire("Error", "Failed to load job data.", "error")
        });
    });

    $("#updateJobBtn").on("click", function (e) {
        e.preventDefault();
        const jobId = $(this).data("job-id");
        const token = localStorage.getItem("token");

        const jobData = {
            title: $("#jobTitle-update2").val().trim(),
            department: $("#jobDepartment-update").val(),
            employmentType: $("#jobType-update").val(),
            location: $("#jobLocation-update").val().trim(),
            requiredExperience: $("#jobExperience").val(),
            salaryRange: $("#jobSalary-update").val().trim(),
            applicationDeadline: $("#jobDeadline-update").val(),
            requirements: $("#requirements-update").val().trim(),
            keySkills: $("#keySkills-update").val() ? $("#keySkills-update").val().split(",").map(s => s.trim()) : [],
            gender: $("#gender-update").val() || "Any",
            status: "Pending" // optional: force status
        };

        const logoFile = $("#jobLogo-update")[0].files[0];

        function convertToPng(file) {
            return new Promise((resolve, reject) => {
                if (!file) return resolve(null);

                const img = new Image();
                const reader = new FileReader();
                reader.onload = e => img.src = e.target.result;

                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);
                    canvas.toBlob(blob => {
                        resolve(new File([blob], file.name.replace(/\.\w+$/, ".png"), { type: "image/png" }));
                    }, "image/png");
                };
                img.onerror = reject;
                reader.readAsDataURL(file);
            });
        }

        convertToPng(logoFile).then(pngFile => {
            const formData = new FormData();
            formData.append("job", new Blob([JSON.stringify(jobData)], { type: "application/json" }));
            if (pngFile) formData.append("logo", pngFile);

            $.ajax({
                url: `http://localhost:8080/api/jobs/${jobId}`,
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` },
                processData: false,
                contentType: false,
                data: formData,
                success: () => Swal.fire("Success", "Job updated successfully!", "success"),
                error: xhr => Swal.fire("Error", "Failed to update job: " + (xhr.responseJSON?.message || xhr.statusText), "error")
            });
        }).catch(err => {
            Swal.fire({
                icon: "error",
                title: "File Error",
                text: "Failed to process the logo image."
            });
        });
    });

    $(".settings-tab").on("click", function () {
        const tab = $(this).data("tab");
        $(".settings-tab").removeClass("active");
        $(this).addClass("active");
        $(".settings-content").removeClass("active");
        $(`#${tab}-settings`).addClass("active");
    });

    function setupPasswordToggle(inputId, toggleId) {
        $(`#${toggleId}`).on("click", function () {
            const $input = $(`#${inputId}`);
            const type = $input.attr("type") === "password" ? "text" : "password";
            $input.attr("type", type);
            $(this).toggleClass("fa-eye fa-eye-slash");
        });
    }
    setupPasswordToggle("currentPassword", "toggleCurrentPassword");
    setupPasswordToggle("newPassword", "toggleNewPassword");
    setupPasswordToggle("confirmPassword", "toggleConfirmPassword");

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
            companyDescription: safeVal("#companyDescription")
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

    $logoutLink.on("click", function(e){
        e.preventDefault();
        $confirmationModal.show();
    });

    $("#modal-cancel").on("click", () => $confirmationModal.hide());
    $("#modal-confirm").on("click", function(){
        localStorage.clear();
        window.location.href = "../index.html";
    });
    $confirmationModal.on("click", function(e){ if(e.target===this) $(this).hide(); });

    $("#createJobBtn").on("click", function () {
        $("#create-job-form").toggle();
        $("#job-post-table").hide();
    });
    $("#cancelCreateJob").on("click", () => {
        $("#create-job-form").hide();
        $("#job-post-table").show();
    });


    $("#publishJobBtn").on("click", function () {
        const token = localStorage.getItem("token");
        if (!token) return Swal.fire({
            icon: "error",
            title: "Error",
            text: "You are not logged in."
        });

        const title = $("#jobTitle").val().trim();
        const department = $("#jobDepartment").val();
        const type = $("#jobType").val();
        const location = $("#jobLocation").val().trim();
        const description = $("#jobDescription").val().trim();
        const deadline = $("#jobDeadline").val();
        const salaryRange = $("#jobSalary").val().trim().replace(/\s|LKR/g, "");
        const requirements = $("#requirements").val().trim();
        const gender = $("#gender").val();
        const requiredExperience = $("#experience").val().trim();
        const requiredEducation = $("#qualification").val();
        const keySkillsInput = $("#keySkills").val().trim();
        const keySkills = keySkillsInput ? keySkillsInput.split(',').map(s => s.trim()) : [];

        const logoFile = $("#jobLogo")[0].files[0];
        const today = new Date().toISOString().split("T")[0];

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
            status: "Pending",
            companyEmail: localStorage.getItem("userEmail"),
            companyName: localStorage.getItem("companyName"),
            companyPhone: localStorage.getItem("phoneNumber")
        };

        function convertToPng(file) {
            return new Promise((resolve, reject) => {
                if (!file) return resolve(null);

                const img = new Image();
                const reader = new FileReader();

                reader.onload = e => img.src = e.target.result;

                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);
                    canvas.toBlob(blob => {
                        resolve(new File([blob], file.name.replace(/\.\w+$/, ".png"), {type: "image/png"}));
                    }, "image/png");
                };

                img.onerror = reject;
                reader.readAsDataURL(file);
            });
        }

        convertToPng(logoFile).then(pngFile => {
            const formData = new FormData();
            formData.append("job", new Blob([JSON.stringify(jobData)], {type: "application/json"}));
            if (pngFile) formData.append("logo", pngFile);

            $.ajax({
                url: "http://localhost:8080/api/jobs/create",
                method: "POST",
                headers: {"Authorization": `Bearer ${token}`},
                processData: false,
                contentType: false,
                data: formData,
                success: function (response) {
                    Swal.fire({
                        icon: "success",
                        title: "Job Posted!",
                        text: "Your job post has been successfully published."
                    });
                    $("#create-job-form").hide();
                    $("#job-post-table").show();
                },
                error: function (xhr) {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: xhr.responseJSON?.message || xhr.responseText || "Something went wrong."
                    });
                }
            });
        }).catch(err => {
            Swal.fire({
                icon: "error",
                title: "File Error",
                text: "Failed to process the logo image."
            });
        });
    });

    $("#toggleFilterBtn").on('click', function(e){
        e.preventDefault();
        $("#filter-options").toggle();
    });

    $("#profile-view").on('click', function(e){
        e.preventDefault();
        $("#view-applicant-page").show();
    });


    function loadApplicants(employeeId) {
        const token = localStorage.getItem("token");
        if (!token || !employeeId) return Swal.fire("Error", "Not logged in", "error");

        $.ajax({
            url: `http://localhost:8080/api/applications/employee/${employeeId}`,
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` },
            success: function(applicants) {
                if (applicants.length > 0) {
                    localStorage.setItem("applicationId", applicants[0].id);
                    console.log("Saved Application ID:", localStorage.getItem("applicationId"));
                }

                const applicationId = localStorage.getItem("applicationId");
                console.log("Saved Application ID:", applicationId);

                const tbody = $("#applicants-table-body");
                tbody.empty();

                applicants.forEach(app => {
                    const appliedDate = new Date(app.appliedAt).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric'
                    });

                    const statusMap = {
                        "SUBMITTED": { class: "reviewing", label: "New" },
                        "REVIEWING": { class: "pending", label: "Reviewing" },
                        "INTERVIEW": { class: "active", label: "Interview" },
                        "REJECTED": { class: "closed", label: "Rejected" }
                    };
                    const statusInfo = statusMap[app.status] || { class: "pending", label: app.status };

                    const row = `
                        <tr>
                            <td>
                                <div class="job-title">${app.jobSeeker.firstName} ${app.jobSeeker.lastName}</div>
                                <div class="job-company">${app.jobSeeker.email}</div>
                            </td>
                            <td>${app.jobPost.title}</td>
                            <td><span class="status-badge status-${statusInfo.class}">${statusInfo.label}</span></td>
                            <td>${appliedDate}</td>
                            <td>
                                <button class="action-btn btn-view btn-view-applicant" data-applicant-id="${app.id}">View</button>
                                <button class="action-btn btn-edit">Contact</button>
                            </td>
                        </tr>
                        `;

                    tbody.append(row);
                });

            },
            error: function() {
                Swal.fire("Error", "Failed to load applicants.", "error");
            }
        });
    }

    $("#applicants-table-body").on("click", ".btn-view-applicant", function () {
        const applicationId = $(this).data("applicant-id");
        if (!applicationId) return Swal.fire("Error", "Applicant ID missing", "error");

        loadApplicantDetails(applicationId);
    });

    function loadApplicantDetails(applicationId) {
        const token = localStorage.getItem("token");

        $.ajax({
            url: `http://localhost:8080/api/applications/${applicationId}`,
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` },
            success: function(app) {
                console.log("Applicant Data:", app);
                $("#view-applicant-name").text(app.firstName + " " + app.lastName);
                $("#applicant-profile-image").attr("src", app.profileImage || "default.jpg");
                $("#view-applicant-email").text(app.email);
                $("#view-applicant-phone").text(app.phoneNumber || "N/A");
                $("#view-applicant-status").text(app.status);
                $("#view-applicant-date").text(new Date(app.appliedAt).toLocaleDateString('en-GB'));
                $("#view-applicant-status-text").text(app.status);
                $(".detail-subtitle").text(`${app.professionTitle || "N/A"} • Applied for ${app.jobTitle}`);
                $("#view-applicant-address").text(app.address);

                const job = {
                    keySkills: app.jobSkills || [],
                    requiredExperience: app.jobExperience,
                    requiredEducation: app.jobEducation
                };
                const matchScore = calculateMatch(job, app);
                $("#view-applicant-matching-score").text(matchScore + "%");

                $("#view-applicant-about").text(app.about);

                const $skillsContainer = $("#view-applicant-skills");
                $skillsContainer.empty();

                app.skills.forEach(skill => {
                    $skillsContainer.append(`<span class="skill-tag">${skill}</span>`);
                });

                $("#view-applicant-resume")
                    .attr("data-url", app.resumeUrl)
                    .off("click")
                    .on("click", function() {
                        const url = $(this).data("url");
                        if (url) window.open(url, "_blank");
                        else Swal.fire("Error", "Resume not available.", "error");
                    });

                $("#applicant-status-select").val(app.status);

                showPage("view-applicant");
            },
            error: function() {
                Swal.fire("Error", "Failed to load applicant details.", "error");
            }
        });
    }

    function calculateMatch(job, seeker) {
        let score = 0;
        const jobSkills = job.keySkills || [];
        const seekerSkills = seeker.skills || [];
        const matchedSkills = jobSkills.filter(skill => seekerSkills.includes(skill));
        const skillScore = jobSkills.length ? (matchedSkills.length / jobSkills.length) * 50 : 0;
        score += skillScore;
        const jobExp = parseInt(job.requiredExperience) || 0;
        const seekerExp = parseInt(seeker.experience) || 0;
        const expScore = seekerExp >= jobExp ? 30 : (seekerExp / jobExp) * 30;
        score += expScore;
        const educationScore = seeker.education === job.requiredEducation ? 20 : 0;
        score += educationScore;
        return Math.round(score);
    }


    function loadApplicantReview(applicationId) {
        const token = localStorage.getItem("token");

        $.ajax({
            url: `http://localhost:8080/api/reviews/application/${applicationId}`,
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` },
            success: function(reviews) {
                const employeeId = localStorage.getItem("employeeId");
                const myReview = reviews.find(r => r.reviewer.id == employeeId);

                if (myReview) {
                    $("#applicant-status-select").val(myReview.jobApplication.status);
                    $("#applicant-rating").val(myReview.rating);
                    $("#applicant-notes").val(myReview.internalNotes);
                }
            },
            error: function() {
                console.error("Failed to load applicant review.");
            }
        });
    }

    $("#save-applicant-review").on("click", function() {
        const applicationId = localStorage.getItem("applicationId");
        const employeeId = localStorage.getItem("employeeId");
        const rating = parseInt($("#applicant-rating").val());
        const notes = $("#applicant-notes").val().trim();
        const status = $("#applicant-status-select").val();
        const token = localStorage.getItem("token");

        if (!applicationId || !employeeId)
            return Swal.fire("Error", "Missing IDs.", "error");

        $.ajax({
            url: `http://localhost:8080/api/reviews/save?status=${encodeURIComponent(status)}`,
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            contentType: "application/json",
            data: JSON.stringify({
                applicationId: applicationId,
                employeeId: employeeId,
                rating: rating,
                notes: notes
            }),
            success: function(response) {
                Swal.fire("Success", "Review saved successfully!", "success");

                $("#view-applicant-status").text(status);
            },
            error: function() {
                Swal.fire("Error", "Failed to save review.", "error");
            }
        });
    });

    loadRecentApplicants();

    function loadRecentApplicants() {
        const token = localStorage.getItem("token");
        const employeeId = localStorage.getItem("employeeId");

        console.log(employeeId)
        if (!employeeId) {
            return Swal.fire("Error", "Employee ID missing. Please log in again.", "error");
        }

        $.ajax({
            url: `http://localhost:8080/api/applications/recent?employeeId=${employeeId}`,
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` },
            success: function(applicants) {
                const $grid = $(".applicants-grid");
                $grid.empty();

                if (!applicants.length) {
                    $grid.append("<p>No recent applicants found.</p>");
                    return;
                }

                applicants.forEach(app => {
                    console.log(app)
                    const rating = "N/A";
                    const appliedCount = 1;
                    const matchScore = "N/A";

                    const card = `
                        <div class="applicant-card">
                            <div class="applicant-header">
                                <img src="${app.profileImage}" alt="Applicant" class="applicant-img">
                                <div class="applicant-info">
                                    <h4>${app.jobSeekerName}</h4>
                                    <p>${app.jobTitle}</p>
                                </div>
                            </div>
                            <div class="applicant-details">
                                <div class="detail-item">
                                    <div class="detail-value">4.4</div>
                                    <div class="detail-label">Rating</div>
                                </div>
                                <div class="detail-item">
                                    <div class="detail-value">1</div>
                                    <div class="detail-label">Applied</div>
                                </div>
                                <div class="detail-item">
                                    <div class="detail-value">70%</div>
                                    <div class="detail-label">Match</div>
                                </div>
                            </div>
                            <div class="applicant-actions">
                                <button class="action-btn btn-view" data-applicant-id="${app.id}">View Profile</button>
                                <a href="${app.resumeUrl}" target="_blank" class="action-btn btn-edit">View Resume</a>
                            </div>
                        </div>
                        `;

                    $grid.append(card);
                });

                $(".btn-view").off("click").on("click", function() {
                    const applicationId = $(this).data("applicant-id");
                    loadApplicantDetails(applicationId);
                });
            },
            error: function() {
                Swal.fire("Error", "Failed to load recent applicants.", "error");
            }
        });
    }





});
