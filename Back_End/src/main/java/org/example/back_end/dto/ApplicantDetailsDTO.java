package org.example.back_end.dto;

import org.example.back_end.entity.ApplicationStatus;
import java.time.LocalDateTime;
import java.util.List;

public interface ApplicantDetailsDTO {
    Long getApplicationId();
    ApplicationStatus getStatus();
    LocalDateTime getAppliedAt();
    String getJobTitle();

    Long getSeekerId();
    String getFirstName();
    String getLastName();
    String getEmail();
    String getPhoneNumber();
    String getProfileImage();
    List<String> getSkills();
    String getEducation();
    String getExperience();
    String getResumeUrl();
    String getProfessionTitle();
    String getAddress();
    String getAbout();
}
