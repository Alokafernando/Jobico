$(document).ready(function () {
    // -----------------------------
    // Cached jQuery selectors
    // -----------------------------
    const savedProfileImage = localStorage.getItem("profileImage");
    if(savedProfileImage) {
        $("#avatar-preview").attr("src", savedProfileImage);
        $("#header-avatar").attr("src", savedProfileImage);
        $("#sidebar-avatar").attr("src", savedProfileImage);
        $("#profile-avatar").attr("src", savedProfileImage);
    }

    const $pageSections = $(".page-section");
    const $menuLinks = $(".menu-link");
    const $profileImg = $(".profile-img");
    const $logoutLink = $("#logout-link");
    const $editModals = $(".edit-modal");
    const $profilePictureModal = $("#edit-profile-picture-modal");
    const $confirmationModal = $("#confirmation-modal");

    const $welcomeUser = $("#welcomeUser");
    const $profileName = $("#profileName");
    const $professionTitle = $("#professionTitle");
    const $profileProfessionTitle = $("#profile-professionTitle");
    const $profileFullName = $("#profile-name");
    const $profileEmail = $("#profile-email");
    const $profileNumber = $("#profile-phone");
    const $profileAddress = $("#profile-address");
    const $profileJobType = $("#profile-type");
    const $profileExperience = $("#profile-experience");
    const $profileEducation = $("#profile-education");
    const $skills = $("#profile-skills");

    const $editProfileName = $("#edit-profile-name");
    const $editProfessionTitle = $("#edit-profession-title");
    const $editEmail = $("#email");
    const $editPhone = $("#phone");
    const $editLocation = $("#location");
    const $editJobType = $("#jobType");
    const $editExperience = $("#experience");
    const $editEducation = $("#seekerEducation");
    const $editSkills = $("#skills-input");
    const $editAbout = $("#about-text");

    const token = localStorage.getItem("token");

    // -----------------------------
    // Page Navigation
    // -----------------------------
    function showPage(pageId) {
        $pageSections.removeClass("active");
        $("#" + pageId).addClass("active");
        $menuLinks.removeClass("active").filter(`[data-page='${pageId}']`).addClass("active");
        history.pushState({ page: pageId }, "", `#${pageId}`);
        $(window).scrollTop(0);
    }

    $menuLinks.on("click", function (e) {
        e.preventDefault();
        const pageId = $(this).data("page");
        if (pageId) showPage(pageId);
    });

    $profileImg.on("click", () => showPage("profile"));
    $("button[data-page]").on("click", function () { showPage($(this).data("page")); });

    $(window).on("popstate", function (e) {
        if (e.originalEvent.state && e.originalEvent.state.page) showPage(e.originalEvent.state.page);
        else showPage("dashboard");
    });

    if (window.location.hash) showPage(window.location.hash.substring(1));
    else showPage("dashboard");

    // -----------------------------
    // Load User Details from server
    // -----------------------------
    function setUserDetails(user) {

        const profileImgUrl = user.profileImage || "../assets/profiles/default-avatar.jpg";
        $("#avatar-preview").attr("src", profileImgUrl);
        $("#header-avatar").attr("src", profileImgUrl);
        $("#sidebar-avatar").attr("src", profileImgUrl);
        $("#profile-avatar").attr("src", profileImgUrl);

        localStorage.setItem("profileImage", profileImgUrl);

        const firstName = user.firstName || "";
        const lastName = user.lastName || "";
        const profession = user.professionTitle || "";
        const email = user.email || "";
        const phoneNumber = user.phoneNumber || "";
        const address = user.address || "";
        const jobType = user.jobType || "";
        const experience = user.experience || "";
        const education = user.education || "";
        const skills = user.skills || [];
        const about = user.about || "";

        $welcomeUser.text(firstName ? `Welcome back, ${firstName}!` : "Welcome back!");
        $profileName.text(`${firstName} ${lastName}`);
        $professionTitle.text(profession);
        $profileProfessionTitle.text(profession);
        $profileFullName.text(`${firstName} ${lastName}`);
        $profileEmail.text(email);
        $profileNumber.text(phoneNumber);
        $profileAddress.text(address);
        $profileJobType.text(jobType);
        $profileExperience.text(experience);
        $profileEducation.text(education);
        $(".about-content").html(`<p>${about.replace(/\n/g, "</p><p>")}</p>`);

        $skills.empty();
        skills.forEach(skill => $skills.append(`<span class="skill-tag">${skill}</span>`));

        $editProfileName.val(`${firstName} ${lastName}`);
        $editProfessionTitle.val(profession);
        $editEmail.val(email);
        $editPhone.val(phoneNumber);
        $editLocation.val(address);
        $editJobType.val(jobType);
        $editExperience.val(experience);
        $editEducation.val(education);
        $editSkills.val(skills.join(", "));
        $editAbout.val(about);

        localStorage.setItem("userEmail", email);

        if (profession) {
            loadJobsForSeeker(profession);
            loadRecommendedJobsForSeeker(profession)
        }
    }

    function loadUserDetails() {
        if (!token) {
            window.location.href = "../index.html";
            return;
        }
        const email = localStorage.getItem("userEmail");
        if (!email) return console.error("No userEmail found in localStorage");

        $.ajax({
            url: `http://localhost:8080/api/jobseekers/email/${encodeURIComponent(email)}`,
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` },
            success: setUserDetails,
            error: function(xhr) {
                console.error("Failed to load profile by email", xhr);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Unable to load profile. Please refresh or contact support.',
                    confirmButtonText: 'OK'
                });
            }
        });
    }

    loadUserDetails();

    // -----------------------------
    // Helper to get input values
    // -----------------------------
    function getVal(selector) {
        const el = $(selector);
        return el.length ? (el.val() || "").trim() : null;
    }

    // -----------------------------
    // Save Changes for all modals
    // -----------------------------
    $(".modal-btn-save").on("click", function () {
        const $modal = $(this).closest(".edit-modal");
        const editType = $modal.attr("id")?.replace("edit-", "").replace("-modal", "");
        if (!editType) return;

        const updates = {};

        if (editType === "profile") {
            const fullName = (getVal("#edit-profile-name") || "").split(" ");
            updates.firstName = fullName[0] || "";
            updates.lastName = fullName.slice(1).join(" ") || "";
            const profession = getVal("#edit-profession-title");
            if (profession) updates.professionTitle = profession;
        }

        if (editType === "details") {
            const emailVal = getVal("#email"); if (emailVal) updates.email = emailVal;
            const phone = getVal("#phone"); if (phone) updates.phoneNumber = phone;
            const location = getVal("#location"); if (location) updates.address = location;
            const jobType = getVal("#jobType"); if (jobType) updates.jobType = jobType;
            const experience = getVal("#experience"); if (experience) updates.experience = experience;
            const education = getVal("#seekerEducation"); if (education) updates.education = education;
        }

        if (editType === "skills") {
            const skills = getVal("#skills-input");
            if (skills) updates.skills = skills.split(",").map(s => s.trim());
        }

        if (editType === "about") {
            const about = getVal("#about-text");
            if (about) updates.about = about;
        }

        const email = localStorage.getItem("userEmail");
        if (!email) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No user email found!',
                confirmButtonText: 'OK'
            });
            return;
        }

        if (Object.keys(updates).length === 0) return;

        $.ajax({
            url: `http://localhost:8080/api/jobseekers/update/${encodeURIComponent(email)}`,
            method: "PUT",
            headers: { "Authorization": `Bearer ${token}` },
            contentType: "application/json",
            data: JSON.stringify(updates),
            success: function(response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Profile picture updated!',
                    confirmButtonText: 'OK',
                    customClass: {
                        popup: 'swal-popup-front'
                    }
                }).then(() => {
                    // $profilePictureModal.hide();hide

                    if (response.profileImage) {
                        $("#avatar-preview, #header-avatar, #sidebar-avatar, #profile-avatar")
                            .attr("src", response.profileImage);
                        localStorage.setItem("profileImage", response.profileImage);
                    }

                    $("#file-upload").val('');
                });

            },
            error: function(xhr) {
                console.error("Failed to update profile", xhr);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to update profile.',
                    confirmButtonText: 'OK'
                });
            }
        });
    });

    // -----------------------------
    // Open/Close Modals
    // -----------------------------
    function closeModals() {
        $editModals.hide();
        $profilePictureModal.hide();
        $confirmationModal.hide();

        const savedImage = localStorage.getItem("profileImage") || "../assets/profiles/default-avatar.jpg";
        $("#avatar-preview").attr("src", savedImage);

        $("#file-upload").val('');
    }

    // Edit Profile button click
    $("#edit-profile-btn").on("click", function() {
        $("#edit-profile-modal").css({
            "display": "flex",  // modal eka pennanna
            "z-index": 1000      // front layer ekata
        });
    });

