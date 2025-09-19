package org.example.back_end.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.back_end.dto.JobPostDTO;
import org.example.back_end.entity.Employee;
import org.example.back_end.entity.JobPost;
import org.example.back_end.repository.EmployeeRepository;
import org.example.back_end.repository.JobRepository;
import org.example.back_end.service.EmployeeService;
import org.example.back_end.service.JobService;
import org.example.back_end.util.ImgBBUploader;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
    private final ImgBBUploader imgBBUploader;


    ///create job -> employee
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
                .status(jobDto.getStatus() != null ? jobDto.getStatus() : "Pending")
                .postedBy(employee)
                .postedAt(jobDto.getPostedAt() != null ? jobDto.getPostedAt() : LocalDate.now())
                .createdAt(LocalDateTime.now())
                .build();

        if (logo != null && !logo.isEmpty()) {
            try {
                String logoUrl = imgBBUploader.uploadImage(logo);
                job.setCompanyLogo(logoUrl);
            } catch (Exception e) {
                throw new RuntimeException("Failed to upload logo: " + e.getMessage(), e);
            }
        }

        // 4️⃣ Save and return
        return jobPostRepository.save(job);
    }

    ///update job  -> employee
    @Override
    public JobPost updateJobWithLogo(Long id, JobPost updatedJob, MultipartFile logoFile) throws IOException {
        JobPost existingJob = jobPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));

        existingJob.setTitle(updatedJob.getTitle() != null ? updatedJob.getTitle() : existingJob.getTitle());
        existingJob.setDescription(updatedJob.getDescription() != null ? updatedJob.getDescription() : existingJob.getDescription());
        existingJob.setDepartment(updatedJob.getDepartment() != null ? updatedJob.getDepartment() : existingJob.getDepartment());
        existingJob.setEmploymentType(updatedJob.getEmploymentType() != null ? updatedJob.getEmploymentType() : existingJob.getEmploymentType());
        existingJob.setLocation(updatedJob.getLocation() != null ? updatedJob.getLocation() : existingJob.getLocation());
        existingJob.setRequirements(updatedJob.getRequirements() != null ? updatedJob.getRequirements() : existingJob.getRequirements());
        existingJob.setSalaryRange(updatedJob.getSalaryRange() != null ? updatedJob.getSalaryRange() : existingJob.getSalaryRange());
        existingJob.setRequiredExperience(updatedJob.getRequiredExperience() != null ? updatedJob.getRequiredExperience() : existingJob.getRequiredExperience());
        existingJob.setGender(updatedJob.getGender() != null ? updatedJob.getGender() : existingJob.getGender());
        existingJob.setApplicationDeadline(updatedJob.getApplicationDeadline() != null ? updatedJob.getApplicationDeadline() : existingJob.getApplicationDeadline());
        existingJob.setKeySkills(updatedJob.getKeySkills() != null ? updatedJob.getKeySkills() : existingJob.getKeySkills());
        existingJob.setStatus("Pending");

        if (logoFile != null && !logoFile.isEmpty()) {
            try {
                String logoUrl = imgBBUploader.uploadImage(logoFile);
                existingJob.setCompanyLogo(logoUrl);
            } catch (Exception e) {
                throw new RuntimeException("Failed to upload logo to ImgBB: " + e.getMessage(), e);
            }
        }

        return jobPostRepository.save(existingJob);
    }

    ///delete job -> admin
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
    public Page<JobPost> getAllJobs(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return jobPostRepository.findAllActiveJobs(pageable);
    }

    @Override
    public List<JobPost> getAllJobsByEmployeeEmail(String email) {
        if (email == null || email.isEmpty()) return new ArrayList<>();
        return jobPostRepository.findByPostedByEmail(email);
    }

    ///get active job post count -> seeker
    @Override
    public long countActiveJobsForEmployee(String email) {
        return jobPostRepository.countByPostedBy_EmailAndStatus(email, "Active");
    }

    ///show jobs -> seeker
    @Override
    public Page<JobPost> getJobsForSeeker(String seekerTitle,
                                          String jobType,
                                          String experience,
                                          String salary,
                                          int page,
                                          int size) {
        // Remove rank keywords like senior, junior, mid, lead, intern
        String keyword = seekerTitle.replaceAll("(?i)senior|junior|mid|lead|intern", "").trim();

        Pageable pageable = PageRequest.of(page, size);
        return jobPostRepository.searchJobs(keyword, jobType, experience, salary, pageable);
    }

    ///recommend job related professionTitle -> seeker
    @Override
    public Page<JobPost> getRecommendedJobs(String seekerTitle, int page, int size) {
        String keyword = seekerTitle.replaceAll("(?i)senior|junior|mid|lead|intern", "").trim();

        Pageable pageable = PageRequest.of(page, size);
        return jobPostRepository.findRecommendedJobs(keyword, pageable);
    }

    /// get filtering jobs count -> seeker
    @Override
    public long getFilteredJobsCount(String title, String jobType, String experience, String salary) {
        String keyword = title.replaceAll("(?i)senior|junior|mid|lead|intern", "").trim();
        return jobPostRepository.countFilteredJobs(keyword, jobType, experience, salary);
    }

    @Override
    public Page<JobPost> searchJobs(String keyword, String location, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        if (keyword != null && keyword.isBlank()) keyword = null;
        if (location != null && location.equals("Select Location")) location = null;
        return jobPostRepository.searchJobs(keyword, location, pageable);
    }

    @Override
    public Page<JobPost> getAllJobsForAdmin(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return jobPostRepository.findAll(pageable);
    }

    @Override
    public Page<JobPost> getJobsByStatus(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return jobPostRepository.findByStatus(status, pageable);
    }

    @Override
    public long countJobsByStatus(String status) {
        return jobPostRepository.countByStatus(status);
    }

    @Override
    public Page<JobPost> adminSearchJobs(String keyword, String location, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        if (keyword != null && keyword.isBlank()) keyword = null;
        if (location != null && location.equals("Select Location")) location = null;
        return jobPostRepository.adminSearchJobs(keyword, location, pageable);
    }

    @Override
    public JobPost updateJobStatus(Long jobId, String status) {
        JobPost job = jobPostRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + jobId));
        job.setStatus(status);
        return jobPostRepository.save(job);
    }


}
