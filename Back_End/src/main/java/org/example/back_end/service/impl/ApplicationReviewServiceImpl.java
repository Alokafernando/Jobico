package org.example.back_end.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.back_end.entity.ApplicationReview;
import org.example.back_end.entity.ApplicationStatus;
import org.example.back_end.entity.JobApplication;
import org.example.back_end.entity.Employee;
import org.example.back_end.repository.ApplicationReviewRepository;
import org.example.back_end.repository.JobApplicationRepository;
import org.example.back_end.repository.EmployeeRepository;
import org.example.back_end.service.ApplicationReviewService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationReviewServiceImpl implements ApplicationReviewService {


    private final ApplicationReviewRepository applicationReviewRepository;
    private final JobApplicationRepository jobAppRepo;
    private final EmployeeRepository employeeRepo;

    @Override
    public ApplicationReview saveReview(Long applicationId, Long employeeId, Integer rating, String notes, String status) {
        JobApplication app = jobAppRepo.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        Employee emp = employeeRepo.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        ApplicationReview review = applicationReviewRepository.findByJobApplicationId(applicationId).stream()
                .filter(r -> r.getReviewer().getId().equals(employeeId))
                .findFirst()
                .orElse(new ApplicationReview());

        review.setJobApplication(app);
        review.setReviewer(emp);
        review.setRating(rating);
        review.setInternalNotes(notes);
        review.setReviewedAt(LocalDateTime.now());

        if (status != null && !status.isEmpty()) {
            try {
                app.setStatus(ApplicationStatus.valueOf(status.toUpperCase()));
                jobAppRepo.save(app);
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid application status: " + status);
            }
        }

        return applicationReviewRepository.save(review);
    }


    @Override
    public List<ApplicationReview> getReviewsForApplication(Long applicationId) {
        return applicationReviewRepository.findByJobApplicationId(applicationId);
    }
}
