package org.example.back_end.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class EmployeeRegisterDTO {
    @NotBlank(message = "Company name is mandatory")
    private String companyName;

    @NotBlank(message = "Industry is mandatory")
    private String industry;

    @NotBlank(message = "Contact person's first name is mandatory")
    @Pattern(regexp = "^[a-zA-Z]+$", message = "First name should contain only alphabets")
    private String contactFirstName;

    @NotBlank(message = "Contact person's last name is mandatory")
    @Pattern(regexp = "^[a-zA-Z]+$", message = "Last name should contain only alphabets")
    private String contactLastName;

    @NotBlank(message = "Contact position is mandatory")
    private String  contactPosition;

    @NotBlank(message = "Email is mandatory")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Phone number is mandatory")
    @Pattern(regexp="^[0-9]{10}$", message="Phone number must be 10 digits")
    private String phone;

    private String username;


    @NotBlank(message = "Company location is mandatory")
    private String location;

    private String description;

    @NotBlank(message = "Password is mandatory")
    private String password;
}
