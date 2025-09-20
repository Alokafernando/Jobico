package org.example.back_end.controller;

import lombok.RequiredArgsConstructor;
import org.example.back_end.entity.JobSeeker;
import org.example.back_end.service.AuthService;
import org.example.back_end.service.JobSeekerService;
import org.example.back_end.util.ImgBBUploader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
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


    private final JobSeekerService jobSeekerService;
    private final PasswordEncoder passwordEncoder;
    private final ImgBBUploader imgBBUploader;


    @GetMapping("/email/{email}")
    public ResponseEntity<JobSeeker> getJobSeekerByEmail(@PathVariable String email) {
        JobSeeker seeker = jobSeekerService.getJobSeekerByEmail(email);
        return ResponseEntity.ok(seeker);
    }

    @PutMapping("/update/{email}")
    public ResponseEntity<?> updateJobSeekerProfile(
            @PathVariable String email,
            @RequestBody Map<String, Object> updates
    ) {
        try {
            JobSeeker updated = jobSeekerService.updateProfile(email, updates);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to update profile"));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(@RequestBody Map<String, String> payload) {
        try {
            jobSeekerService.changePassword(
                    payload.get("email"),
                    payload.get("currentPassword"),
                    payload.get("newPassword")
            );
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to change password"));
        }
    }

    @PostMapping("/profile-picture")
    public ResponseEntity<?> uploadProfilePicture(
            @RequestParam("email") String email,
            @RequestParam("file") MultipartFile file) {
        try {
            String uploadedUrl = imgBBUploader.uploadImage(file);
            JobSeeker updatedSeeker = jobSeekerService.updateProfilePicture(email, uploadedUrl);
            return ResponseEntity.ok(updatedSeeker);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to upload profile picture: " + e.getMessage());
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<JobSeeker>> getAllJobSeekers() {
        List<JobSeeker> seekers = jobSeekerService.getAllSeekers();
        if (seekers.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(seekers);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<JobSeeker> getJobSeekerById(@PathVariable Long id) {
        JobSeeker seeker = jobSeekerService.getJobSeekerById(id);
        if (seeker == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(seeker);
    }


    // JobSeekerController.java
    @PutMapping("/deactivate/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deactivateJobSeeker(@PathVariable Long id) {
        try {
            JobSeeker updatedSeeker = jobSeekerService.toggleJobSeekerStatus(id);
            String statusMessage = updatedSeeker.isActive() ? "Job seeker activated" : "Job seeker deactivated";
            return ResponseEntity.ok(Map.of("message", statusMessage));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }



}
