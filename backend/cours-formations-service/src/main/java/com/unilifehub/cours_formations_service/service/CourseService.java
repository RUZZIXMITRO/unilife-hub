package com.unilifehub.cours_formations_service.service;

import com.unilifehub.cours_formations_service.dto.request.CourseRequest;
import com.unilifehub.cours_formations_service.dto.response.CourseResponse;
import com.unilifehub.cours_formations_service.entity.*;
import com.unilifehub.cours_formations_service.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final ResourceRepository resourceRepository;
    private final CategoryRepository categoryRepository;
    private final FavoriteRepository favoriteRepository;
    private final DownloadRepository downloadRepository;
    private final FileStorageService fileStorageService;

    public List<CourseResponse> getAllCourses(Integer userId) {
        return courseRepository.findByIsApprovedTrueOrderByResource_CreatedAtDesc()
                .stream()
                .map(c -> toResponse(c, userId))
                .collect(Collectors.toList());
    }

    public CourseResponse getCourseById(Integer id, Integer userId) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cours non trouvé"));
        // Incrémenter les vues
        course.setViewsCount(course.getViewsCount() + 1);
        courseRepository.save(course);
        return toResponse(course, userId);
    }

    public CourseResponse uploadCourse(CourseRequest request,
                                       MultipartFile file,
                                       Integer userId) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));

        // Sauvegarder le fichier
        String fileUrl = fileStorageService.saveFile(file);

        // Créer la resource
        Resource resource = Resource.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(category)
                .build();
        resource = resourceRepository.save(resource);

        // Créer le cours
        Course course = Course.builder()
                .resource(resource)
                .userId(userId)
                .fileUrl(fileUrl)
                .fileName(file.getOriginalFilename())
                .fileSize(file.getSize())
                .fileType(file.getContentType())
                .downloadsCount(0)
                .viewsCount(0)
                .isApproved(false)
                .build();

        return toResponse(courseRepository.save(course), userId);
    }

    public CourseResponse approveCourse(Integer id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cours non trouvé"));
        course.setIsApproved(true);
        return toResponse(courseRepository.save(course), null);
    }

    public void deleteCourse(Integer id) {
        courseRepository.deleteById(id);
    }

    public List<CourseResponse> searchCourses(String keyword,
                                              Integer categoryId,
                                              Integer userId) {
        return courseRepository.searchCourses(keyword, categoryId)
                .stream()
                .map(c -> toResponse(c, userId))
                .collect(Collectors.toList());
    }

    public String downloadCourse(Integer id, Integer userId) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cours non trouvé"));

        // Enregistrer le téléchargement
        if (!downloadRepository.existsByUserIdAndCourseId(userId, id)) {
            Download download = Download.builder()
                    .course(course)
                    .userId(userId)
                    .build();
            downloadRepository.save(download);
        }

        // Incrémenter le compteur
        course.setDownloadsCount(course.getDownloadsCount() + 1);
        courseRepository.save(course);

        return course.getFileUrl();
    }

    public List<CourseResponse> getMyCourses(Integer userId) {
        return courseRepository.findByUserId(userId)
                .stream()
                .map(c -> toResponse(c, userId))
                .collect(Collectors.toList());
    }

    public List<CourseResponse> getPendingCourses() {
        return courseRepository.findAll()
                .stream()
                .filter(c -> !c.getIsApproved())
                .map(c -> toResponse(c, null))
                .collect(Collectors.toList());
    }

    public CourseResponse toResponse(Course course, Integer userId) {
        boolean isFavorite = userId != null &&
                favoriteRepository.existsByUserIdAndResourceId(
                        userId, course.getResource().getId());

        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getResource().getTitle())
                .description(course.getResource().getDescription())
                .categoryId(course.getResource().getCategory().getId())
                .categoryName(course.getResource().getCategory().getName())
                .userId(course.getUserId())
                .fileUrl(course.getFileUrl())
                .fileName(course.getFileName())
                .fileType(course.getFileType())
                .fileSize(course.getFileSize())
                .downloadsCount(course.getDownloadsCount())
                .viewsCount(course.getViewsCount())
                .isApproved(course.getIsApproved())
                .createdAt(course.getResource().getCreatedAt())
                .isFavorite(isFavorite)
                .build();
    }
}