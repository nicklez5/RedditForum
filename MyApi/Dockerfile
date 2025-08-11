# build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
RUN apt-get update && apt-get install -y curl gnupg \
  && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
  && apt-get install -y nodejs \
  && node -v && npm -v
COPY NuGet.config ./
COPY MyApi/MyApi.csproj MyApi/
# (COPY other project csproj files too if referenced)
RUN dotnet restore MyApi/MyApi.csproj

COPY . .
RUN dotnet build MyApi/MyApi.csproj -c Release --no-restore
RUN dotnet publish MyApi/MyApi.csproj -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /out .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet","MyApi.dll"]
