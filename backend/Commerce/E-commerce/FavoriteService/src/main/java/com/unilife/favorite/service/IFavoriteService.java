package com.unilife.favorite.service;

import com.unilife.favorite.dto.request.AddFavoriteRequest;
import com.unilife.favorite.dto.response.ApiResponse;
import com.unilife.favorite.dto.response.FavoriteResponse;

import java.util.List;

public interface IFavoriteService {
    ApiResponse<FavoriteResponse> addFavorite(String userId, AddFavoriteRequest request);
    ApiResponse<List<FavoriteResponse>> getFavorites(String userId);
    ApiResponse<Boolean> removeFavorite(String userId, String productId);
    ApiResponse<Boolean> isFavorite(String userId, String productId);
    ApiResponse<Long> getFavoriteCount(String productId);
}