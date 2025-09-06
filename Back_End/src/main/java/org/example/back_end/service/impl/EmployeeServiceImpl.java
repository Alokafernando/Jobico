package org.example.back_end.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.back_end.entity.Employee;
import org.example.back_end.repository.EmployeeRepository;
import org.example.back_end.service.EmployeeService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final ModelMapper modelMapper;

//    @Override
//    public Employee getEmployeeByEmail(String email) {
//        Employee employee = employeeRepository.findByEmail(email)
//                .orElseThrow(() -> new RuntimeException("Employee not found"));
//        return modelMapper.map(employee, Employee.class);
//    }
@Override
public Employee getEmployeeByEmail(String email) {
    // Directly return the entity; no need to map to Employee again
    return employeeRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Employee not found with email: " + email));
}


    @Override
    public Employee save(Employee employeeDTO) {
        Employee employee = modelMapper.map(employeeDTO, Employee.class);
        Employee saved = employeeRepository.save(employee);
        return modelMapper.map(saved, Employee.class);
    }


}
