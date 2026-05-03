# Stage 1 : Build
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN for i in 1 2 3 4 5; do \
      mvn clean package -DskipTests -B \
        -Dmaven.wagon.http.pool=false \
        -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 \
        && break \
      || echo "Tentative $i echouee, retry dans 10s..." && sleep 10; \
    done

# Stage 2 : Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
EXPOSE 8081
COPY --from=build /app/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]