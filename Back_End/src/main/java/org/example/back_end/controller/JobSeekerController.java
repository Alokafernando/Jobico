package org.example.back_end.controller;

import lombok.RequiredArgsConstructor;
import org.example.back_end.entity.JobSeeker;
import org.example.back_end.service.JobSeekerService;
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

@RestController
@RequestMapping("/api/jobseekers")
@RequiredArgsConstructor
@CrossOrigin
public class JobSeekerController {

    private final JobSeekerService jobSeekerService;


    @GetMapping("/email/{email}")
    public ResponseEntity<JobSeeker> getJobSeekerByEmail(@PathVariable String email) {
        JobSeeker seeker = jobSeekerService.getJobSeekerByEmail(email);
        return ResponseEntity.ok(seeker);
    }

}
