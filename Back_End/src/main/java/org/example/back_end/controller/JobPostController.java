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

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/jobs") // ✅ REST endpoint for jobs
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:63342") // frontend access
public class JobPostController {

    private final JobService jobService;
    private final EmployeeService employeeService;

    @PostMapping("/create")
    public ResponseEntity<?> createJob(
            @RequestPart("job") JobPostDTO jobDto,
            @RequestPart(value = "logo", required = false) MultipartFile logo
    ) {
        try {
            // Find employee by email
            Employee employee = employeeService.getEmployeeByEmail(jobDto.getCompanyEmail());
            if (employee == null) {
                return ResponseEntity.badRequest()
                        .body("Employee not found with email: " + jobDto.getCompanyEmail());
            }

            // Map DTO → Entity
            JobPost job = JobPost.builder()
                    .title(jobDto.getTitle())
                    .description(jobDto.getDescription())
                    .department(jobDto.getDepartment())
                    .employmentType(jobDto.getEmploymentType())
                    .location(jobDto.getLocation())
                    .requirements(jobDto.getRequirements())
                    .gender(jobDto.getGender())
                    .requiredEducation(jobDto.getRequiredEducation())
                    .requiredExperience(jobDto.getRequiredExperience())
                    .salaryRange(jobDto.getSalaryRange())
                    .applicationDeadline(jobDto.getApplicationDeadline())
                    .postedAt(jobDto.getPostedAt() != null ? jobDto.getPostedAt() : LocalDate.now())
                    .createdAt(LocalDateTime.now())
                    .companyEmail(jobDto.getCompanyEmail())
                    .companyName(jobDto.getCompanyName())
                    .companyPhone(jobDto.getCompanyPhone())
                    .status(jobDto.getStatus() != null ? jobDto.getStatus() : "Active")
                    .type(jobDto.getType())
                    .keySkills(jobDto.getKeySkills() != null ? jobDto.getKeySkills() : new ArrayList<>())
                    .postedBy(employee)
                    .build();

            // Handle logo upload
            if (logo != null && !logo.isEmpty()) {
                String fileName = System.currentTimeMillis() + "_" + logo.getOriginalFilename();
                Path uploadPath = Paths.get(System.getProperty("user.dir"), "uploads/logos/");
                if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

                Path filePath = uploadPath.resolve(fileName);
                logo.transferTo(filePath.toFile());

                job.setCompanyLogo("/uploads/logos/" + fileName);
            }

            JobPost savedJob = jobService.createJob(job);
            return ResponseEntity.ok(savedJob);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("Failed to create job: " + e.getMessage());
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
    public ResponseEntity<?> getJobById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(jobService.getJobById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

}
