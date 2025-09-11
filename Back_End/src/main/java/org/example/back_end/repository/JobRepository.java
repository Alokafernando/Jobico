package org.example.back_end.repository;

import org.example.back_end.entity.JobPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobRepository extends JpaRepository<JobPost, Long> {
    List<JobPost> findByPostedByEmail(String email);
    long countByPostedBy_EmailAndStatus(String email, String status);
    @Query("SELECT j FROM JobPost j " +
            "WHERE LOWER(j.title) LIKE LOWER(CONCAT('%', :title, '%')) " +
            "AND (:jobType IS NULL OR :jobType = '' OR j.employmentType = :jobType) " +
            "AND (:experience IS NULL OR :experience = '' OR j.requiredExperience = :experience) " +
            "AND (:salary IS NULL OR :salary = '' OR j.salaryRange = :salary)")
    List<JobPost> searchJobs(@Param("title") String title,
                             @Param("jobType") String jobType,
                             @Param("experience") String experience,
                             @Param("salary") String salary);




}
