package org.example.back_end.service;

import org.example.back_end.dto.JobPostDTO;
import org.example.back_end.entity.JobPost;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface JobService {
    // ✅ Employee
    JobPost createJob(JobPostDTO jobDto, MultipartFile logo) throws IOException;
    JobPost updateJobWithLogo(Long id, JobPost updatedJob, MultipartFile logoFile) throws IOException;
    JobPost getJobById(Long id);
    List<JobPost> getAllJobsByEmployeeEmail(String email);
    long countActiveJobsForEmployee(String email);

    // ✅ Seeker
    Page<JobPost> getAllJobs(int page, int size);
    Page<JobPost> getJobsForSeeker(String seekerTitle, String jobType, String experience, String salary, int page, int size);
    Page<JobPost> getRecommendedJobs(String seekerTitle, int page, int size);
    long getFilteredJobsCount(String title, String jobType, String experience, String salary);
    Page<JobPost> searchJobs(String keyword, String location, int page, int size);

    // ✅ Admin
    Page<JobPost> getAllJobsForAdmin(int page, int size);
    Page<JobPost> getJobsByStatus(String status, int page, int size);
    long countJobsByStatus(String status);
    Page<JobPost> adminSearchJobs(String keyword, String location, int page, int size);
    JobPost updateJobStatus(Long jobId, String status);
    boolean deleteJob(Long id);
}
