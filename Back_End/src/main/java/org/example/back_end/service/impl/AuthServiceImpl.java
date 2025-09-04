package org.example.back_end.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.back_end.dto.*;
import org.example.back_end.entity.Employee;
import org.example.back_end.entity.JobSeeker;
import org.example.back_end.entity.Role;
import org.example.back_end.repository.EmployeeRepository;
import org.example.back_end.repository.JobSeekerRepository;
import org.example.back_end.service.AuthService;
import org.example.back_end.util.JwtUtil;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final JobSeekerRepository jobSeekerRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;
    private final JwtUtil jwtUtil;

    @Override
    public AuthResponseDTO authenticate(AuthDTO authDTO) {

        // Check Job Seeker
        JobSeeker jobSeeker = jobSeekerRepository.findByEmail(authDTO.getEmail()).orElse(null);
        if (jobSeeker != null) {
            if (!passwordEncoder.matches(authDTO.getPassword(), jobSeeker.getPassword())) {
                throw new BadCredentialsException("Invalid credentials for JobSeeker");
            }
            String token = jwtUtil.generateToken(jobSeeker.getEmail());
            return new AuthResponseDTO(
                    jobSeeker.getEmail(),
                    token,
                    "ROLE_JOB_SEEKER",
                    jobSeeker.getFirstName()
            );
        }

        // Check Employee
        Employee employee = employeeRepository.findByEmail(authDTO.getEmail()).orElse(null);
        if (employee != null) {
            if (!passwordEncoder.matches(authDTO.getPassword(), employee.getPassword())) {
                throw new BadCredentialsException("Invalid credentials for Employee");
            }
            String token = jwtUtil.generateToken(employee.getEmail());
            return new AuthResponseDTO(
                    employee.getEmail(),
                    token,
                    "ROLE_EMPLOYEE",
                    employee.getContactFirstName()
            );
        }

        // Check Admin
        if (authDTO.getEmail().equals("admin@gmail.com")) {
            String encodedAdminPassword = "$2a$12$.4Wrlu3qNpQ2uLbCDcKB6Ogm7PvNdEid20a2e96pPjUpqRFltTQ5y"; // admin123
            if (!passwordEncoder.matches(authDTO.getPassword(), encodedAdminPassword)) {
                throw new BadCredentialsException("Invalid credentials for Admin");
            }
            String token = jwtUtil.generateToken("admin@gmail.com");
            return new AuthResponseDTO(
                    "admin@gmail.com",
                    token,
                    "ROLE_ADMIN",
                    "Admin" // or "Michael", whatever you want
            );
        }

        throw new BadCredentialsException("User not found");
    }

    @Override
    public String registerJobSeeker(JobSeekerRegisterDTO dto) {
        // Check for existing email
        if (jobSeekerRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use");
        }

        JobSeeker jobSeeker = JobSeeker.builder()
//                .username(dto.getFirstName())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .phoneNumber(dto.getPhone_number())
                .address(dto.getAddress())
                .professionTitle(dto.getProfession_title())
                .education(dto.getEducation())
                .experience(dto.getExperience())
                .skills(dto.getSkills() != null ? dto.getSkills() : new ArrayList<>())
                .resumeUrl(dto.getResumeUrl())
                .password(passwordEncoder.encode(dto.getPassword()))
                .isActive(true)
                .role(Role.JOB_SEEKER)
                .build();

        jobSeekerRepository.save(jobSeeker);
        return "Job Seeker registered successfully";
    }

    @Override
    public String registerEmployee(EmployeeRegisterDTO dto) {
        // Check for existing email
        if (employeeRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use");
        }

        // Map DTO -> Entity
        Employee employee = Employee.builder()
                .username(dto.getUsername())
                .contactFirstName(dto.getContactFirstName())
                .contactLastName(dto.getContactLastName())
                .email(dto.getEmail())
                .phoneNumber(dto.getPhone())
                .companyName(dto.getCompanyName())
                .industry(dto.getIndustry())
                .contactFirstName(dto.getContactFirstName())
                .contactLastName(dto.getContactLastName())
                .contactPosition(dto.getContactPosition())
                .companyLocation(dto.getLocation())
                .companyDescription(dto.getDescription())
                .password(passwordEncoder.encode(dto.getPassword()))
                .role(Role.EMPLOYEE)
                .build();

        employeeRepository.save(employee);
        return "Employee registered successfully";
    }
}
