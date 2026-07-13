FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY api.fluvimar.controle-de-atestados-ddd.sln .
COPY api.fluvimar.controle-de-atestados-ddd/api.fluvimar.interfaces.csproj api.fluvimar.controle-de-atestados-ddd/
COPY api.fluvimar.application/api.fluvimar.application.csproj api.fluvimar.application/
COPY api.fluvimar.domain/api.fluvimar.domain.csproj api.fluvimar.domain/
COPY api.fluvimar.infrastructure/api.fluvimar.infrastructure.csproj api.fluvimar.infrastructure/
RUN dotnet restore api.fluvimar.controle-de-atestados-ddd/api.fluvimar.interfaces.csproj

COPY . .
RUN dotnet publish api.fluvimar.controle-de-atestados-ddd/api.fluvimar.interfaces.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "api.fluvimar.interfaces.dll"]
