package org.example.back_end.service.impl;

import lombok.RequiredArgsConstructor;

import org.example.back_end.entity.JobSeeker;
import org.example.back_end.repository.JobSeekerRepository;
import org.example.back_end.service.JobSeekerService;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobSeekerServiceImpl implements JobSeekerService {

    private final JobSeekerRepository jobSeekerRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public JobSeeker getJobSeekerByEmail(String email) {
        return jobSeekerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("JobSeeker not found"));
    }

    @Override
    public JobSeeker save(JobSeeker seeker) {
        return jobSeekerRepository.save(seeker);
    }

    @Override
    public JobSeeker updateProfile(String email, Map<String, Object> updates) {
        JobSeeker seeker = jobSeekerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("JobSeeker not found"));

        if (updates.containsKey("firstName")) seeker.setFirstName((String) updates.get("firstName"));
        if (updates.containsKey("username")) seeker.setFirstName((String) updates.get("username"));
        if (updates.containsKey("lastName")) seeker.setLastName((String) updates.get("lastName"));
        if (updates.containsKey("email")) seeker.setEmail((String) updates.get("email"));
        if (updates.containsKey("phoneNumber")) seeker.setPhoneNumber((String) updates.get("phoneNumber"));
        if (updates.containsKey("address")) seeker.setAddress((String) updates.get("address"));
        if (updates.containsKey("professionTitle")) seeker.setProfessionTitle((String) updates.get("professionTitle"));
        if (updates.containsKey("jobType")) seeker.setJobType((String) updates.get("jobType"));
        if (updates.containsKey("experience")) seeker.setExperience((String) updates.get("experience"));
        if (updates.containsKey("education")) seeker.setEducation((String) updates.get("education"));
        if (updates.containsKey("about")) seeker.setAbout((String) updates.get("about"));

        // Safe skills handling
        if (updates.containsKey("skills")) {
            Object skillsObj = updates.get("skills");
            if (skillsObj instanceof java.util.List<?>) {
                List<String> skillList = ((List<?>) skillsObj).stream()
                        .filter(Objects::nonNull)
                        .map(Object::toString)
                        .collect(Collectors.toList());
                seeker.setSkills(skillList);
            } else if (skillsObj instanceof String) {
                List<String> skillList = Arrays.stream(((String) skillsObj).split(","))
                        .map(String::trim)
                        .collect(Collectors.toList());
                seeker.setSkills(skillList);
            }
        }

        return jobSeekerRepository.save(seeker);
    }


    @Override
    public void changePassword(String email, String currentPassword, String newPassword) {
        JobSeeker seeker = jobSeekerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(currentPassword, seeker.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        if (newPassword.length() < 6) {
            throw new RuntimeException("New password must be at least 6 characters long");
        }

        seeker.setPassword(passwordEncoder.encode(newPassword));
        jobSeekerRepository.save(seeker);
    }

    @Override
    public JobSeeker getById(Long id) {
        return jobSeekerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job seeker not found"));
    }

    @Override
    public JobSeeker updateProfilePicture(String email, String pictureUrl) {
        JobSeeker seeker = jobSeekerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Job seeker not found with email: " + email));

        seeker.setProfileImage(pictureUrl);
        return jobSeekerRepository.save(seeker);
    }



}
