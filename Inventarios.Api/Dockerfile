# ── Etapa 1: Build ────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY Inventarios.api/Inventarios.api.csproj Inventarios.api/
COPY Inventarios.api.Domain/Inventarios.api.Domain.csproj Inventarios.api.Domain/
COPY Inventarios.api.Application/Inventarios.api.Application.csproj Inventarios.api.Application/
COPY Inventarios.api.Infrastructure/Inventarios.api.Infrastructure.csproj Inventarios.api.Infrastructure/

RUN dotnet restore Inventarios.api/Inventarios.api.csproj

COPY Inventarios.api/ Inventarios.api/
COPY Inventarios.api.Domain/ Inventarios.api.Domain/
COPY Inventarios.api.Application/ Inventarios.api.Application/
COPY Inventarios.api.Infrastructure/ Inventarios.api.Infrastructure/

# Quitamos --no-restore para que resuelva paquetes correctamente
RUN dotnet publish Inventarios.api/Inventarios.api.csproj \
    -c Release \
    -o /app/publish

# ── Etapa 2: Runtime ─────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "Inventarios.api.dll"]