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

    public List<CourseResponse> getAllCourses(String userId) {
        return courseRepository.findByIsApprovedTrueOrderByResource_CreatedAtDesc()
                .stream()
                .map(c -> toResponse(c, userId))
                .collect(Collectors.toList());
    }

    public CourseResponse getCourseById(Integer id, String userId) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cours non trouvé"));
        course.setViewsCount(course.getViewsCount() + 1);
        courseRepository.save(course);
        return toResponse(course, userId);
    }

    public CourseResponse uploadCourse(CourseRequest request, MultipartFile file, String userId) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));
        String fileUrl = fileStorageService.saveFile(file);
        Resource resource = Resource.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(category)
                .build();
        resource = resourceRepository.save(resource);
        Course course = Course.builder()
                .resource(resource)
                .userId(Math.abs(userId.hashCode()))
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
    downloadRepository.deleteByCourseId(id);
    courseRepository.deleteById(id);
}

    public List<CourseResponse> searchCourses(String keyword, Integer categoryId, String userId) {
        return courseRepository.searchCourses(keyword, categoryId)
                .stream()
                .map(c -> toResponse(c, userId))
                .collect(Collectors.toList());
    }

    public String downloadCourse(Integer id, String userId) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cours non trouvé"));
        Integer uid = Math.abs(userId.hashCode());
        if (!downloadRepository.existsByUserIdAndCourseId(uid, id)) {
            Download download = Download.builder()
                    .course(course)
                    .userId(uid)
                    .build();
            downloadRepository.save(download);
        }
        course.setDownloadsCount(course.getDownloadsCount() + 1);
        courseRepository.save(course);
        return course.getFileUrl();
    }

    public List<CourseResponse> getMyCourses(String userId) {
        return courseRepository.findByUserId(Math.abs(userId.hashCode()))
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

    public CourseResponse toResponse(Course course, String userId) {
        boolean isFavorite = userId != null &&
                favoriteRepository.existsByUserIdAndResourceId(userId, course.getResource().getId());
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