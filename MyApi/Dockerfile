# ---- build ----
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Node for npm ci in ../FrontEnd
RUN apt-get update && apt-get install -y curl gnupg \
  && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
  && apt-get install -y nodejs

# Copy NuGet config + project first (from MyApi/)
COPY NuGet.config ./
COPY MyApi.csproj ./

# Restore with clean config (avoid Windows fallback folders)
RUN dotnet restore ./MyApi.csproj --configfile NuGet.config \
    -p:RestoreAdditionalProjectFallbackFolders= -p:RestoreFallbackFolders=

# Bring in the whole repo (so ../FrontEnd is available)
COPY .. .

# Build & publish (Frontend built by csproj target)
#   Add -p:SkipClientBuild=true here if you want to skip React build in Docker
RUN dotnet build ./MyApi.csproj -c Release --no-restore
RUN dotnet publish ./MyApi.csproj -c Release -o /out --no-restore

# ---- runtime ----
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /out .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet","MyApi.dll"]
