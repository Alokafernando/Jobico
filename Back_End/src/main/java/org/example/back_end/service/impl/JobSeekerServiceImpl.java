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
    public JobSeeker getJobSeekerByEmail(String email) {
        return jobSeekerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("JobSeeker not found"));
    }

    @Override
    public JobSeeker save(JobSeeker seeker) {
        return jobSeekerRepository.save(seeker);
    }




}