// Close modal on clicking close button or cancel
    $("#edit-profile-modal .edit-modal-close, #edit-profile-modal .modal-btn-cancel").on("click", function() {
        $("#edit-profile-modal").hide();
    });

// Close modal on clicking outside the content
    $("#edit-profile-modal").on("click", function(e) {
        if ($(e.target).is("#edit-profile-modal")) {
            $(this).hide();
        }
    });


    $(".edit-modal-close, .modal-btn-cancel").on("click", closeModals);

    $editModals.on("click", function (e) {
        if (e.target === this) closeModals();
    });


    // -----------------------------
    // Logout
    // -----------------------------
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

    // -----------------------------
    // Profile Picture Upload
    // -----------------------------
    $("#open-profile-picture-modal").on("click", () => $profilePictureModal.show());
    $profilePictureModal.find(".edit-modal-close, .modal-btn-cancel").on("click", () => $profilePictureModal.hide());

    $("#file-upload").on("change", function() {
        const file = this.files[0];
        if(file){
            const reader = new FileReader();
            reader.onload = e => $("#avatar-preview").attr("src", e.target.result);
            reader.readAsDataURL(file);
        }
    });


    $("#save-profile-picture").on("click", function() {
        const file = $("#file-upload")[0].files[0];
        if (!file) {
            Swal.fire({ icon: 'warning', title: 'No File Selected', text: 'Please select a file.' });
            return;
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/bmp"];
        if (!allowedTypes.includes(file.type)) {
            Swal.fire({ icon: 'error', title: 'Invalid File Type', text: 'Unsupported file format. Use PNG, JPG, or GIF.' });
            return;
        }

        const email = localStorage.getItem("userEmail");
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("file", file);
        formData.append("email", email);

        $.ajax({
            url: "http://localhost:8080/api/jobseekers/profile-picture",
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            processData: false,
            contentType: false,
            data: formData,
            success: function(response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Profile picture updated!'
                }).then(() => {
                    $profilePictureModal.hide();
                    $("#file-upload").val('');

                });
            },
            error: function(xhr){
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: xhr.responseJSON?.message || 'Failed to upload picture. Try another image.'
                });
            }
        });
    });



    // -----------------------------
    // Change Password Modal
    // -----------------------------
    $("#change-password-btn").on("click", function(){
        $("#edit-password-modal").css("display", "flex");
    });

    $("#edit-password-modal .edit-modal-close, #edit-password-modal .modal-btn-cancel").on("click", function(){
        $("#edit-password-modal").hide();
        clearPasswordFields();
    });

    $("#edit-password-modal").on("click", function(e){
        if(e.target === this) {
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
            showAlert('warning', 'Incomplete Form', 'Please fill in all fields.');
            $("#edit-password-modal").css("z-index", 9);
            return;
        }

        if (newPassword.length < 6) {
            showAlert('error', 'Password Too Short', 'New password must be at least 6 characters long.');
            $("#edit-password-modal").css("z-index", 9);

            return;
        }

        if (newPassword !== confirmPassword) {
            showAlert('error', 'Password Mismatch', 'New password and confirm password do not match.');
            $("#edit-password-modal").css("z-index", 9);
            return;
        }

        const email = localStorage.getItem("userEmail");
        if (!email) {
            showAlert('warning', 'Email Not Found', 'User email not found. Please login again.');
            $("#edit-password-modal").css("z-index", 9);
            return;
        }

        $.ajax({
            url: "http://localhost:8080/api/jobseekers/change-password",
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            contentType: "application/json",
            data: JSON.stringify({
                email: email,
                currentPassword: currentPassword,
                newPassword: newPassword
            }),
            success: function () {
                showAlert('success', 'Success', 'Password changed successfully!');
                $("#edit-password-modal").hide();
                clearPasswordFields();
            },
            error: function (xhr) {
                const message = xhr.responseJSON?.message || "Failed to change password";
                showAlert('error', 'Error', message);
            }
        });

        function clearPasswordFields() {
            $("#current-password").val('');
            $("#new-password").val('');
            $("#confirm-password").val('');
        }

        function showAlert(icon, title, text) {
            Swal.fire({
                icon: icon,
                title: title,
                text: text,
                confirmButtonText: 'OK',
                customClass: { popup: 'swal-popup-front' }
            });
            $("#edit-password-modal").css("z-index", 9);
        }
    });

    let seekerPage = 0; // current page for seeker jobs
    const seekerPageSize = 6;

    function loadJobsForSeeker(title, jobType, experience, salary, page = 0) {
        const token = localStorage.getItem("token");
        if (!token) return;

        const requestData = {
            title: title || "",
            jobType: jobType || "",
            experience: experience || "",
            salary: salary || "",
            page: page,
            size: seekerPageSize
        };

        // 1️⃣ Load paginated jobs
        $.ajax({
            url: "http://localhost:8080/api/jobs/for-seeker",
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` },
            data: requestData,
            success: function (response) {
                const jobs = response.content; // page content
                const seekerPage = response.number; // current page index
                const totalPages = response.totalPages;

                const $grid = $(".jobs-grid");
                $grid.empty();

                if (!jobs || jobs.length === 0) {
                    $grid.append("<p>No jobs found for your profession.</p>");
                } else {
                    jobs.forEach(job => {
                        const jobCard = `
                    <div class="job-card ${job.featured ? 'featured' : ''}">
                      ${job.featured ? '<span class="featured-badge">Featured</span>' : ''}
                      <div class="job-header">
                        <div class="company-logo">
                           ${job.companyLogo ? `<img src="${job.companyLogo}" alt="Company Logo" class="company-logo-img">` : "NA"}
                        </div>
                        <div class="job-info">
                          <h3>${job.title}</h3>
                          <p>${job.companyName}</p>
                        </div>
                      </div>
                      <div class="job-details">
                        <div class="detail-item">
                          <i class="fas fa-map-marker-alt"></i>
                          <span>${job.location || "Not specified"}</span>
                        </div>
                        <div class="detail-item">
                          <i class="fas fa-clock"></i>
                          <span>${job.employmentType || "N/A"}</span>
                        </div>
                      </div>
                      <div class="job-footer">
                        <div class="job-salary">${job.salaryRange || "Negotiable"}</div>
                        <button class="apply-btn" data-job-id="${job.id}">Apply Now</button>
                      </div>
                    </div>`;
                        $grid.append(jobCard);
                    });
                }

                // Pagination buttons
                const $pagination = $(".jobs-grid-pagination");
                $pagination.empty();
                if (seekerPage > 0) {
                    $pagination.append(`<button id="prevPage">Previous</button>`);
                }
                if (seekerPage < totalPages - 1) {
                    $pagination.append(`<button id="nextPage">Next</button>`);
                }

                $("#prevPage").click(() => loadJobsForSeeker(title, jobType, experience, salary, seekerPage - 1));
                $("#nextPage").click(() => loadJobsForSeeker(title, jobType, experience, salary, seekerPage + 1));
            },
            error: function () {
                Swal.fire("Error", "Failed to load seeker jobs.", "error");
            }
        });

        // 2️⃣ Load total count
        $.ajax({
            url: "http://localhost:8080/api/jobs/for-seeker/count",
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` },
            data: {
                title: title || "",
                jobType: jobType || "",
                experience: experience || "",
                salary: salary || "",
            },
            success: function(count) {
                $("#jobs-count").text(`${count} jobs found`);
            },
            error: function() {
                $("#jobs-count").text(`0 jobs found`);
            }
        });
    }



