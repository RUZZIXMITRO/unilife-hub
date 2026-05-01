package com.unilife.catalog.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI catalogOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("UniLife Hub - Catalog Service")
                        .description("Microservice catalogue produits e-commerce - MongoDB")
                        .version("1.0.0"));
    }
}
