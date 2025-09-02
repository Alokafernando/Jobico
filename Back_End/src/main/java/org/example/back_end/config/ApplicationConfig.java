package org.example.back_end.config;

import lombok.RequiredArgsConstructor;
import org.example.back_end.entity.Employee;
import org.example.back_end.entity.JobSeeker;
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

            if (email.equals("admin@gmail.com")) {
                String encodedPassword = "$2a$10$9vHHx0W0sLrTNh7vQqR1O.4wU4QOmZpY5cYZM7HryOQxjUl7sVix6";
                return new org.springframework.security.core.userdetails.User(
                        "admin@gmail.com",
                        encodedPassword,
                        List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
                );
            }

            throw new UsernameNotFoundException("User not found");
        };
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
