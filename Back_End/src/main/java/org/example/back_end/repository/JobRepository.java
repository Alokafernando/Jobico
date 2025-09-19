package org.example.back_end.repository;

import org.example.back_end.entity.JobPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    Page<JobPost> searchJobs(
            @Param("title") String title,
            @Param("jobType") String jobType,
            @Param("experience") String experience,
            @Param("salary") String salary,
            Pageable pageable
    );///for filtering job

    @Query("SELECT j FROM JobPost j " +
            "WHERE LOWER(j.title) LIKE LOWER(CONCAT('%', :title, '%')) " +
            "ORDER BY j.postedAt DESC")
    Page<JobPost> findRecommendedJobs(@Param("title") String title, Pageable pageable); /// for recommend job

    @Query("SELECT COUNT(j) FROM JobPost j " +
            "WHERE LOWER(j.title) LIKE LOWER(CONCAT('%', :title, '%')) " +
            "AND (:jobType IS NULL OR :jobType = '' OR j.employmentType = :jobType) " +
            "AND (:experience IS NULL OR :experience = '' OR j.requiredExperience = :experience) " +
            "AND (:salary IS NULL OR :salary = '' OR j.salaryRange = :salary)")
    long countFilteredJobs(
            @Param("title") String title,
            @Param("jobType") String jobType,
            @Param("experience") String experience,
            @Param("salary") String salary ///this is for getting filter data count
    );

    @Query("SELECT j FROM JobPost j WHERE j.applicationDeadline > CURRENT_DATE")
    Page<JobPost> findAllActiveJobs(Pageable pageable);


    @Query("SELECT j FROM JobPost j WHERE " +
            "(:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(j.companyName) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:location IS NULL OR j.location = :location) " +
            "AND j.applicationDeadline > CURRENT_DATE")
    Page<JobPost> searchJobs(@Param("keyword") String keyword,
                             @Param("location") String location,
                             Pageable pageable);

    Page<JobPost> findAll(Pageable pageable);

    @Query("SELECT j FROM JobPost j WHERE j.status = :status")
    Page<JobPost> findByStatus(@Param("status") String status, Pageable pageable);

    @Query("SELECT COUNT(j) FROM JobPost j WHERE j.status = :status")
    long countByStatus(@Param("status") String status);

    @Query("SELECT j FROM JobPost j WHERE " +
            "(:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(j.companyName) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:location IS NULL OR j.location = :location)")
    Page<JobPost> adminSearchJobs(@Param("keyword") String keyword,
                                  @Param("location") String location,
                                  Pageable pageable);






}
