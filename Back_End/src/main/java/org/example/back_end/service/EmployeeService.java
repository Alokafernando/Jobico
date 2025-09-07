package org.example.back_end.service;

import org.example.back_end.entity.Employee;


public interface EmployeeService {
    Employee getEmployeeByEmail(String email);

    Employee updateEmployee(String email, Employee updatedEmployee);
}
