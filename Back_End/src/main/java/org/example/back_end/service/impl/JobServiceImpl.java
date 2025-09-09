package org.example.back_end.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.back_end.dto.JobPostDTO;
import org.example.back_end.entity.Employee;
import org.example.back_end.entity.JobPost;
import org.example.back_end.repository.EmployeeRepository;
import org.example.back_end.repository.JobRepository;
import org.example.back_end.service.EmployeeService;
import org.example.back_end.service.JobService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final JobRepository jobPostRepository;
    private final EmployeeService employeeService;
    private final EmployeeRepository employeeRepository;

    @Override
    public JobPost createJob(JobPostDTO jobDto, MultipartFile logo) throws IOException {
        // 1️⃣ Find employee
        Employee employee = employeeService.getEmployeeByEmail(jobDto.getCompanyEmail());
        if (employee == null) throw new RuntimeException("Employee not found with email: " + jobDto.getCompanyEmail());

        // 2️⃣ Map DTO → Entity
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
                .keySkills(jobDto.getKeySkills() != null ? jobDto.getKeySkills() : new ArrayList<>())
                .companyEmail(jobDto.getCompanyEmail())
                .companyName(jobDto.getCompanyName())
                .companyPhone(jobDto.getCompanyPhone())
                .type(jobDto.getType())
                .status(jobDto.getStatus() != null ? jobDto.getStatus() : "Active")
                .postedBy(employee)
                .postedAt(jobDto.getPostedAt() != null ? jobDto.getPostedAt() : LocalDate.now())
                .createdAt(LocalDateTime.now())
                .build();

        // 3️⃣ Handle logo upload
        if (logo != null && !logo.isEmpty()) {
            String fileName = System.currentTimeMillis() + "_" + logo.getOriginalFilename();
            Path uploadPath = Paths.get(System.getProperty("user.dir"), "uploads/logos/");
            if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);
            Path filePath = uploadPath.resolve(fileName);
            logo.transferTo(filePath.toFile());
            job.setCompanyLogo("/uploads/logos/" + fileName);
        }

        // 4️⃣ Save and return
        return jobPostRepository.save(job);
    }

    @Override
    public JobPost updateJob(Long id, JobPost updatedJob) {
        JobPost existingJob = jobPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));

        existingJob.setTitle(updatedJob.getTitle() != null ? updatedJob.getTitle() : existingJob.getTitle());
        existingJob.setDescription(updatedJob.getDescription() != null ? updatedJob.getDescription() : existingJob.getDescription());
        existingJob.setDepartment(updatedJob.getDepartment() != null ? updatedJob.getDepartment() : existingJob.getDepartment());
        existingJob.setEmploymentType(updatedJob.getEmploymentType() != null ? updatedJob.getEmploymentType() : existingJob.getEmploymentType());
        existingJob.setLocation(updatedJob.getLocation() != null ? updatedJob.getLocation() : existingJob.getLocation());
        existingJob.setRequirements(updatedJob.getRequirements() != null ? updatedJob.getRequirements() : existingJob.getRequirements());
        existingJob.setGender(updatedJob.getGender() != null ? updatedJob.getGender() : existingJob.getGender());
        existingJob.setRequiredEducation(updatedJob.getRequiredEducation() != null ? updatedJob.getRequiredEducation() : existingJob.getRequiredEducation());
        existingJob.setRequiredExperience(updatedJob.getRequiredExperience() != null ? updatedJob.getRequiredExperience() : existingJob.getRequiredExperience());
        existingJob.setSalaryRange(updatedJob.getSalaryRange() != null ? updatedJob.getSalaryRange() : existingJob.getSalaryRange());
        existingJob.setApplicationDeadline(updatedJob.getApplicationDeadline() != null ? updatedJob.getApplicationDeadline() : existingJob.getApplicationDeadline());

        if (updatedJob.getKeySkills() != null) {
            existingJob.setKeySkills(updatedJob.getKeySkills());
        } else if (existingJob.getKeySkills() == null) {
            existingJob.setKeySkills(new ArrayList<>());
        }

        existingJob.setStatus(updatedJob.getStatus() != null ? updatedJob.getStatus() : existingJob.getStatus());
        existingJob.setType(updatedJob.getType() != null ? updatedJob.getType() : existingJob.getType());

        return jobPostRepository.save(existingJob);
    }


    @Override
    public void deleteJob(Long id) {
        JobPost job = jobPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));
        jobPostRepository.delete(job);
    }

    @Override
    public JobPost getJobById(Long id) {
        return jobPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));
    }

    @Override
    public List<JobPost> getAllJobs() {
        return null;
    }

    @Override
    public List<JobPost> getAllJobsByEmployeeEmail(String email) {
        if (email == null || email.isEmpty()) return new ArrayList<>();
        return jobPostRepository.findByPostedByEmail(email);
    }

    @Override
    public long countActiveJobsForEmployee(String email) {
        return jobPostRepository.countByPostedBy_EmailAndStatus(email, "Active");
    }





}
