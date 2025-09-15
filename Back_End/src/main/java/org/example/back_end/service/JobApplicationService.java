package org.example.back_end.service;

import org.example.back_end.entity.ApplicationStatus;
import org.example.back_end.entity.JobApplication;
import org.example.back_end.entity.JobPost;
import org.example.back_end.entity.JobSeeker;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface JobApplicationService {
    JobApplication applyForJob(JobSeeker seeker, JobPost post, MultipartFile resumeFile);
    List<JobApplication> getApplicationsForSeeker(Long seekerId);
    List<JobApplication> getApplicationsForJob(Long jobId);
    JobApplication updateApplicationStatus(Long applicationId, ApplicationStatus status);
    JobApplication getApplicationById(Long applicationId);
}
