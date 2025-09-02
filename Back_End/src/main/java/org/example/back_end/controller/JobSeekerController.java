package org.example.back_end.controller;

import lombok.RequiredArgsConstructor;
import org.example.back_end.entity.JobSeeker;
import org.example.back_end.service.JobSeekerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/jobseekers")
@RequiredArgsConstructor
public class JobSeekerController {

    private final JobSeekerService jobSeekerService;

    @GetMapping("/{id}")
    public ResponseEntity<JobSeeker> getJobSeeker(@PathVariable Long id) {
        JobSeeker jobSeeker = jobSeekerService.getJobSeekerById(id);
        return ResponseEntity.ok(jobSeeker);
    }
}
