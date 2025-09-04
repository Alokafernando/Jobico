// ==============================
// JobSeekerDashboard.js
// Handles job seeker dashboard navigation, profile loading, editing, updating, and logout
// ==============================

$(document).ready(function () {
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
        if (e.originalEvent.state && e.originalEvent.state.page) {
            showPage(e.originalEvent.state.page);
        } else {
            showPage("dashboard");
        }
    });

    if (window.location.hash) showPage(window.location.hash.substring(1));
    else showPage("dashboard");

    // -----------------------------
    // Set User Details in UI
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

        // Fill edit forms
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

        // Save in localStorage
        localStorage.setItem("userEmail", email);
    }

    // -----------------------------
    // Load User Details
    // -----------------------------
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
                alert("Unable to load profile. Please refresh or contact support.");
            }
        });
    }

    loadUserDetails();

    // -----------------------------
    // Edit Profile Save
    // -----------------------------
    $(document).on("click", ".modal-btn-save", function () {
        const $modal = $(this).closest(".edit-modal");
        const editType = $modal.attr("id").replace("edit-", "").replace("-modal", "");

        const updates = {};
        if (editType === "personal") {
            const fullName = $editProfileName.val().split(" ");
            updates.firstName = fullName[0];
            updates.lastName = fullName.slice(1).join(" ");
            updates.email = $editEmail.val();
            updates.phoneNumber = $editPhone.val();
            updates.address = $editLocation.val();
        }
        if (editType === "profession") updates.professionTitle = $editProfessionTitle.val();
        if (editType === "jobType") updates.jobType = $editJobType.val();
        if (editType === "experience") updates.experience = $editExperience.val();
        if (editType === "education") updates.education = $editEducation.val();
        if (editType === "skills") updates.skills = $editSkills.val().split(",").map(s => s.trim());
        if (editType === "about") updates.about = $editAbout.val();

        const email = localStorage.getItem("userEmail");

        if (Object.keys(updates).length > 0) {
            $.ajax({
                url: `http://localhost:8080/api/jobseekers/email/${encodeURIComponent(email)}`,
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` },
                contentType: "application/json",
                data: JSON.stringify(updates),
                success: function(updatedUser) {
                    setUserDetails(updatedUser);
                    closeModals();
                    alert("Profile updated successfully!");
                },
                error: function(xhr) {
                    console.error("Failed to update profile", xhr);
                    alert("Failed to update profile.");
                }
            });
        }
    });

    function closeModals() { $editModals.hide(); }
    $(document).on("click", ".edit-modal-close, .modal-btn-cancel", closeModals);
    $(document).on("click", ".edit-modal", function(e){ if(e.target===this) closeModals(); });

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
        if(!file) return alert("Select a file");

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
                alert("Profile picture updated!");
                $profilePictureModal.hide();
            },
            error: function(xhr){
                console.error("Failed to upload picture", xhr);
                alert("Failed to upload picture");
            }
        });
    });

    // -----------------------------
    // Edit Modals
    // -----------------------------
    $("#edit-profile-btn").on("click", () => $("#edit-profile-modal").css("display", "flex"));

    $(".edit-btn").on("click", function () {
        const editType = $(this).data("edit");
        $("#edit-" + editType + "-modal").css("display", "flex");
    });

    function closeModals() { $editModals.hide(); }
    $(".edit-modal-close, .modal-btn-cancel").on("click", closeModals);

    $(".modal-btn-save").on("click", function () {
        const $modal = $(this).closest(".edit-modal");
        const editType = $modal.attr("id").replace("edit-", "").replace("-modal", "");

        if (editType === "about") {
            const aboutText = $("#about-text").val();
            $(".about-content").html(`<p>${aboutText.replace(/\n/g, "</p><p>")}</p>`);
        } else if (editType === "skills") {
            const skillsArray = $("#skills-input").val().split(",").map(s => s.trim());
            const $skillsList = $(".skills-list").empty();
            skillsArray.forEach(skill => $skillsList.append(`<span class="skill-tag">${skill}</span>`));
        }

        closeModals();
    });

    $editModals.on("click", function (e) {
        if (e.target === this) closeModals();
    });


});
