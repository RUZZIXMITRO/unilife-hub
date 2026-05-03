package com.unilife.favorite.service.impl;

import com.unilife.favorite.dto.request.AddFavoriteRequest;
import com.unilife.favorite.dto.response.ApiResponse;
import com.unilife.favorite.dto.response.FavoriteResponse;
import com.unilife.favorite.model.Favorite;
import com.unilife.favorite.repository.FavoriteRepository;
import com.unilife.favorite.service.IFavoriteService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class FavoriteServiceImpl implements IFavoriteService {

    private static final Logger log = LoggerFactory.getLogger(FavoriteServiceImpl.class);

    private final FavoriteRepository favoriteRepository;
    private final WebClient webClient;

    @Value("${services.catalog.url}")
    private String catalogUrl;

    public FavoriteServiceImpl(FavoriteRepository favoriteRepository,
                                WebClient.Builder webClientBuilder) {
        this.favoriteRepository = favoriteRepository;
        this.webClient = webClientBuilder.build();
    }

    @Override
    @Transactional
    public ApiResponse<FavoriteResponse> addFavorite(String userId, AddFavoriteRequest request) {
        if (favoriteRepository.existsByUserIdAndProductId(userId, request.getProductId())) {
            return ApiResponse.error("Ce produit est deja dans vos favoris");
        }

        Favorite favorite = new Favorite();
        favorite.setUserId(userId);
        favorite.setProductId(request.getProductId());
        favorite = favoriteRepository.save(favorite);

        FavoriteResponse response = enrichWithProduct(toResponse(favorite));
        return ApiResponse.success("Produit ajoute aux favoris", response);
    }

    @Override
    public ApiResponse<List<FavoriteResponse>> getFavorites(String userId) {
        List<Favorite> favorites = favoriteRepository.findByUserId(userId);
        List<FavoriteResponse> responses = favorites.stream()
                .map(f -> enrichWithProduct(toResponse(f)))
                .collect(Collectors.toList());
        return ApiResponse.success("Mes favoris", responses);
    }

    @Override
    @Transactional
    public ApiResponse<Boolean> removeFavorite(String userId, String productId) {
        if (!favoriteRepository.existsByUserIdAndProductId(userId, productId)) {
            return ApiResponse.error("Ce produit n est pas dans vos favoris");
        }
        favoriteRepository.deleteByUserIdAndProductId(userId, productId);
        return ApiResponse.success("Produit retire des favoris", true);
    }

    @Override
    public ApiResponse<Boolean> isFavorite(String userId, String productId) {
        boolean exists = favoriteRepository.existsByUserIdAndProductId(userId, productId);
        return ApiResponse.success(exists ? "Dans les favoris" : "Pas dans les favoris", exists);
    }

    @Override
    public ApiResponse<Long> getFavoriteCount(String productId) {
        long count = favoriteRepository.countByProductId(productId);
        return ApiResponse.success("Nombre de favoris", count);
    }

    private FavoriteResponse toResponse(Favorite favorite) {
        FavoriteResponse response = new FavoriteResponse();
        response.setId(favorite.getId());
        response.setUserId(favorite.getUserId());
        response.setProductId(favorite.getProductId());
        response.setCreatedAt(favorite.getCreatedAt());
        return response;
    }

    private FavoriteResponse enrichWithProduct(FavoriteResponse response) {
        try {
            Map product = webClient.get()
                    .uri(catalogUrl + "/api/catalog/products/" + response.getProductId())
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (product != null && Boolean.TRUE.equals(product.get("success"))) {
                Map data = (Map) product.get("data");
                if (data != null) {
                    response.setProductTitle((String) data.get("title"));
                    Object price = data.get("price");
                    if (price instanceof Number) {
                        response.setProductPrice(((Number) price).doubleValue());
                    }
                    List images = (List) data.get("images");
                    if (images != null && !images.isEmpty()) {
                        Map firstImage = (Map) images.get(0);
                        response.setProductImageUrl((String) firstImage.get("imageUrl"));
                    }
                }
            }
        } catch (Exception e) {
            log.debug("CatalogService indisponible pour produit {}", response.getProductId());
        }
        return response;
    }
}