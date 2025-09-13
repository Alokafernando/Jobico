$(document).ready(function () {
    // -----------------------------
    // Cached jQuery selectors
    // -----------------------------
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
            success: function(updatedUser) {
                setUserDetails(updatedUser);
                closeModals();
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Profile updated successfully!',
                    confirmButtonText: 'OK'
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
    function closeModals() { $editModals.hide(); $profilePictureModal.hide(); $confirmationModal.hide(); }

    $(".edit-modal-close, .modal-btn-cancel").on("click", closeModals);
    $editModals.on("click", function (e) { if (e.target === this) closeModals(); });

    $("#edit-profile-btn").on("click", () => $("#edit-profile-modal").css("display", "flex"));
    $(".edit-btn").on("click", function () {
        const editType = $(this).data("edit");
        $("#edit-" + editType + "-modal").css("display", "flex");
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
            Swal.fire({
                icon: 'warning',
                title: 'No File Selected',
                text: 'Please select a file to upload.',
                confirmButtonText: 'OK'
            });
            return;
        }

        const email = localStorage.getItem("userEmail");
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
            success: function() {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Profile picture updated!',
                    confirmButtonText: 'OK'
                });
                $profilePictureModal.hide();
            },
            error: function(xhr){
                console.error("Failed to upload picture", xhr);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to upload picture',
                    confirmButtonText: 'OK'
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

    function loadJobsForSeeker(title, jobType, experience, salary) {
        $.ajax({
            url: "http://localhost:8080/api/jobs/for-seeker",
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` },
            data: {
                title: title || "",
                jobType: jobType || "",
                experience: experience || "",
                salary: salary || ""
            },
            success: function (jobs) {
                const $grid = $(".jobs-grid");
                $grid.empty(); // clear old results

                if (!jobs || jobs.length === 0) {
                    $grid.append("<p>No jobs found for your profession.</p>");
                    return;
                }

                jobs.forEach(job => {
                    const jobCard = `
                <div class="job-card ${job.featured ? 'featured' : ''}">
                  ${job.featured ? '<span class="featured-badge">Featured</span>' : ''}
                  <div class="job-header">
                    <div class="company-logo">
                       ${job.companyLogo
                        ? `<img src="${job.companyLogo}" alt="Company Logo" class="company-logo-img">`
                        : "NA"}
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
                </div>
                `;
                    $grid.append(jobCard);
                });
            },
            error: function () {
                Swal.fire("Error", "Failed to load seeker jobs.", "error");
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


    function showJobDetails(job) {
        $(".job-title").text(job.title || "N/A");
        $(".job-type").text(job.employmentType || "N/A");
        $(".company").html(`<i class="fas fa-building"></i>&nbsp;${job.companyName || "N/A"}`);

        $(".job-meta").html(`
        <div class="job-meta-item"><i class="fas fa-map-marker-alt"></i> ${job.location || "N/A"}</div>
        <div class="job-meta-item"><i class="fas fa-calendar-alt"></i> Post Date: ${job.postedAt || "N/A"}</div>
        <div class="job-meta-item"><i class="fas fa-users"></i> ${job.applicants || 0} applicants</div> <!--not completed-->
    `);

        $("#modalKeySkills").empty();
        let skills = Array.isArray(job.keySkills)
            ? job.keySkills
            : (typeof job.keySkills === "string"
                ? job.keySkills.split(",").map(s => s.trim())
                : []);
        skills.forEach(skill => {
            $("#modalKeySkills").append(`<span class="skill-tag">${skill}</span>`);
        });

        let description = Array.isArray(job.description) ? job.description : (typeof job.description === "string" ? [job.description] : []);
        $(".job-description").html(description.map(p => `<p>${p}</p>`).join(""));

        let responsibilities = Array.isArray(job.responsibilities) ? job.responsibilities : (typeof job.responsibilities === "string" ? job.responsibilities.split(",").map(r => r.trim()) : []);
        $(".responsibilities ul").empty();
        responsibilities.forEach(r => {
            $(".responsibilities ul").append(`<li>${r}</li>`);
        });

        let requirements = Array.isArray(job.requirements) ? job.requirements : (typeof job.requirements === "string" ? job.requirements.split(",").map(r => r.trim()) : []);
        $(".requirements-list").empty();
        requirements.forEach(req => {
            $(".requirements-list").append(`<li>${req}</li>`);
        });


        $(".job-overview").html(`
        <h3 class="section-title"><i class="fas fa-info-circle"></i> Job Overview</h3>
        <div class="overview-item"><span class="overview-title">Offered Salary</span><span class="overview-value">${job.salaryRange || "N/A"}</span></div>
        <div class="overview-item"><span class="overview-title">Gender</span><span class="overview-value">${job.gender || "Any"}</span></div>
        <div class="overview-item"><span class="overview-title">Industry</span><span class="overview-value">${job.postedBy?.industry || "N/A"}</span></div>
        <div class="overview-item"><span class="overview-title">Experience</span><span class="overview-value">${job.requiredExperience || "N/A"}</span></div>
        <div class="overview-item"><span class="overview-title">Qualification</span><span class="overview-value">${job.requiredEducation || "N/A"}</span></div>
    `);

        $("#descriptionModal").fadeIn();
    }

    $(document).on("click", ".apply-btn", function () {
        const jobId = $(this).data("job-id");

        $.ajax({
            url: `http://localhost:8080/api/jobs/${jobId}`,
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` },
            success: function(jobData) {
                showJobDetails(jobData);
            },
            error: function(xhr) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load job details.',
                    confirmButtonText: 'OK'
                });
            }
        });
    });

    $("#closeDescModal").on("click", function () {
        $("#descriptionModal").fadeOut();
    });

    $(document).on("click", ".description-background", function (e) {
        if ($(e.target).closest(".application-popup").length === 0) {
            $(".description-background").fadeOut();
        }
    });


});
