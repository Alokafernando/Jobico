package org.example.back_end.util;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService() {
        this.fileStorageLocation = Paths.get("uploads/resumes").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Could not create upload directory", ex);
        }
    }

    public String storeFile(MultipartFile file) {
        String fileName = StringUtils.cleanPath(file.getOriginalFilename());
        try {
            if(fileName.contains("..")) {
                throw new RuntimeException("Invalid file name: " + fileName);
            }

            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/resumes/" + fileName;

        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + fileName, ex);
        }
    }
}