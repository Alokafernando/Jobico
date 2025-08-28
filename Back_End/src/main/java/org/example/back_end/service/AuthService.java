package org.example.back_end.service;

import org.example.back_end.dto.*;

public interface AuthService {
    AuthResponseDTO authenticate(AuthDTO authDTO);
    String registerJobSeeker(JobSeekerRegisterDTO jobSeekerRegisterDTO);
    String registerEmployee(EmployeeRegisterDTO employeeRegisterDTO);
}
