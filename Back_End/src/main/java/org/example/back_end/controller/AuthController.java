package org.example.back_end.controller;

import lombok.RequiredArgsConstructor;
import org.example.back_end.dto.*;
import org.example.back_end.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody AuthDTO authDTO) {
        return ResponseEntity.ok(authService.authenticate(authDTO));
    }

    @PostMapping("/register/jobseeker")
    public ResponseEntity<String> registerJobSeeker(@RequestBody JobSeekerRegisterDTO jobSeekerRegisterDTO) {
        return ResponseEntity.ok(authService.registerJobSeeker(jobSeekerRegisterDTO));
    }

    @PostMapping("/register/employee")
    public ResponseEntity<String> registerEmployee(@RequestBody EmployeeRegisterDTO registerDTO) {
        return ResponseEntity.ok(authService.registerEmployee(registerDTO));
    }
}
