package com.unilife.inventory.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration Swagger / OpenAPI.
 * SOLID - S : responsabilité unique = configurer la documentation API.
 */
@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI inventoryOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("UniLife Hub — Inventory Service")
                        .description("Microservice de gestion du stock des produits e-commerce")
                        .version("1.0.0"));
    }
}
