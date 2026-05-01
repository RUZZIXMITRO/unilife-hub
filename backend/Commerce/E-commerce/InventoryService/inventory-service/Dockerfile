# =====================================================
# DOCKERFILE — InventoryService
# Multi-stage build pour réduire la taille de l'image
# =====================================================

# ── Stage 1 : Build ──────────────────────────────
FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /app

# Copier pom.xml d'abord pour utiliser le cache Docker
# Si le code change mais pas le pom.xml, Maven ne re-télécharge pas les dépendances
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copier le code source et builder
COPY src ./src
RUN mvn clean package -DskipTests -q

# ── Stage 2 : Runtime ────────────────────────────
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copier le jar depuis le stage de build
COPY --from=builder /app/target/*.jar app.jar

# Changer le propriétaire
RUN chown appuser:appgroup app.jar

USER appuser

# Port exposé
EXPOSE 8080

# Health check pour Kubernetes
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

# Lancer l'application
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-jar", "app.jar"]
