package org.example.back_end.controller;

import lombok.RequiredArgsConstructor;
import org.example.back_end.dto.JobApplicationDTO;
import org.example.back_end.entity.*;
import org.example.back_end.repository.JobRepository;
import org.example.back_end.service.JobApplicationService;
import org.example.back_end.service.JobSeekerService;
import org.example.back_end.util.FileStorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:63342")
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;
    private final JobRepository jobPostService;
    private final JobSeekerService jobSeekerService;
    private final FileStorageService fileStorageService;


    @PostMapping("/apply")
    public ResponseEntity<JobApplicationDTO> applyForJob(
            @RequestParam Long jobSeekerId,
            @RequestParam Long jobPostId,
            @RequestParam MultipartFile resume
    ) {
        try {
            JobSeeker seeker = jobSeekerService.getById(jobSeekerId);
            JobPost post = jobPostService.getById(jobPostId);

            JobApplication application = jobApplicationService.applyForJob(seeker, post, resume);

            sendApplicationEmail(seeker, post, resume);

            return ResponseEntity.ok(toDTO(application));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @Autowired
    private JavaMailSender mailSender;


    @GetMapping("/seeker/{seekerId}")
    public ResponseEntity<List<JobApplicationDTO>> getApplicationsBySeeker(@PathVariable Long seekerId) {
        List<JobApplication> applications = jobApplicationService.getApplicationsForSeeker(seekerId);
        return ResponseEntity.ok(applications.stream().map(this::toDTO).collect(Collectors.toList()));
    }

    @GetMapping("/job/{jobPostId}")
    public ResponseEntity<List<JobApplicationDTO>> getApplicationsByJob(@PathVariable Long jobPostId) {
        List<JobApplication> applications = jobApplicationService.getApplicationsForJob(jobPostId);
        return ResponseEntity.ok(applications.stream().map(this::toDTO).collect(Collectors.toList()));
    }

    @PatchMapping("/{applicationId}/status")
    public ResponseEntity<JobApplicationDTO> updateStatus(
            @PathVariable Long applicationId,
            @RequestParam ApplicationStatus status
    ) {
        JobApplication updated = jobApplicationService.updateApplicationStatus(applicationId, status);
        return ResponseEntity.ok(toDTO(updated));
    }

    private String saveFile(MultipartFile file) {
        return file.getOriginalFilename();
    }

    private JobApplicationDTO toDTO(JobApplication application) {
        return new JobApplicationDTO(
                application.getId(),
                application.getJobSeeker().getId(),
                application.getJobSeeker().getFirstName(),
                application.getJobPost().getId(),
                application.getJobPost().getTitle(),
                application.getResumeUrl(),
                application.getStatus()
        );
    }

    private void sendApplicationEmail(JobSeeker seeker, JobPost post, MultipartFile resume) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom("buddhikafernando19@gmail.com");
            helper.setTo(post.getCompanyEmail());
            helper.setSubject("New Job Application: " + post.getTitle());

            String content = String.format(
                    "Dear HR,\n\nYou have received a new job application.\n\n" +
                            "Job Seeker: %s %s\nEmail: %s\nJob Title: %s\n\nPlease find the resume attached.\n\nBest regards,\nJob Portal",
                    seeker.getFirstName(),
                    seeker.getLastName(),
                    seeker.getEmail(),
                    post.getTitle()
            );

            helper.setText(content);

            helper.addAttachment(resume.getOriginalFilename(), new ByteArrayResource(resume.getBytes()));

            mailSender.send(message);
        } catch (MessagingException | IOException e) {
            e.printStackTrace();
        }
    }


}
