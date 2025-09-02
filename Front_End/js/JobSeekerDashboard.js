$(document).ready(function () {
    // -----------------------------
    // Selectors
    // -----------------------------
    const $pageSections = $(".page-section");
    const $menuLinks = $(".menu-link");
    const $profileImg = $(".profile-img");
    const $logoutLink = $("#logout-link");
    const $editModals = $(".edit-modal");
    const $profilePictureModal = $("#edit-profile-picture-modal");
    const $confirmationModal = $("#confirmation-modal");
    const $welcomeUser = $("#welcomeUser");

    // -----------------------------
    // Show specific page
    // -----------------------------
    function showPage(pageId) {
        $pageSections.removeClass("active");
        if (pageId === "saved-jobs") {
            $("#saved-jobs").addClass("active");
        } else {
            $("#" + pageId).addClass("active");
        }

        $menuLinks.removeClass("active")
            .filter(`[data-page='${pageId}']`)
            .addClass("active");

        history.pushState({ page: pageId }, "", `#${pageId}`);
        $(window).scrollTop(0);
    }

    // -----------------------------
    // Menu links click
    // -----------------------------
    $menuLinks.on("click", function (e) {
        e.preventDefault();
        const pageId = $(this).data("page");
        if (pageId) showPage(pageId);
    });

    // -----------------------------
    // Profile image click
    // -----------------------------
    $profileImg.on("click", function () {
        showPage("profile");
    });

    // -----------------------------
    // Buttons with data-page
    // -----------------------------
    $("button[data-page]").on("click", function () {
        showPage($(this).data("page"));
    });

    // -----------------------------
    // Browser back/forward
    // -----------------------------
    $(window).on("popstate", function (e) {
        if (e.originalEvent.state && e.originalEvent.state.page) {
            showPage(e.originalEvent.state.page);
        } else {
            showPage("dashboard");
        }
    });

    // -----------------------------
    // Initial load
    // -----------------------------
    if (window.location.hash) {
        showPage(window.location.hash.substring(1));
    } else {
        showPage("dashboard");
    }

    // -----------------------------
    // Set welcome message from login
    // -----------------------------
    const firstName = localStorage.getItem("firstName");
    if (firstName) {
        $welcomeUser.text(`Welcome back, ${firstName}!`);
    } else {
        $welcomeUser.text("Welcome back!");
    }

    // -----------------------------
    // Apply buttons
    // -----------------------------
    $(".apply-btn").on("click", function () {
        const jobTitle = $(this).closest(".job-card").find("h3").text();
        $(this).text("Applied").addClass("applied");
    });

    // -----------------------------
    // Confirmation modal for logout
    // -----------------------------
    window.closeWindow = function () {
        $confirmationModal.css("display", "flex");
    };

    $("#modal-cancel").on("click", function () {
        $confirmationModal.hide();
    });

    $("#modal-confirm").on("click", function () {
        // Clear login data
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("firstName");

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
    $(".edit-btn").on("click", function () {
        const editType = $(this).data("edit");
        $("#edit-" + editType + "-modal").css("display", "flex");
    });

    function closeModals() {
        $editModals.hide();
    }

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
    // Profile picture modal
    // -----------------------------
    $("#open-profile-picture-modal").on("click", function () {
        $profilePictureModal.css("display", "flex");
    });

    $profilePictureModal.find(".edit-modal-close, .modal-btn-cancel").on("click", function () {
        $profilePictureModal.hide();
    });

    $("#file-upload").on("change", function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                $("#avatar-preview").attr("src", event.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    $("#save-profile-picture").on("click", function () {
        const newAvatarSrc = $("#avatar-preview").attr("src");
        $("#profile-avatar, #header-avatar, #sidebar-avatar").attr("src", newAvatarSrc);
        $profilePictureModal.hide();
    });
});
