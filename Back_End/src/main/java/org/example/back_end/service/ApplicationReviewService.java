package org.example.back_end.service;

import org.example.back_end.entity.ApplicationReview;
import java.util.List;

public interface ApplicationReviewService {

    ApplicationReview saveReview(Long applicationId, Long employeeId, Integer rating, String notes, String status);

    List<ApplicationReview> getReviewsForApplication(Long applicationId);
}
