package org.example.back_end.entity;

import jakarta.persistence.*;
import lombok.*;

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

    @Column(nullable = false)
    private String title; // e.g. "Software Engineer"

    @Lob
    @Column(nullable = false)
    private String description; // general job overview

    private String location;       // e.g. "Colombo, Sri Lanka"
    private String employmentType; // e.g. "FULL_TIME", "PART_TIME", "CONTRACT"
    private String salaryRange;    // e.g. "80,000 - 120,000 LKR"

    // Requirements
    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> requiredSkills = new ArrayList<>();

    private String requiredEducation;   // e.g. "Bachelor’s in Computer Science"
    private String requiredExperience;  // e.g. "2+ years in software development"

    private LocalDateTime postedAt = LocalDateTime.now();
    private LocalDateTime applicationDeadline; // optional closing date

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee postedBy;  // Employer who posted the job
}
