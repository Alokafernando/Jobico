package org.example.back_end.controller;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.back_end.dto.ApiResponseDTO;
import org.example.back_end.dto.JobPostDTO;
import org.example.back_end.entity.Employee;
import org.example.back_end.entity.JobPost;
import org.example.back_end.repository.JobRepository;
import org.example.back_end.service.EmployeeService;
import org.example.back_end.service.JobService;
import org.example.back_end.service.impl.EmailServiceImpl;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:63342")
public class JobPostController {

    private final JobService jobService;
    private final JobRepository jobRepository;
    private final EmailServiceImpl emailService;

    @PostMapping("/create")
    public ResponseEntity<?> createJob(
            @RequestPart("job") JobPostDTO jobDto,
            @RequestPart(value = "logo", required = false) MultipartFile logo
    ) {
        try {
            JobPost savedJob = jobService.createJob(jobDto, logo);
            return ResponseEntity.ok(savedJob);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("Failed to create job due to file upload error: " + e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }


    /// Get all jobs
    @GetMapping("/jobs")
    public Page<JobPost> getJobs(@RequestParam(defaultValue = "0") int page) {
        return jobService.getAllJobs(page, 6);
    }

    // 1️⃣ Get all jobs (for admin)
    @GetMapping("/all")
    public ResponseEntity<Page<JobPost>> getAllJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<JobPost> jobs = jobService.getAllJobsForAdmin(page, size);
        return ResponseEntity.ok(jobs);
    }

    // 2️⃣ Get jobs by status (Pending, Active, Rejected, Closed)
    @GetMapping("/status/{status}")
    public ResponseEntity<Page<JobPost>> getJobsByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<JobPost> jobs = jobService.getJobsByStatus(status, page, size);
        return ResponseEntity.ok(jobs);
    }


    // ✅ Get jobs by employee email
    @GetMapping("/employee/{email}")
    public ResponseEntity<?> getJobsByEmployee(@PathVariable String email) {
        return ResponseEntity.ok(jobService.getAllJobsByEmployeeEmail(email));
    }

    /// Update job
    @PutMapping("/{id}")
    public ResponseEntity<JobPost> updateJob(
            @PathVariable Long id,
            @RequestPart("job") JobPost updatedJob,
            @RequestPart(value = "logo", required = false) MultipartFile logoFile) throws IOException {

        JobPost job = jobService.updateJobWithLogo(id, updatedJob, logoFile);
        return ResponseEntity.ok(job);
    }

    @PutMapping("/{id}/close")
    public ResponseEntity<Map<String, String>> closeJob(@PathVariable Long id) {
        try {
            jobService.deleteJob(id);
            return ResponseEntity.ok(Map.of("message", "Job closed successfully"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobPost> getJobById(@PathVariable Long id) {
        try {
            JobPost job = jobService.getJobById(id);
            return ResponseEntity.ok(job);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }


    @GetMapping("/my/active-job-count")
    public ResponseEntity<Long> getMyActiveJobCount(@RequestParam String email) {
        long count = jobService.countActiveJobsForEmployee(email);
        return ResponseEntity.ok(count);
    }


    @GetMapping("/for-seeker")
    public ResponseEntity<Page<JobPost>> getJobsForSeeker(
            @RequestParam String title,
            @RequestParam(required = false) String jobType,
            @RequestParam(required = false) String experience,
            @RequestParam(required = false) String salary,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size
    ) {
        Page<JobPost> jobsPage = jobService.getJobsForSeeker(title, jobType, experience, salary, page, size);
        return ResponseEntity.ok(jobsPage);
    }

    @GetMapping("/recommended")
    public ResponseEntity<Page<JobPost>> getRecommendedJobs(
            @RequestParam String title,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size
    ) {
        Page<JobPost> recommendedJobs = jobService.getRecommendedJobs(title, page, size);
        return ResponseEntity.ok(recommendedJobs);
    }

    @GetMapping("/for-seeker/count")
    public ResponseEntity<Long> getFilteredJobsCount(
            @RequestParam String title,
            @RequestParam(required = false) String jobType,
            @RequestParam(required = false) String experience,
            @RequestParam(required = false) String salary
    ) {
        long count = jobService.getFilteredJobsCount(title, jobType, experience, salary);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {

        Page<JobPost> jobPage = jobService.searchJobs(keyword, location, page, size);

        Map<String, Object> response = new HashMap<>();
        response.put("content", jobPage.getContent());
        response.put("number", jobPage.getNumber());
        response.put("totalPages", jobPage.getTotalPages());
        response.put("first", jobPage.isFirst());
        response.put("last", jobPage.isLast());

        return ResponseEntity.ok(response);
    }

    // 3️⃣ Count jobs by status
    @GetMapping("/status/{status}/count")
    public ResponseEntity<Long> countJobsByStatus(@PathVariable String status) {
        long count = jobService.countJobsByStatus(status);
        return ResponseEntity.ok(count);
    }

//    @GetMapping("/search")
//    public ResponseEntity<Map<String, Object>> adminSearchJobs(
//            @RequestParam(required = false) String keyword,
//            @RequestParam(required = false) String location,
//            @RequestParam(defaultValue = "0") int page,
//            @RequestParam(defaultValue = "10") int size
//    ) {
//        Page<JobPost> jobsPage = jobService.adminSearchJobs(keyword, location, page, size);
//
//        Map<String, Object> response = new HashMap<>();
//        response.put("content", jobsPage.getContent());
//        response.put("number", jobsPage.getNumber());
//        response.put("totalPages", jobsPage.getTotalPages());
//        response.put("first", jobsPage.isFirst());
//        response.put("last", jobsPage.isLast());
//
//        return ResponseEntity.ok(response);
//    }

    @PutMapping("/jobs/update-status/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponseDTO> updateJobStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        String newStatus = request.get("status");
        JobPost job = jobRepository.findById(id).orElse(null);

        if (job == null) {
            return ResponseEntity.ok(new ApiResponseDTO(404, "Job not found", null));
        }

        job.setStatus(newStatus);
        jobRepository.save(job);

        // Send email if status changed to ACTIVE
        if ("ACTIVE".equalsIgnoreCase(newStatus)) {
            try {
                String email = job.getPostedBy().getEmail(); // employer email
                String subject = "Your job post is now ACTIVE!";
                String body = "<p>Hello " + job.getPostedBy().getCompanyName() + ",</p>" +
                        "<p>Your job post <strong>" + job.getTitle() + "</strong> is now ACTIVE and visible to job seekers.</p>" +
                        "<p>Thank you,<br/>Jobico Team</p>";

                emailService.sendSimpleEmail(email, subject, body); // make sure this method exists
            } catch (Exception e) {
                // Log the error but don’t break the response
                e.printStackTrace();
            }
        }

        return ResponseEntity.ok(new ApiResponseDTO(200, "Job status updated successfully", job));
    }





}
