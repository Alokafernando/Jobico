package org.example.back_end.service;

import org.example.back_end.entity.JobSeeker;

import java.util.Map;

public interface JobSeekerService {
    JobSeeker getJobSeekerByEmail(String email);
    JobSeeker save(JobSeeker seeker);
    JobSeeker updateProfile(String email, Map<String, Object> updates);
    void changePassword(String email, String currentPassword, String newPassword);
    JobSeeker getById(Long id);
    JobSeeker updateProfilePicture(String email, String imageUrl);

}
