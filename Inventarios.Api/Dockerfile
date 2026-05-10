# ── Etapa 1: Build ────────────────────────────────────────────────
# Usamos la imagen SDK de .NET 8 para compilar
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiamos los archivos de proyecto primero para aprovechar el cache de Docker
# Si el .csproj no cambia, Docker no reinstala las dependencias
COPY Inventarios.api/Inventarios.api.csproj Inventarios.api/
COPY Inventarios.api.Domain/Inventarios.api.Domain.csproj Inventarios.api.Domain/
COPY Inventarios.api.Application/Inventarios.api.Application.csproj Inventarios.api.Application/
COPY Inventarios.api.Infraestructure/Inventarios.api.Infraestructure.csproj Inventarios.api.Infraestructure/

# Restauramos dependencias NuGet
RUN dotnet restore Inventarios.api/Inventarios.api.csproj

# Copiamos el resto del código fuente
COPY Inventarios.api/ Inventarios.api/
COPY Inventarios.api.Domain/ Inventarios.api.Domain/
COPY Inventarios.api.Application/ Inventarios.api.Application/
COPY Inventarios.api.Infraestructure/ Inventarios.api.Infraestructure/

# Compilamos y publicamos en modo Release
RUN dotnet publish Inventarios.api/Inventarios.api.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

# ── Etapa 2: Runtime ─────────────────────────────────────────────
# Usamos la imagen runtime — más liviana, sin SDK
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Copiamos solo el resultado compilado de la etapa anterior
COPY --from=build /app/publish .

# Puerto que expone la API
EXPOSE 8080

# Variable de entorno para que ASP.NET Core escuche en el puerto correcto
ENV ASPNETCORE_URLS=http://+:8080

# Comando para iniciar la aplicación
ENTRYPOINT ["dotnet", "Inventarios.api.dll"]