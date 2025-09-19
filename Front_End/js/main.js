$(document).ready(function () {
    const $searchResults = $("#search-results");
    const $searchPagination = $("#search-pagination");

    loadAllJobs(0);

    $("#find-job").on("click", function (e) {
        e.preventDefault();
        const keyword = $("#keyword").val().trim() || "";
        if (keyword === "") {
            loadAllJobs(0);
        } else {
            searchJobs(keyword, 0);
        }
    });

    $searchPagination.on("click", ".pagination-btn", function () {
        const page = $(this).data("page");
        const keyword = $(this).data("keyword") || "";
        if (keyword === "") {
            loadAllJobs(page);
        } else {
            searchJobs(keyword, page);
        }
    });

    $(document).on("click", ".apply-btn", function () {
        const jobTitle = $(this).closest(".job-card").find(".job-title").text();
        alert(`Application started for: ${jobTitle}`);
    });

    function loadAllJobs(page) {
        $.ajax({
            url: "http://localhost:8080/api/jobs/jobs",
            method: "GET",
            data: { page: page, size: 6 },
            success: function (data) {
                renderJobs(data, "");
            },
            error: function () {
                $searchResults.html("<p>Failed to load jobs.</p>");
                $searchPagination.empty();
            }
        });
    }

    function searchJobs(keyword, page) {
        $.ajax({
            url: "http://localhost:8080/api/jobs/search",
            method: "GET",
            data: { keyword: keyword, page: page, size: 6 },
            success: function (data) {
                renderJobs(data, keyword);
            },
            error: function () {
                $searchResults.html("<p>Failed to load jobs.</p>");
                $searchPagination.empty();
            }
        });
    }

    function renderJobs(data, keyword) {
        $searchResults.empty();
        $searchPagination.empty();

        const jobs = data.jobs || data.content;

        if (!jobs || jobs.length === 0) {
            $searchResults.html("<p>No jobs found.</p>");
            return;
        }

        jobs.forEach(job => {
            const daysLeft = getDaysLeft(job.applicationDeadline);
            const jobCard = `
                <div class="job-card">
                    <div class="job-header">
                        <div class="days-left"><i class="fas fa-clock"></i> ${daysLeft}</div>
                        <div class="job-type">${job.employmentType || "N/A"}</div>
                    </div>
                    <div class="company-logo-container">
                        <img src="${job.companyLogo || 'https://via.placeholder.com/80x80?text=Logo'}" 
                             alt="${job.companyName || 'Company'}" class="post-logo">
                    </div>
                    <h4 class="job-title">${job.title}</h4>
                    <p class="job-company">${job.companyName || "N/A"}</p>
                    <p class="job-location"><i class="fa-solid fa-location-dot"></i> ${job.location || "N/A"}</p>
                    <div class="job-footer">
                        <button class="apply-btn" data-job-id="${job.id}">Apply Now</button>
                    </div>
                </div>
            `;
            $searchResults.append(jobCard);
        });

        renderPagination(data, keyword);
    }

    function renderPagination(data, keyword) {
        if (data.totalPages <= 1) return;

        if (!data.first) {
            $searchPagination.append(`<button class="pagination-btn" data-page="${data.number - 1}" data-keyword="${keyword}">❮</button>`);
        }

        for (let i = 0; i < data.totalPages; i++) {
            const active = i === data.number ? "active" : "";
            $searchPagination.append(`<button class="pagination-btn ${active}" data-page="${i}" data-keyword="${keyword}">${i + 1}</button>`);
        }

        if (!data.last) {
            $searchPagination.append(`<button class="pagination-btn" data-page="${data.number + 1}" data-keyword="${keyword}">❯</button>`);
        }
    }

    function getDaysLeft(deadline) {
        if (!deadline) return "N/A";
        const diff = new Date(deadline) - new Date();
        return diff > 0 ? Math.ceil(diff / (1000*60*60*24)) + " days left" : "Closed";
    }
});
