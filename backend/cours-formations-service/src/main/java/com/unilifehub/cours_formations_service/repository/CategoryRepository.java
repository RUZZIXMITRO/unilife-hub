package com.unilifehub.cours_formations_service.repository;

import com.unilifehub.cours_formations_service.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {
    List<Category> findByParentCategoryIsNull();
    List<Category> findByParentCategoryId(Integer parentId);
    boolean existsByName(String name);
}