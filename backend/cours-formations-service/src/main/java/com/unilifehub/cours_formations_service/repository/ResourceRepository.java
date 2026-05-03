package com.unilifehub.cours_formations_service.repository;

import com.unilifehub.cours_formations_service.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Integer> {
    List<Resource> findByCategoryId(Integer categoryId);
    List<Resource> findByTitleContainingIgnoreCase(String title);
}