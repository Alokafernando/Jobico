package org.example.back_end.service;

import org.example.back_end.dto.JobPostDTO;
import org.example.back_end.entity.JobPost;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

public interface JobService {
    JobPost createJob(JobPostDTO jobDto, MultipartFile logo) throws IOException;
    JobPost updateJob(Long id, JobPost job);
    void deleteJob(Long id);
    JobPost getJobById(Long id);
    List<JobPost> getAllJobs();
    List<JobPost> getAllJobsByEmployeeEmail(String email);
    long countActiveJobsForEmployee(String email);


}
