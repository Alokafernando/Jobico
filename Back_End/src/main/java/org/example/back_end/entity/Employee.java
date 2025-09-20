package org.example.back_end.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(nullable = false, unique = true)
    private String password;

    @Column(nullable = false, unique = true)
    private String email;

    private String companyName;
    private String industry;
    private String contactFirstName;
    private String contactLastName;

    @Column(name = "contact_position")
    private String contactPosition;

    private String phoneNumber;
    private String companyLocation;
    private String companyDescription;
    private String status;

    @Enumerated(EnumType.STRING)
    private Role role = Role.EMPLOYEE;

}
