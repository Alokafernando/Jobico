package org.example.back_end.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.back_end.entity.*;
import org.example.back_end.repository.JobApplicationRepository;
import org.example.back_end.repository.JobRepository;
import org.example.back_end.repository.JobSeekerRepository;
import org.example.back_end.service.JobApplicationService;
import org.example.back_end.util.FileStorageService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.mail.MessagingException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class JobApplicationServiceImpl implements JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final JobRepository jobPostRepository;
    private final JobSeekerRepository jobSeekerRepository;
    private final FileStorageService fileStorageService;
    private final EmailServiceImpl emailService; // Injected

    @Override
    public JobApplication applyForJob(JobSeeker seeker, JobPost post, MultipartFile resumeFile) {
        try {
            String resumeUrl = fileStorageService.storeFile(resumeFile);

            JobApplication application = JobApplication.builder()
                    .jobSeeker(seeker)
                    .jobPost(post)
                    .resumeUrl(resumeUrl)
                    .status(ApplicationStatus.SUBMITTED)
                    .build();

            JobApplication savedApp = jobApplicationRepository.save(application);

            String subject = "New Job Application for " + post.getTitle();
            String body = "You have received a new application.\n\n"
                    + "Name: " + seeker.getFirstName() + " " + seeker.getLastName() + "\n"
                    + "Email: " + seeker.getEmail() + "\n"
                    + "Phone: " + seeker.getPhoneNumber() + "\n\n"
                    + "Please find the resume attached.";

            emailService.sendEmailWithAttachment(
                    post.getCompanyEmail(),
                    subject,
                    body,
                    resumeFile.getOriginalFilename(),
                    resumeFile.getBytes()
            );

            return savedApp;

        } catch (Exception e) {
            throw new RuntimeException("Error while applying for job: " + e.getMessage(), e);
        }
    }


    @Override
    public List<JobApplication> getApplicationsForSeeker(Long seekerId) {
        return jobApplicationRepository.findByJobSeekerId(seekerId);
    }

    @Override
    public List<JobApplication> getApplicationsForJob(Long jobId) {
        return jobApplicationRepository.findByJobPostId(jobId);
    }

    @Override
    public JobApplication updateApplicationStatus(Long applicationId, ApplicationStatus status) {
        Optional<JobApplication> optionalApplication = jobApplicationRepository.findById(applicationId);
        if (optionalApplication.isPresent()) {
            JobApplication application = optionalApplication.get();
            application.setStatus(status);
            return jobApplicationRepository.save(application);
        }
        throw new RuntimeException("Job application not found with ID: " + applicationId);
    }

    @Override
    public JobApplication getApplicationById(Long applicationId) {
        return jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Job application not found with ID: " + applicationId));
    }
}
