# MyApi/Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Node for frontend build via MSBuild target (if used)
RUN apt-get update && apt-get install -y curl gnupg \
  && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
  && apt-get install -y nodejs

# Copy config + project file using repo-root paths
COPY MyApi/NuGet.config ./
COPY MyApi/MyApi.csproj MyApi/

# First restore with no Windows fallbacks
RUN dotnet restore MyApi/MyApi.csproj --configfile NuGet.config \
    -p:RestoreAdditionalProjectFallbackFolders= -p:RestoreFallbackFolders=

# Bring in the rest (API + FrontEnd)
COPY . .

# SAFETY: if Render ignored .dockerignore earlier, wipe any copied artifacts and restore again
RUN rm -rf MyApi/bin MyApi/obj \
 && dotnet restore MyApi/MyApi.csproj --configfile NuGet.config \
      -p:RestoreAdditionalProjectFallbackFolders= -p:RestoreFallbackFolders=

# Build & publish
RUN dotnet build MyApi/MyApi.csproj -c Release --no-restore
RUN dotnet publish MyApi/MyApi.csproj -c Release -o /out --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /out .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet","MyApi.dll"]
