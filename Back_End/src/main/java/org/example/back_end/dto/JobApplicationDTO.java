package org.example.back_end.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.back_end.entity.ApplicationStatus;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JobApplicationDTO {
    private Long id;
    private Long jobSeekerId;
    private String jobSeekerName;
    private Long jobPostId;
    private String jobTitle;
    private String resumeUrl;
    private ApplicationStatus status;
}
