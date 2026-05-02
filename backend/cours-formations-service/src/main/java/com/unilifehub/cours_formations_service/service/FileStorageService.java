package com.unilifehub.cours_formations_service.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.upload.path}")
    private String uploadPath;

    public String saveFile(MultipartFile file) {
        try {
            Path uploadDir = Paths.get(uploadPath);
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = uploadDir.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

           // return uploadPath + "/" + fileName;
            return "/uploads/" + fileName;  // remplace uploadPath + "/" + fileName
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de la sauvegarde du fichier", e);
        }
    }

    public void deleteFile(String fileUrl) {
        try {
            Path filePath = Paths.get(fileUrl);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de la suppression du fichier", e);
        }
    }
}