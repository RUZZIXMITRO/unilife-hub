FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY target/cours-formations-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]