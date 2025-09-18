package org.example.back_end.dto;

import lombok.Data;

@Data
public class ReviewRequest {
    private Long applicationId;
    private Long employeeId;
    private Integer rating;
    private String notes;
    private String status;
}
