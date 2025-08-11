# build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY MySolution.sln ./
COPY MyApi/MyApi.csproj ./MyApi/
# (COPY other project csproj files too if referenced)
RUN dotnet restore ./MySolution.sln

COPY . ./
RUN dotnet publish ./MyApi/MyApi.csproj -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet","MyApi.dll"]
