package org.example.back_end.controller;

import lombok.RequiredArgsConstructor;
import org.example.back_end.dto.ReviewRequest;
import org.example.back_end.entity.ApplicationReview;
import org.example.back_end.entity.ApplicationStatus;
import org.example.back_end.service.ApplicationReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin
public class ApplicationReviewController {

    private final ApplicationReviewService reviewService;

    @PostMapping("/save")
    public ResponseEntity<ApplicationReview> saveReview(
            @RequestBody ReviewRequest reviewDto,
            @RequestParam(required = false) String status
    ) {
        ApplicationReview review = reviewService.saveReview(
                reviewDto.getApplicationId(),
                reviewDto.getEmployeeId(),
                reviewDto.getRating(),
                reviewDto.getNotes(),
                status
        );
        return ResponseEntity.ok(review);
    }


    @GetMapping("/application/{applicationId}")
    public ResponseEntity<List<ApplicationReview>> getReviewsForApplication(
            @PathVariable Long applicationId
    ) {
        List<ApplicationReview> reviews = reviewService.getReviewsForApplication(applicationId);
        return ResponseEntity.ok(reviews);
    }
}
