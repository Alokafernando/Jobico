package org.example.back_end.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.back_end.entity.Admin;
import org.example.back_end.repository.AdminRepository;
import org.example.back_end.service.AdminService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final AdminRepository adminRepository;

    @Override
    public List<Admin> getAdmin() {
        return adminRepository.findAll();
    }
}
