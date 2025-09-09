package org.example.back_end.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private String department;
    private String employmentType;   // Full-time, Internship, Contract, etc.
    private String location;
    private String requirements;
    private String gender;
    private String requiredEducation;
    private String requiredExperience;
    private String salaryRange;

    private LocalDate applicationDeadline;
    private LocalDate postedAt;
    private LocalDateTime createdAt;

    private String companyName;
    private String companyEmail;
    private String companyPhone;
    private String companyLogo;

    private String type;   // Internship, Contract, etc.
    private String status; // Active / Open / Closed

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "job_post_key_skills",
            joinColumns = @JoinColumn(name = "job_post_id")
    )
    @Column(name = "key_skills")
    private List<String> keySkills = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee postedBy;
}
