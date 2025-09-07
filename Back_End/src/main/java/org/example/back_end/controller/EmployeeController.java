package org.example.back_end.controller;

import lombok.RequiredArgsConstructor;
import org.example.back_end.entity.Employee;
import org.example.back_end.service.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employee")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:63342")
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping("/email/{email}")
    public ResponseEntity<Employee> getEmployeeByEmail(@PathVariable String email) {
        Employee employee = employeeService.getEmployeeByEmail(email);
        return ResponseEntity.ok(employee);
    }

    @PutMapping("/update/{email}")
    public ResponseEntity<Employee> updateEmployee(
            @PathVariable String email,
            @RequestBody Employee updatedEmployee
    ) {
        Employee employee = employeeService.updateEmployee(email, updatedEmployee);
        return ResponseEntity.ok(employee);
    }

}
