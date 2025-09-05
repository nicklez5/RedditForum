# MyApi/Dockerfile
FROM node:20-alpine AS fe
WORKDIR /fe
# copy only manifests first for better caching
COPY FrontEnd/package*.json ./
RUN npm ci
# now copy the rest and build
COPY FrontEnd/ ./
# If API+SPA share the same origin in prod, you can leave baseURL empty in code.
# If you need a value at build time, uncomment ARG/ENV and set --build-arg on Render.
# ARG REACT_APP_API_BASE_URL
# ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL
RUN npm run build

# ---- 2) Build & publish backend ----
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
# copy csproj(s) & restore first
COPY MyApi/*.csproj ./MyApi/
RUN dotnet restore MyApi/MyApi.csproj
# copy the rest and publish
COPY . .
# IMPORTANT: skip the MSBuild client target since we already built it in "fe"
RUN dotnet publish MyApi/MyApi.csproj -c Release -o /app/out /p:SkipClientBuild=true

# ---- 3) Assemble runtime image ----
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
# copy published backend
COPY --from=build /app/out ./
# copy React build into wwwroot
RUN mkdir -p /app/wwwroot
COPY --from=fe /fe/build/ /app/wwwroot/
# listen on 8080 (Render default for Docker Web Services)
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
EXPOSE 8080
ENTRYPOINT ["dotnet","MyApi.dll"]
