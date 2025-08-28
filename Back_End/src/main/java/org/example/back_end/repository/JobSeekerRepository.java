package org.example.back_end.repository;

import org.example.back_end.entity.JobSeeker;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface JobSeekerRepository extends JpaRepository<JobSeeker, Long> {
    Optional<JobSeeker> findByEmail(String email);
}