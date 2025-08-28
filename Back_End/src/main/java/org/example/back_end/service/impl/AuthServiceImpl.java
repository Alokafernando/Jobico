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
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final JobSeekerRepository jobSeekerRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwlUtil;


    @Override
    public AuthResponseDTO authenticate(AuthDTO authDTO) {

        // Check Job Seeker
        JobSeeker jobSeeker = jobSeekerRepository.findByEmail(authDTO.getEmail()).orElse(null);
        if (jobSeeker != null) {
            if (!passwordEncoder.matches(authDTO.getPassword(), jobSeeker.getPassword())) {
                throw new BadCredentialsException("Invalid credentials for JobSeeker");
            }
            String token = jwlUtil.generateToken(jobSeeker.getEmail());
            return new AuthResponseDTO(jobSeeker.getEmail(), token, "ROLE_JOB_SEEKER");
        }

        // Check Employee
        Employee employee = employeeRepository.findByEmail(authDTO.getEmail()).orElse(null);
        if (employee != null) {
            if (!passwordEncoder.matches(authDTO.getPassword(), employee.getPassword())) {
                throw new BadCredentialsException("Invalid credentials for Employee");
            }
            String token = jwlUtil.generateToken(employee.getEmail());
            return new AuthResponseDTO(employee.getEmail(), token, "ROLE_EMPLOYEE");
        }

        if (authDTO.getEmail().equals("admin@gmail.com")) {
            String encodedAdminPassword = "$2a$12$.4Wrlu3qNpQ2uLbCDcKB6Ogm7PvNdEid20a2e96pPjUpqRFltTQ5y"; //"admin123"
            if (!passwordEncoder.matches(authDTO.getPassword(), encodedAdminPassword)) {
                throw new BadCredentialsException("Invalid credentials for Admin");
            }
            String token = jwlUtil.generateToken("admin@gmail.com");
            return new AuthResponseDTO("admin@gmail.com", token, "ROLE_ADMIN");
        }


        throw new BadCredentialsException("User not found");
    }

    @Override
    public String registerJobSeeker(JobSeekerRegisterDTO jobSeekerRegisterDTO) {
        if (jobSeekerRepository.findByEmail(jobSeekerRegisterDTO.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use");
        }

        JobSeeker jobSeeker = JobSeeker.builder()
                .firstName(jobSeekerRegisterDTO.getFirstName())
                .lastName(jobSeekerRegisterDTO.getLastName())
                .email(jobSeekerRegisterDTO.getEmail())
                .username(jobSeekerRegisterDTO.getEmail())
                .password(passwordEncoder.encode(jobSeekerRegisterDTO.getPassword()))
                .phoneNumber(jobSeekerRegisterDTO.getPhone_number())
                .address(jobSeekerRegisterDTO.getAddress())
                .education(jobSeekerRegisterDTO.getEducation())
                .experience(jobSeekerRegisterDTO.getExperience())
                .professionTitle(jobSeekerRegisterDTO.getProfession_title())
                .skills(jobSeekerRegisterDTO.getSkills())
                .resumeUrl(jobSeekerRegisterDTO.getResumeUrl())
                .role(Role.JOB_SEEKER)
                .isActive(true)
                .build();


        jobSeekerRepository.save(jobSeeker);
        return "Job Seeker registered successfully";
    }

    @Override
    public String registerEmployee(EmployeeRegisterDTO employeeRegisterDTO) {
        if (employeeRepository.findByEmail(employeeRegisterDTO.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use");
        }

        Employee employee = Employee.builder()
                .companyDescription(employeeRegisterDTO.getDescription())
                .companyLocation(employeeRegisterDTO.getLocation())
                .companyName(employeeRegisterDTO.getCompanyName())
                .contactFirstName(employeeRegisterDTO.getContactFirstName())
                .contactLastName(employeeRegisterDTO.getContactLastName())
                .contactPosition(employeeRegisterDTO.getContactPosition())
                .industry(employeeRegisterDTO.getIndustry())
                .phoneNumber(employeeRegisterDTO.getPhone())
                .username(employeeRegisterDTO.getEmail())
                .email(employeeRegisterDTO.getEmail())
                .username(employeeRegisterDTO.getEmail())
                .password(passwordEncoder.encode(employeeRegisterDTO.getPassword()))
                .role(Role.EMPLOYEE)
                .build();

        employeeRepository.save(employee);
        return "Employee registered successfully";
    }

}
