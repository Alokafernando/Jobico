package org.example.back_end.dto;

import lombok.Data;

@Data
public class EmployeeRegisterDTO {
    private String email;
    private String password;
    private String firstName;
    private String lastName;
}
