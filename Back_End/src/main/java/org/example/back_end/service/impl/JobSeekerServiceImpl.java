package org.example.back_end.service.impl;

import lombok.RequiredArgsConstructor;

import org.example.back_end.entity.JobSeeker;
import org.example.back_end.repository.JobSeekerRepository;
import org.example.back_end.service.JobSeekerService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JobSeekerServiceImpl implements JobSeekerService {

    private final JobSeekerRepository jobSeekerRepository;
    private final ModelMapper modelMapper;

    @Override
    public JobSeeker getJobSeekerById(Long id) {
        JobSeeker jobSeeker = jobSeekerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job Seeker not found with ID: " + id));

        // Map entity to DTO
        return modelMapper.map(jobSeeker, JobSeeker.class);
    }
}