// === Recommended jobs ===
    let recommendPage = 0;
    const recommendPageSize = 6;

    function loadRecommendedJobsForSeeker(professionTitle, page = 0) {
        const token = localStorage.getItem("token");
        if (!token) return;

        $.ajax({
            url: "http://localhost:8080/api/jobs/recommended",
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` },
            data: {
                title: professionTitle || "",
                page: page,
                size: recommendPageSize
            },
            success: function (response) {
                const jobs = response.content;
                recommendPage = response.number;
                const totalPages = response.totalPages;

                const $grid = $(".jobs-recommend-grid");
                $grid.empty();

                if (!jobs || jobs.length === 0) {
                    $grid.append("<p>No recommended jobs found.</p>");
                } else {
                    jobs.forEach(job => {
                        const jobCard = `
                        <div class="job-card ${job.featured ? 'featured' : ''}">
                            ${job.featured ? '<span class="featured-badge">Featured</span>' : ''}
                            <div class="job-header">
                                <div class="company-logo">
                                    ${job.companyLogo ? `<img src="${job.companyLogo}" alt="Company Logo" class="company-logo-img">` : "NA"}
                                </div>
                                <div class="job-info">
                                    <h3>${job.title}</h3>
                                    <p>${job.companyName}</p>
                                </div>
                            </div>
                            <div class="job-details">
                                <div class="detail-item">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <span>${job.location || "Not specified"}</span>
                                </div>
                                <div class="detail-item">
                                    <i class="fas fa-clock"></i>
                                    <span>${job.employmentType || "N/A"}</span>
                                </div>
                            </div>
                            <div class="job-footer">
                                <div class="job-salary">${job.salaryRange || "Negotiable"}</div>
                                <button class="apply-btn" data-job-id="${job.id}">Apply Now</button>
                            </div>
                        </div>`;
                        $grid.append(jobCard);
                    });
                }

                // Pagination
                const $pagination = $(".jobs-recommend-pagination");
                $pagination.empty();
                if (recommendPage > 0) $pagination.append(`<button id="prevRecommend">Previous</button>`);
                if (recommendPage < totalPages - 1) $pagination.append(`<button id="nextRecommend">Next</button>`);

                $("#prevRecommend").click(() => loadRecommendedJobsForSeeker(professionTitle, recommendPage - 1));
                $("#nextRecommend").click(() => loadRecommendedJobsForSeeker(professionTitle, recommendPage + 1));
            },
            error: function() {
                Swal.fire("Error", "Failed to load recommended jobs.", "error");
            }
        });
    }



    $("#jobType-filter, #experienceLevel, #salaryRange").on("change", function () {
        const title = $("#professionTitle").text() || "";
        const jobType = $("#jobType-filter").val();
        const experience = $("#experienceLevel").val();
        const salary = $("#salaryRange").val();

        loadJobsForSeeker(title, jobType, experience, salary);
    });


    // ---------- Show Job Details ----------
    function showJobDetails(job) {
        // Job Info
        $("#modalJobTitle").text(job.title || "N/A");
        $("#modalJobTitle").data("job-id", job.id);
        $("#modalJobType").text(job.employmentType || "N/A");
        $("#modalCompany").text(job.companyName || "N/A");

        // Meta Info
        $("#modalLocation").text(job.location || "N/A");
        $("#modalPostDate").text(job.postedAt || "N/A");
        $("#modalApplicants").text(job.applicants || 0);

        // Company Logo
        $("#modalCompanyLogo").attr("src", job.companyLogo && job.companyLogo.trim() !== ""
            ? job.companyLogo
            : "images/default-logo.png"
        );
        $("#modalCompanyName").text(job.companyName || "N/A");

        // Key Skills
        $("#modalKeySkills").empty();
        let skills = Array.isArray(job.keySkills)
            ? job.keySkills
            : (typeof job.keySkills === "string" ? job.keySkills.split(",").map(s => s.trim()) : []);
        skills.forEach(skill => $("#modalKeySkills").append(`<span class="skill-tag">${skill}</span>`));

        // Description
        let description = Array.isArray(job.description)
            ? job.description
            : (typeof job.description === "string" ? [job.description] : []);
        $("#modalDescription").html(description.map(p => `<p>${p}</p>`).join(""));

        // Requirements
        let requirements = Array.isArray(job.requirements)
            ? job.requirements
            : (typeof job.requirements === "string" ? job.requirements.split(",").map(r => r.trim()) : []);
        $("#modalRequirements").empty();
        requirements.forEach(req => $("#modalRequirements").append(`<li>${req}</li>`));

        // Job Overview
        $("#modalSalary").text(job.salaryRange || "N/A");
        $("#modalGender").text(job.gender || "Any");
        $("#modalIndustry").text(job.postedBy?.industry || "N/A");
        $("#modalExperience").text(job.requiredExperience || "N/A");
        $("#modalQualification").text(job.requiredEducation || "N/A");

        // Show Modal
        $("#descriptionModal").fadeIn();
    }

    // -----------------------------
// Open Edit Modals (About, Details, Skills)
// -----------------------------
    $(document).on("click", ".edit-btn", function() {
        const section = $(this).data("edit");

        let modalId = null;
        if (section === "about") modalId = "#edit-about-modal";
        if (section === "details") modalId = "#edit-details-modal";
        if (section === "skills") modalId = "#edit-skills-modal";
        if (section === "profile") modalId = "#edit-profile-modal";

        if (modalId) {
            $(modalId).css("display", "flex");
        }
    });


// ---------- Open Job Details Modal ----------
    $(document).on("click", ".apply-btn[data-job-id]", function() {
        const jobId = $(this).data("job-id");

        $.ajax({
            url: `http://localhost:8080/api/jobs/${jobId}`,
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` },
            success: showJobDetails,
            error: function(xhr) {
                console.error(xhr);
                Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load job details.' });
            }
        });
    });

// ---------- Close Modals ----------
    $("#closeDescModal, #closeApplicationModal").click(() => $(".description-background, .application-modal").fadeOut());

// Close by clicking outside
    $(document).on("click", ".description-background, .application-modal", function(e){
        if($(e.target).closest(".description-modal-content, .application-modal-content").length === 0){
            $(this).fadeOut();
        }
    });

// ---------- Open Application Modal ----------
    $("#applyDescriptionButton").click(function() {
        const title = $("#modalJobTitle").text();
        const company = $("#modalCompanyName").text();
        const jobId = $("#modalJobTitle").data("job-id");

        $("#applicationModal .modal-header h2").text(`Apply for Job: ${title}`);
        $("#applicationModal .company-name").text(`at ${company}`);
        $("#applicationModal").data("job-id", jobId);
        $("#applicationModal").fadeIn();
    });

    // ---------- Submit Application ----------
    $(".application-form").submit(function(e) {
        e.preventDefault();

        getJobSeekerId(function(jobSeekerId) {
            const token = localStorage.getItem("token");
            const jobPostId = $("#applicationModal").data("job-id"); //job post id
            console.log(jobPostId)
            const resumeFile = $("#resume-upload")[0].files[0];

            // Validation
            if (!resumeFile) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Please upload your resume.' });
                return;
            }
            if (!jobPostId) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Invalid job selected!' });
                return;
            }

            const formData = new FormData();
            formData.append("jobSeekerId", jobSeekerId);
            formData.append("jobPostId", jobPostId);
            formData.append("resume", resumeFile);

            $.ajax({
                url: "http://localhost:8080/api/applications/apply",
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                data: formData,
                processData: false,
                contentType: false,
                success: function() {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Application submitted!',
                        confirmButtonText: 'OK',
                    }).then(() => {
                        // now hide the modal
                        $("#applicationModal").fadeOut();
                        $(".application-form")[0].reset();
                        $(".file-input-label span").text("Please select a resume...");
                    });

                },
                error: function(xhr) {
                    const msg = xhr.responseJSON?.message || 'Failed to submit application.';
                    Swal.fire({ icon: 'error', title: 'Error', text: msg });
                    console.error(xhr);
                }
            });
        });
    });

// ---------- Helper: Get JobSeeker ID ----------
    function getJobSeekerId(callback) {
        const token = localStorage.getItem("token");
        const email = localStorage.getItem("userEmail");

        if (!token || !email) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'User not logged in!' });
            return;
        }

        $.ajax({
            url: `http://localhost:8080/api/jobseekers/email/${encodeURIComponent(email)}`,
            method: 'GET',
            headers: { "Authorization": `Bearer ${token}` },
            success: function(user) {
                if (!user?.id) {
                    Swal.fire({ icon: 'error', title: 'Error', text: 'Invalid user data returned!' });
                    return;
                }
                callback(user.id);
            },
            error: function() {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to fetch user ID!' });
            }
        });
    }

// ---------- Update file input label ----------
    $("#resume-upload").change(function() {
        const fileName = $(this)[0].files[0]?.name || "Please select a resume...";
        $(this).siblings(".file-input-label").find("span").text(fileName);
    });






});
