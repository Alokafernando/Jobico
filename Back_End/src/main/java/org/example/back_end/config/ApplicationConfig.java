package org.example.back_end.config;

import lombok.RequiredArgsConstructor;
import org.example.back_end.entity.Admin;
import org.example.back_end.entity.Employee;
import org.example.back_end.entity.JobSeeker;
import org.example.back_end.repository.AdminRepository;
import org.example.back_end.repository.EmployeeRepository;
import org.example.back_end.repository.JobSeekerRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {

    private final JobSeekerRepository jobSeekerRepository;
    private final EmployeeRepository employeeRepository;
    private final AdminRepository adminRepository;

    @Bean
    public UserDetailsService userDetailsService() {
        return email -> {
            if (jobSeekerRepository.findByEmail(email).isPresent()) {
                JobSeeker user = jobSeekerRepository.findByEmail(email).get();
                return new org.springframework.security.core.userdetails.User(
                        user.getEmail(),
                        user.getPassword(),
                        List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
                );
            }
            // Then check Employee
            if (employeeRepository.findByEmail(email).isPresent()) {
                Employee user = employeeRepository.findByEmail(email).get();
                return new org.springframework.security.core.userdetails.User(
                        user.getEmail(),
                        user.getPassword(),
                        List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
                );
            }

            if (adminRepository.findByEmail(email).isPresent()){
                Admin user = adminRepository.findByEmail(email).get();
                return new org.springframework.security.core.userdetails.User(
                        user.getEmail(),
                        user.getPassword(),
                        List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
                );
            }//admin123

            throw new UsernameNotFoundException("User not found");
        };
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
