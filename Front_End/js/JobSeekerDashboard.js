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

        // Update dashboard display
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

        localStorage.setItem("userEmail", email);
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
                alert("Unable to load profile. Please refresh or contact support.");
            }
        });
    }

    loadUserDetails();

    // -----------------------------
    // Safe helper to get value
    // -----------------------------
    function getVal(selector) {
        const el = $(selector);
        if (!el.length) return null;
        const val = el.val();
        return val != null ? val.trim() : null;
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
        if (!email) return alert("No user email found!");
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
                alert("Profile updated successfully!");
            },
            error: function(xhr) {
                console.error("Failed to update profile", xhr);
                alert("Failed to update profile.");
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
});
