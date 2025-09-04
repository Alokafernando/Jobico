// ==============================
// JobSeekerDashboard.js
// Handles job seeker dashboard navigation, profile loading, editing, and logout
// ==============================

$(document).ready(function () {
    // -----------------------------
    // Global Selectors
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
    const $editProfileName = $("#edit-profile-name");
    const $editProfessionTitle = $("#edit-profession-title");

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

    if (window.location.hash) {
        showPage(window.location.hash.substring(1));
    } else {
        showPage("dashboard");
    }



    // -----------------------------
    // Central Method: Set User Details
    // -----------------------------
    function setUserDetails(user) {
        const firstName = user.firstName || "";
        const lastName = user.lastName || "";
        const profession = user.professionTitle || "";


        // UI updates
        $welcomeUser.text(firstName ? `Welcome back, ${firstName}!` : "Welcome back!");
        $profileName.text(`${firstName} ${lastName}`);
        $professionTitle.text(profession);
        $profileProfessionTitle.text(profession);
        $profileFullName.text(`${firstName} ${lastName}`);

        // Form fields
        $editProfileName.val(`${firstName} ${lastName}`);
        $editProfessionTitle.val(profession);


        // Save in localStorage
        localStorage.setItem("firstName", firstName);
        localStorage.setItem("lastName", lastName);
        localStorage.setItem("professionTitle", profession);
        // localStorage.setItem("avatarUrl", avatar);
    }

    // -----------------------------
    // Profile Picture Upload
    // -----------------------------
    $("#open-profile-picture-modal").on("click", () => $profilePictureModal.css("display", "flex"));
    $profilePictureModal.find(".edit-modal-close, .modal-btn-cancel").on("click", () => $profilePictureModal.hide());

    $("#file-upload").on("change", function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => $("#avatar-preview").attr("src", e.target.result);
            reader.readAsDataURL(file);
        }
    });

    $("#save-profile-picture").on("click", function () {
        const file = $("#file-upload")[0].files[0];
        if (!file) return alert("Please select a file");

        const email = localStorage.getItem("userEmail");
        const formData = new FormData();
        formData.append("file", file);
        formData.append("email", email);


    });

    // -----------------------------
    // Apply Button
    // -----------------------------
    $(".apply-btn").on("click", function () {
        $(this).text("Applied").addClass("applied");
    });

    // -----------------------------
    // Logout Modal
    // -----------------------------
    window.closeWindow = function () {
        $confirmationModal.css("display", "flex");
    };

    $("#modal-cancel").on("click", () => $confirmationModal.hide());

    $("#modal-confirm").on("click", function () {
        localStorage.clear();
        window.location.href = "../index.html";
    });

    $confirmationModal.on("click", function (e) {
        if (e.target === this) $(this).hide();
    });

    $logoutLink.on("click", function (e) {
        e.preventDefault();
        window.closeWindow();
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

    // -----------------------------
    // Load User Details from API
    // -----------------------------
    function loadUserDetails() {
        if (!token) {
            window.location.href = "../index.html";
            return;
        }

        const email = localStorage.getItem("userEmail");

        $.ajax({
            url: `http://localhost:8080/api/jobseekers/email/${email}`,
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` },
            success: setUserDetails, // ✅ use central method
            error: (err) => console.error("Failed to load profile by email", err)
        });
    }

    // Initial load
    loadUserDetails();
});
