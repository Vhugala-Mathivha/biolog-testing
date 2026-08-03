# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ClockingSystem.Api.csproj ./
RUN dotnet restore ClockingSystem.Api.csproj

COPY . .
RUN dotnet publish ClockingSystem.Api.csproj -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Render sets the PORT env var; Program.cs binds to it.
# ASPNETCORE_URLS is a fallback for local Docker runs.
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080

ENTRYPOINT ["dotnet", "ClockingSystem.Api.dll"]
