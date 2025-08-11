FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Node for frontend build (if your csproj runs npm)
RUN apt-get update && apt-get install -y curl gnupg \
  && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
  && apt-get install -y nodejs

# Copy NuGet config + project using repo-root context paths
COPY MyApi/NuGet.config ./
COPY MyApi/MyApi.csproj MyApi/

# Restore
RUN dotnet restore MyApi/MyApi.csproj --configfile NuGet.config \
    -p:RestoreAdditionalProjectFallbackFolders= -p:RestoreFallbackFolders=

# Bring in the rest of the repo (API + FrontEnd)
COPY . .

# Build/Publish (your csproj can run npm in ../FrontEnd)
RUN dotnet build MyApi/MyApi.csproj -c Release --no-restore
RUN dotnet publish MyApi/MyApi.csproj -c Release -o /out --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /out .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet","MyApi.dll"]
