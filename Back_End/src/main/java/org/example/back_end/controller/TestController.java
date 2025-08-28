package org.example.back_end.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/jobseeker/dashboard")
    public String jobSeekerDashboard() {
        return "Welcome to JobSeeker Dashboard";
    }

    @GetMapping("/employee/dashboard")
    public String employeeDashboard() {
        return "Welcome to Employee Dashboard";
    }

    @GetMapping("/admin/dashboard")
    public String adminDashboard() {
        return "Welcome to Admin Dashboard";
    }
}
