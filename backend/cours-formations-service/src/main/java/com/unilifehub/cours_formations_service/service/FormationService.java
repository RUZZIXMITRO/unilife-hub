package com.unilifehub.cours_formations_service.service;

import com.unilifehub.cours_formations_service.dto.request.FormationRequest;
import com.unilifehub.cours_formations_service.dto.response.FormationResponse;
import com.unilifehub.cours_formations_service.entity.*;
import com.unilifehub.cours_formations_service.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FormationService {

    private final FormationRepository formationRepository;
    private final ResourceRepository resourceRepository;
    private final CategoryRepository categoryRepository;
    private final FavoriteRepository favoriteRepository;

    public List<FormationResponse> getAllFormations(String userId) {
        return formationRepository.findAll()
                .stream()
                .map(f -> toResponse(f, userId))
                .collect(Collectors.toList());
    }

    public FormationResponse getFormationById(Integer id, String userId) {
        Formation formation = formationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formation non trouvée"));
        return toResponse(formation, userId);
    }

    public FormationResponse createFormation(FormationRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));

        Resource resource = Resource.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(category)
                .build();
        resource = resourceRepository.save(resource);

        Formation formation = Formation.builder()
                .resource(resource)
                .provider(request.getProvider())
                .linkUrl(request.getLinkUrl())
                .duration(request.getDuration())
                .level(request.getLevel())
                .language(request.getLanguage())
                .isExternal(request.getIsExternal())
                .clicksCount(0)
                .build();

        return toResponse(formationRepository.save(formation), null);
    }

    public FormationResponse updateFormation(Integer id, FormationRequest request) {
        Formation formation = formationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formation non trouvée"));

        formation.getResource().setTitle(request.getTitle());
        formation.getResource().setDescription(request.getDescription());
        formation.setProvider(request.getProvider());
        formation.setLinkUrl(request.getLinkUrl());
        formation.setDuration(request.getDuration());
        formation.setLevel(request.getLevel());
        formation.setLanguage(request.getLanguage());

        return toResponse(formationRepository.save(formation), null);
    }

    public void deleteFormation(Integer id) {
        formationRepository.deleteById(id);
    }

    public List<FormationResponse> searchFormations(String keyword,
                                                    String level,
                                                    String language,
                                                    Integer categoryId,
                                                    String userId) {
        return formationRepository.searchFormations(keyword, level, language, categoryId)
                .stream()
                .map(f -> toResponse(f, userId))
                .collect(Collectors.toList());
    }

    public void incrementClicks(Integer id) {
        Formation formation = formationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formation non trouvée"));
        formation.setClicksCount(formation.getClicksCount() + 1);
        formationRepository.save(formation);
    }

    public FormationResponse toResponse(Formation formation, String userId) {
        boolean isFavorite = userId != null &&
                favoriteRepository.existsByUserIdAndResourceId(
                        userId, formation.getResource().getId());

        return FormationResponse.builder()
                .id(formation.getId())
                .resourceId(formation.getResource().getId())
                .title(formation.getResource().getTitle())
                .description(formation.getResource().getDescription())
                .categoryId(formation.getResource().getCategory().getId())
                .categoryName(formation.getResource().getCategory().getName())
                .provider(formation.getProvider())
                .linkUrl(formation.getLinkUrl())
                .duration(formation.getDuration())
                .level(formation.getLevel())
                .language(formation.getLanguage())
                .isExternal(formation.getIsExternal())
                .clicksCount(formation.getClicksCount())
                .createdAt(formation.getResource().getCreatedAt())
                .isFavorite(isFavorite)
                .build();
    }
}