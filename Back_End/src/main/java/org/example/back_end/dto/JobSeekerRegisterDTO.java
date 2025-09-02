package org.example.back_end.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobSeekerRegisterDTO {
    @NotBlank(message = "First Name is mandatory")
    @Pattern(regexp = "^[a-zA-Z]+$", message = "First name should contain only alphabets")
    private String firstName;

    @NotBlank(message = "Last Name is mandatory")
    @Pattern(regexp = "^[a-zA-Z]+$", message = "Last name should contain only alphabets")
    private String lastName;

    @NotBlank(message = "Email is mandatory")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Phone number is mandatory")
    @Pattern(regexp="^[0-9]{10}$", message="Phone number must be 10 digits")
    private String phone_number;

    @NotBlank(message = "Address is mandatory")
    private String address;

    private String username;

    private String profession_title;
    private String education;
    private String experience;
    private List<String> skills;
    private String resumeUrl;

    @NotBlank(message = "Password is mandatory")
    private String password;

}
