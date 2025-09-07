package org.example.back_end.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.back_end.entity.Employee;
import org.example.back_end.repository.EmployeeRepository;
import org.example.back_end.service.EmployeeService;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Employee getEmployeeByEmail(String email) {
        return employeeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Employee not found with email: " + email));
    }

    @Override
    public Employee updateEmployee(String email, Employee updatedEmployee) {
        return employeeRepository.findByEmail(email)
                .map(existing -> {

                    existing.setContactFirstName(updatedEmployee.getContactFirstName());
                    existing.setContactLastName(updatedEmployee.getContactLastName());
                    existing.setContactPosition(updatedEmployee.getContactPosition());
                    existing.setEmail(updatedEmployee.getEmail());
                    existing.setPhoneNumber(updatedEmployee.getPhoneNumber());
                    existing.setCompanyName(updatedEmployee.getCompanyName());
                    existing.setIndustry(updatedEmployee.getIndustry());
                    existing.setCompanyLocation(updatedEmployee.getCompanyLocation());
                    existing.setCompanyDescription(updatedEmployee.getCompanyDescription());
                    return employeeRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Employee not found with email: " + email));
    }

    @Override
    public Employee changePassword(String email, String currentPassword, String newPassword) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Employee not found with email: " + email));

        if (!passwordEncoder.matches(currentPassword, employee.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        employee.setPassword(passwordEncoder.encode(newPassword));
        return employeeRepository.save(employee);
    }


}
