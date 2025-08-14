// MyApi/Data/DesignTimeDbContextFactory.cs
using System;
using Microsoft.AspNetCore.WebUtilities;      // QueryHelpers
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Npgsql;

namespace MyApi.Data;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        // Prefer (in order): DATABASE_URL (Render-style), DESIGNTIME_PG (local override), or a local PG default
        var urlOrConn =
            Environment.GetEnvironmentVariable("DATABASE_URL") ??
            Environment.GetEnvironmentVariable("DESIGNTIME_PG") ??
            "Host=localhost;Port=5432;Database=mydb;Username=postgres;Password=postgres";

        var connString = ToNpgsqlConnectionString(urlOrConn);

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseNpgsql(connString, npg => npg.EnableRetryOnFailure())
            .Options;

        return new ApplicationDbContext(options);
    }

    private static string ToNpgsqlConnectionString(string input)
    {
        // If caller already provided a keyword connection string, just return it
        if (!input.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) &&
            !input.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        {
            return input;
        }

        var uri = new Uri(input);

        // user:pass (URL-encoded)
        var parts = uri.UserInfo.Split(':', 2);
        var user = Uri.UnescapeDataString(parts[0]);
        var pass = parts.Length > 1 ? Uri.UnescapeDataString(parts[1]) : "";

        var csb = new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.IsDefaultPort ? 5432 : uri.Port,
            Username = user,
            Password = pass,
            Database = uri.AbsolutePath.Trim('/'),

            // Safe defaults for managed hosts unless overridden via query
            SslMode = SslMode.Require,
            TrustServerCertificate = true
        };

        // Merge query params (sslmode, search_path, pooling, etc.)
        var qp = QueryHelpers.ParseQuery(uri.Query);
        foreach (var kv in qp)
        {
            csb[kv.Key] = kv.Value.ToString(); // Npgsql keywords are case-insensitive
        }

        return csb.ToString();
    }
}
