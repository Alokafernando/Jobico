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
import java.util.Map;

@RestController
@RequestMapping("/api/jobseekers")
@RequiredArgsConstructor
@CrossOrigin
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

        if (updates.containsKey("jobType")) {
            seeker.setJobType((String) updates.get("jobType"));
        }
        if (updates.containsKey("about")) {
            seeker.setAbout((String) updates.get("about"));
        }

        jobSeekerService.save(seeker);

        return ResponseEntity.ok(seeker);
    }


}
