package org.example.back_end.repository;

import org.example.back_end.entity.ApplicationReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationReviewRepository extends JpaRepository<ApplicationReview, Long> {
    List<ApplicationReview> findByJobApplicationId(Long applicationId);
}
