package org.example.back_end.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.back_end.entity.Employee;
import org.example.back_end.entity.JobApplication;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "job_application_id", nullable = false)
    private JobApplication jobApplication;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee reviewer;

    private Integer rating; // 0–5
    private String internalNotes;

    private LocalDateTime reviewedAt = LocalDateTime.now();
}
