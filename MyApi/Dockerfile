# build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /MyApi
COPY . .
RUN dotnet restore MyApi.csproj
RUN dotnet publish MyApi.csproj -c Release -o /app

# run
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app .
# Render sets $PORT; ASP.NET will bind automatically if you don't override Kestrel URLs.
ENV ASPNETCORE_URLS=http://0.0.0.0:${PORT}
ENTRYPOINT ["dotnet", "MyApi.dll"]