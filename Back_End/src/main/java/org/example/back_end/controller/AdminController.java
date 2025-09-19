package org.example.back_end.controller;

import lombok.RequiredArgsConstructor;
import org.example.back_end.dto.ApiResponseDTO;
import org.example.back_end.dto.AuthResponseDTO;
import org.example.back_end.entity.Admin;
import org.example.back_end.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:63342")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/details")
    public ResponseEntity<ApiResponseDTO> getAdminDetails() {
        Admin admin = adminService.getAdmin().stream().findFirst().orElse(null);

        if (admin == null) {
            return ResponseEntity.ok(new ApiResponseDTO(404, "Admin not found", null));
        }

        return ResponseEntity.ok(
                new ApiResponseDTO(200, "Admin details fetched successfully", admin)
        );
    }

}
