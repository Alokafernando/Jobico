package org.example.back_end.dto;

import lombok.Data;
import org.example.back_end.entity.ApplicationStatus;

@Data
public class ReviewRequest {
    private Long applicationId;
    private Long employeeId;
    private Integer rating;
    private String notes;
    private ApplicationStatus status;
}
