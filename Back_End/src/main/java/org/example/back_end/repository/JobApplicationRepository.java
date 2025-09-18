package org.example.back_end.repository;

import org.example.back_end.dto.ApplicantDetailsDTO;
import org.example.back_end.dto.JobApplicationDTO;
import org.example.back_end.dto.ReviewRequest;
import org.example.back_end.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByJobSeekerId(Long jobSeekerId);
    List<JobApplication> findByJobPostId(Long jobPostId);
    List<JobApplication> findByJobSeeker_Email(String email);
    List<JobApplication> findByEmployeeId(Long employeeId);

    // Interface-based projection query
    @Query("""
        SELECT 
            a.id AS applicationId,
            a.status AS status,
            a.appliedAt AS appliedAt,
            j.title AS jobTitle,
            s.id AS seekerId,
            s.firstName AS firstName,
            s.lastName AS lastName,
            s.email AS email,
            s.phoneNumber AS phoneNumber,
            s.profileImage AS profileImage,
            s.professionTitle AS professionTitle,
            s.address AS address,
            s.about AS about,
            s.skills AS skills,
            s.education AS education,
            s.experience AS experience,
            a.resumeUrl AS resumeUrl
        FROM JobApplication a
        JOIN a.jobPost j
        JOIN a.jobSeeker s
        WHERE a.id = :applicationId
    """)
    List<ApplicantDetailsDTO> getFullApplicantDetailsList(@Param("applicationId") Long applicationId);

    @Query("""
        SELECT new org.example.back_end.dto.JobApplicationDTO(
            a.id,
            a.jobSeeker.id,
            CONCAT(a.jobSeeker.firstName, ' ', a.jobSeeker.lastName),
            a.jobPost.id,
            a.jobPost.title,
            a.resumeUrl,
            a.status,
            a.jobSeeker.profileImage
        )
        FROM JobApplication a
        WHERE a.employee.id = :employeeId
        ORDER BY a.appliedAt DESC
    """)
    List<JobApplicationDTO> findRecentApplicationsByEmployeeId(@Param("employeeId") Long employeeId);






}
