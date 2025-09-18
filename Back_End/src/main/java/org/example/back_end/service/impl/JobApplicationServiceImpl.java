package org.example.back_end.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.back_end.dto.ApplicantDetailsDTO;
import org.example.back_end.entity.*;
import org.example.back_end.repository.JobApplicationRepository;
import org.example.back_end.repository.JobRepository;
import org.example.back_end.repository.JobSeekerRepository;
import org.example.back_end.service.JobApplicationService;
import org.example.back_end.util.FileStorageService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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
                    .employee(post.getPostedBy())
                    .resumeUrl(resumeUrl)
                    .status(ApplicationStatus.SUBMITTED)
                    .appliedAt(LocalDateTime.now())
                    .build();


            JobApplication savedApp = jobApplicationRepository.save(application);

            String subject = "New Job Application - " + post.getTitle();

            String body = "Dear Hiring Team,\n\n"
                    + "A new application has been submitted for the position of " + post.getTitle() + ".\n\n"
                    + "Candidate Details:\n"
                    + "\n"
                    + "Name      : " + seeker.getFirstName() + " " + seeker.getLastName() + "\n"
                    + "Email     : " + seeker.getEmail() + "\n"
                    + "Phone     : " + (seeker.getPhoneNumber() != null ? seeker.getPhoneNumber() : "Not provided") + "\n"
                    + "Applied At: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")) + "\n"
                    + "\n\n"
                    + "The applicant’s resume has been attached for your review.\n\n"
                    + "Best regards,\n"
                    + "Job Portal Team";


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
    public ApplicantDetailsDTO getFullApplicantDetails(Long applicationId) {
        List<ApplicantDetailsDTO> applicants = jobApplicationRepository.getFullApplicantDetailsList(applicationId);
        return applicants.isEmpty() ? null : applicants.get(0);
    }




    @Override
    public List<JobApplication> getApplicationsBySeeker(String email) {
        return jobApplicationRepository.findByJobSeeker_Email(email);
    }

    @Override
    public List<JobApplication> getApplicationsForEmployee(Long employeeId) {
        return jobApplicationRepository.findByEmployeeId(employeeId);
    }
}
