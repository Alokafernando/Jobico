package org.example.back_end.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPostDTO {

    private String title;
    private String description;
    private String department;
    private String employmentType;
    private String location;
    private String requirements;
    private String gender;
    private String requiredEducation;
    private String requiredExperience;
    private String salaryRange;

    private LocalDate applicationDeadline;
    private LocalDate postedAt;

    private String companyName;
    private String companyEmail;
    private String companyPhone;
    private String companyLogo;

    private String type;
    private String status;

    private List<String> keySkills;   // ✅ matches entity
}
