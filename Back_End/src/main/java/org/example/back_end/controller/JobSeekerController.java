package org.example.back_end.controller;

import lombok.RequiredArgsConstructor;
import org.example.back_end.entity.JobSeeker;
import org.example.back_end.service.AuthService;
import org.example.back_end.service.JobSeekerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/jobseekers")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:63342")
public class JobSeekerController {

    @Autowired
    private AuthService authService;

    private final JobSeekerService jobSeekerService;


    @GetMapping("/email/{email}")
    public ResponseEntity<JobSeeker> getJobSeekerByEmail(@PathVariable String email) {
        JobSeeker seeker = jobSeekerService.getJobSeekerByEmail(email);
        return ResponseEntity.ok(seeker);
    }

    @PutMapping("/update/{email}")
    public ResponseEntity<JobSeeker> updateJobSeekerProfile(
            @PathVariable String email,
            @RequestBody Map<String, Object> updates
    ) {
        JobSeeker seeker = jobSeekerService.getJobSeekerByEmail(email);
        if (seeker == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        try {
            if (updates.containsKey("firstName")) seeker.setFirstName((String) updates.get("firstName"));
            if (updates.containsKey("username")) {
                seeker.setFirstName((String) updates.get("username"));
            }


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

            jobSeekerService.save(seeker);
            return ResponseEntity.ok(seeker);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }



}
