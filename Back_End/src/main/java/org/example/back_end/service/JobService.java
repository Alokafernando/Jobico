package org.example.back_end.service;

import org.example.back_end.dto.JobPostDTO;
import org.example.back_end.entity.JobPost;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

public interface JobService {
    JobPost createJob(JobPostDTO jobDto, MultipartFile logo) throws IOException;
    JobPost updateJobWithLogo(Long id, JobPost updatedJob, MultipartFile logoFile) throws IOException;
    void deleteJob(Long id);
    JobPost getJobById(Long id);
    List<JobPost> getAllJobs();
    List<JobPost> getAllJobsByEmployeeEmail(String email);
    long countActiveJobsForEmployee(String email);
    Page<JobPost> getJobsForSeeker(String seekerTitle, String jobType, String experience, String salary, int page, int size);
    Page<JobPost> getRecommendedJobs(String seekerTitle, int page, int size);
    long getFilteredJobsCount(String title, String jobType, String experience, String salary);



}
