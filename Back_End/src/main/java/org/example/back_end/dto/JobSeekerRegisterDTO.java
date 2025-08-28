package org.example.back_end.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobSeekerRegisterDTO {
    private String firstName;
    private String lastName;
    private String email;
    private String phone_number;
    private String address;
    private String profession_title;
    private String education;
    private String experience;
    private List<String> skills;
    private String resumeUrl;
    private String password;
}
