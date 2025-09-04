package org.example.back_end.service;

import org.example.back_end.entity.JobSeeker;

public interface JobSeekerService {
    JobSeeker getJobSeekerByEmail(String email);
}
