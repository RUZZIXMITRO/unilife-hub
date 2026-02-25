# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copier tout le code source
COPY . .

# Restaurer les dépendances
RUN dotnet restore

# Build du projet en Release
RUN dotnet build -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Exposer les ports
EXPOSE 80
EXPOSE 443

# Copier les fichiers publiés
COPY --from=publish /app/publish .

# Point d'entrée
ENTRYPOINT ["dotnet", "UserService.dll"]