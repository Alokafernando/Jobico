package org.example.back_end.repository;


import org.example.back_end.entity.JobPost;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobRepository extends JpaRepository<JobPost, Long> {
    List<JobPost> findByPostedByEmail(String email);
}
