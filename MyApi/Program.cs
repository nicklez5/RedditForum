using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.IdentityModel.Tokens.Experimental;
using MyApi.Data;
using MyApi.Helpers;
using MyApi.Models;
using MyApi.Services;
using Microsoft.AspNetCore.HttpOverrides;
using Npgsql;
using Amazon.S3;
using Amazon.S3.Model;
var builder = WebApplication.CreateBuilder(args);
var allowedOrigins = builder.Configuration["Cors:Origins"]?
    .Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    ?? Array.Empty<string>();

builder.Services.AddScoped<NotificationService>();
builder.Services.AddScoped<IEmailService, SendGridEmailService>();
builder.Services.AddScoped<ForumService>();
builder.Services.AddScoped<ThreadService>();
builder.Services.AddScoped<PostService>();
builder.Services.AddScoped<ProfileService>();
builder.Services.AddScoped<IMessageService, MessageService>();
var dbUrl = builder.Configuration["DATABASE_URL"] 
         ?? Environment.GetEnvironmentVariable("DATABASE_URL");

    if (!string.IsNullOrWhiteSpace(dbUrl))
    {
        var uri = new Uri(dbUrl);

        var userInfo = uri.UserInfo.Split(':', 2);
        var username = Uri.UnescapeDataString(userInfo[0]);
        var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";

        var csb = new Npgsql.NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.IsDefaultPort ? 5432 : uri.Port,
            Username = username,
            Password = password,
            Database = uri.AbsolutePath.TrimStart('/'),
            // Respect existing query params (e.g., sslmode=require)
        };

        // Copy any query params from the URL (sslmode, pooling, etc.)
        var query = System.Web.HttpUtility.ParseQueryString(uri.Query);
        foreach (string? key1 in query.AllKeys)
        {
            if (!string.IsNullOrEmpty(key1))
                csb[key1] = query[key1]; // e.g. csb["Ssl Mode"] = "Require"
        }

        // If sslmode wasn't present, enforce it in prod
        if (!csb.TryGetValue("Ssl Mode", out _))
            csb.SslMode = Npgsql.SslMode.Require;

        builder.Services.AddDbContext<ApplicationDbContext>(o =>
            o.UseNpgsql(csb.ConnectionString));
    }
    else
    {
        // Local dev fallback
        builder.Services.AddDbContext<ApplicationDbContext>(o =>
            o.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));
    }



builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.JsonSerializerOptions.PropertyNameCaseInsensitive = false;
});

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequiredLength = 8;

    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.User.AllowedUserNameCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._";
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();
var keyString = builder.Configuration["Jwt:Key"]
                ?? throw new InvalidOperationException("Jwt:Key missing");
var keyBytes  = Encoding.UTF8.GetBytes(keyString);
var key       = new SymmetricSecurityKey(keyBytes);
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = key,
        ClockSkew = TimeSpan.Zero
    };
    options.MapInboundClaims = false;
});
var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
builder.Services.AddAuthorizationBuilder()
    .AddPolicy("RequireAdminRole", policy =>
        policy.RequireRole("Admin"));
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        if (allowedOrigins.Length > 0)
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        else
            policy.WithOrigins("http://localhost:3000")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
    });
});
builder.Services.Configure<ForwardedHeadersOptions>(o =>
{
    o.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    o.KnownNetworks.Clear();
    o.KnownProxies.Clear();
});
builder.Services.AddSingleton<IAmazonS3>(_ =>
{
    var cfg = new AmazonS3Config
    {
        RegionEndpoint = Amazon.RegionEndpoint.GetBySystemName(
            Environment.GetEnvironmentVariable("AWS_REGION") ?? "us-east-2"
        )
    };
    return new AmazonS3Client(cfg);
});
builder.Services.AddSingleton<IAssetUrlBuilder, AssetUrlBuilder>();
builder.Services.AddSingleton<IVideoStorageService, S3VideoStorageService>();
builder.Services.AddSingleton<IObjectStorageService, S3ObjectStorageService>();
// Add services to the container.
var app = builder.Build();

app.UseForwardedHeaders();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await db.Database.MigrateAsync();
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    await RoleHelper.EnsureRolesCreated(roleManager);

    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
    await SeedData.SeedAdminUser(userManager);
}
app.UseCors("AllowFrontend");
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapFallbackToFile("/index.html");

app.Run();


