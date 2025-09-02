package org.example.back_end.repository;

import org.example.back_end.entity.JobSeeker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface JobSeekerRepository extends JpaRepository<JobSeeker, Long> {
    Optional<JobSeeker> findByEmail(String email);

    @Query("SELECT j FROM JobSeeker j WHERE j.id = :id")
    Optional<JobSeeker> getJobSeekerById(@Param("id") Long id);


}