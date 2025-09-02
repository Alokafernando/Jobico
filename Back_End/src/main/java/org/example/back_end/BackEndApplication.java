package org.example.back_end;

import org.example.back_end.dto.AuthDTO;
import org.example.back_end.entity.Employee;
import org.example.back_end.entity.JobSeeker;
import org.modelmapper.ModelMapper;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class BackEndApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackEndApplication.class, args);
    }

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();

        modelMapper.typeMap(AuthDTO.class, Employee.class).addMappings(mapper -> {
            mapper.skip(Employee::setId);
        });

        modelMapper.typeMap(AuthDTO.class, JobSeeker.class).addMappings(mapper -> {
            mapper.skip(JobSeeker::setId);
        });

        return modelMapper;
    }


}
