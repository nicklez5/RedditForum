# build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY MyApi/MyApi.csproj MyApi/
# (COPY other project csproj files too if referenced)
RUN dotnet restore MyApi/MyApi.csproj

COPY . .
RUN dotnet publish MyApi/MyApi.csproj -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /out .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet","MyApi.dll"]
