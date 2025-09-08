package org.example.back_end.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.back_end.entity.Employee;
import org.example.back_end.entity.JobPost;
import org.example.back_end.repository.EmployeeRepository;

import org.example.back_end.repository.JobRepository;
import org.example.back_end.service.JobService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final JobRepository jobPostRepository;
    private final EmployeeRepository employeeRepository;
    private final ModelMapper modelMapper;

    @Override
    public JobPost createJob(JobPost job) {
        job.setCreatedAt(LocalDateTime.now());
        if (job.getStatus() == null) job.setStatus("ACTIVE");
        return jobPostRepository.save(job);
    }

    @Override
    public JobPost updateJob(Long id, JobPost updatedJob) {
        return jobPostRepository.findById(id)
                .map(existing -> {
                    existing.setTitle(updatedJob.getTitle());
                    existing.setDescription(updatedJob.getDescription());
                    existing.setLocation(updatedJob.getLocation());
                    existing.setRequirements(updatedJob.getRequirements());
                    existing.setSalaryRange(updatedJob.getSalaryRange());
                    existing.setCompanyName(updatedJob.getCompanyName());
                    existing.setCompanyEmail(updatedJob.getCompanyEmail());
                    existing.setCompanyPhone(updatedJob.getCompanyPhone());
                    existing.setCompanyLogo(updatedJob.getCompanyLogo());
                    existing.setType(updatedJob.getType());
                    existing.setStatus(updatedJob.getStatus());
                    return jobPostRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));
    }

    @Override
    public void deleteJob(Long id) {
        if (!jobPostRepository.existsById(id)) {
            throw new RuntimeException("Job not found with id: " + id);
        }
        jobPostRepository.deleteById(id);
    }

    @Override
    public JobPost getJobById(Long id) {
        return jobPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));
    }

    @Override
    public List<JobPost> getAllJobs() {
        return jobPostRepository.findAll();
    }

    @Override
    public List<JobPost> getAllJobsByEmployeeEmail(String email) {
        return jobPostRepository.findByPostedByEmail(email);
    }
}
