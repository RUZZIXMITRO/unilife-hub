# AgendaTodoService - Guide d integration

## Microservice : Agenda et To-Do List

### Technologies
- .NET 9
- Entity Framework Core 9 (Code First avec Migrations)
- SQL Server
- JWT (UniLifeHub)
- Background Services pour notifications automatiques

### Routes exposees

#### Events (Agenda)
- GET    /api/agenda/events
- GET    /api/agenda/events/calendar?view=daily|weekly|monthly&date=YYYY-MM-DD
- GET    /api/agenda/events/{id}
- POST   /api/agenda/events
- PUT    /api/agenda/events/{id}
- DELETE /api/agenda/events/{id}

#### Todos
- GET    /api/todo/tasks
- GET    /api/todo/tasks/overdue
- GET    /api/todo/tasks/pending
- GET    /api/todo/tasks/{id}
- POST   /api/todo/tasks
- PUT    /api/todo/tasks/{id}
- PATCH  /api/todo/tasks/{id}/complete
- DELETE /api/todo/tasks/{id}

#### Notifications (interne)
- GET    /api/notifications
- GET    /api/notifications/unread-count
- PATCH  /api/notifications/{id}/read
- PATCH  /api/notifications/read-all
- DELETE /api/notifications/{id}

## Configuration pour le Gateway YARP

Ajouter dans le `appsettings.json` du ApiGateway :

### Routes (a ajouter dans la section Routes)

```json
"agenda-route": {
  "ClusterId": "agenda-cluster",
  "AuthorizationPolicy": "default",
  "Match": {
    "Path": "/api/agenda/{**catch-all}"
  }
},
"todo-route": {
  "ClusterId": "agenda-cluster",
  "AuthorizationPolicy": "default",
  "Match": {
    "Path": "/api/todo/{**catch-all}"
  }
},
"notifications-route": {
  "ClusterId": "agenda-cluster",
  "AuthorizationPolicy": "default",
  "Match": {
    "Path": "/api/notifications/{**catch-all}"
  }
}
```

### Cluster (a ajouter dans la section Clusters)

```json
"agenda-cluster": {
  "Destinations": {
    "dest": { "Address": "http://agendaservice" }
  }
}
```

## Configuration Docker Compose

Ajouter dans le `docker-compose.yml` :

```yaml
agendaservice:
  image: agendaservice
  build:
    context: ./AgendaTodoService
    dockerfile: Dockerfile
  ports:
    - "5254:80"
  environment:
    - ASPNETCORE_ENVIRONMENT=Production
    - ASPNETCORE_URLS=http://+:80
    - ConnectionStrings__DefaultConnection=Server=agenda-db,1433;Database=agenda_todo_db;User=sa;Password=YourStrong@Pass123;TrustServerCertificate=True;
    - Jwt__Key=SuperSecretKeyForJWTAuthentication2024VeryLongAndComplexKey!@#$%^&*()
    - Jwt__Issuer=UniLifeHub
    - Jwt__Audience=UniLifeHubUsers
  depends_on:
    - agenda-db
  networks:
    - app-network
  restart: unless-stopped

agenda-db:
  image: mcr.microsoft.com/mssql/server:2022-latest
  environment:
    - ACCEPT_EULA=Y
    - MSSQL_SA_PASSWORD=YourStrong@Pass123
  ports:
    - "1434:1433"
  volumes:
    - agenda-data:/var/opt/mssql
  networks:
    - app-network

# Ne pas oublier dans la section volumes :
# volumes:
#   agenda-data:
```

## Convention JWT (alignee equipe)
- Issuer: UniLifeHub
- Audience: UniLifeHubUsers
- Key: meme cle que les autres services

## Auteur
BENCHOUIAT Yousra et collegues - 4GI-D - PFA UniLife Hub