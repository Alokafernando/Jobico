package org.example.back_end.service;

import org.example.back_end.entity.JobPost;

import java.util.List;

public interface JobService {
    JobPost createJob(JobPost job);
    JobPost updateJob(Long id, JobPost updatedJob);
    void deleteJob(Long id);
    JobPost getJobById(Long id);
    List<JobPost> getAllJobs();
    List<JobPost> getAllJobsByEmployeeEmail(String email);
}
