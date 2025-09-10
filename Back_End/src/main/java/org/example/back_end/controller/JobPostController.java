package org.example.back_end.controller;

import lombok.RequiredArgsConstructor;
import org.example.back_end.dto.JobPostDTO;
import org.example.back_end.entity.Employee;
import org.example.back_end.entity.JobPost;
import org.example.back_end.service.EmployeeService;
import org.example.back_end.service.JobService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;


@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:63342")
public class JobPostController {

    private final JobService jobService;
    private final EmployeeService employeeService;

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


    // ✅ Get all jobs
    @GetMapping
    public ResponseEntity<?> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllJobs());
    }

    // ✅ Get jobs by employee email
    @GetMapping("/employee/{email}")
    public ResponseEntity<?> getJobsByEmployee(@PathVariable String email) {
        return ResponseEntity.ok(jobService.getAllJobsByEmployeeEmail(email));
    }

    // ✅ Update job
    @PutMapping("/{id}")
    public ResponseEntity<JobPost> updateJob(
            @PathVariable Long id,
            @RequestBody JobPost updatedJob
    ) {
        return ResponseEntity.ok(jobService.updateJob(id, updatedJob));
    }

    // ✅ Delete job
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return ResponseEntity.noContent().build();
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


    // JobController.java
    @GetMapping("/for-seeker")
    public ResponseEntity<List<JobPost>> getJobsForSeeker(@RequestParam String title) {
        List<JobPost> jobs = jobService.getJobsForSeeker(title);
        return ResponseEntity.ok(jobs);
    }


}
