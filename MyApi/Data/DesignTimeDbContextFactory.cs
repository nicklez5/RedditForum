using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Npgsql;

namespace MyApi.Data
{
    using Microsoft.EntityFrameworkCore;
using Npgsql;
using System;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var opts = new DbContextOptionsBuilder<ApplicationDbContext>();

        var dbUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
        if (!string.IsNullOrWhiteSpace(dbUrl))
        {
            var uri = new Uri(dbUrl);

            // username:password (may be URL-encoded)
            var userInfo = uri.UserInfo.Split(':', 2);
            var username = Uri.UnescapeDataString(userInfo[0]);
            var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";

            // default port if not present
            var port = uri.Port > 0 ? uri.Port : 5432;

            var csb = new NpgsqlConnectionStringBuilder
            {
                Host = uri.Host,
                Port = port,
                Username = username,
                Password = password,
                Database = uri.AbsolutePath.TrimStart('/'),
                SslMode = Npgsql.SslMode.Require,
                TrustServerCertificate = true
            };

            // (optional) honor sslmode in query string if provided
            // e.g., postgres://.../db?sslmode=Require
            var q = uri.Query?.TrimStart('?');
            if (!string.IsNullOrEmpty(q))
            {
                foreach (var kv in q.Split('&', StringSplitOptions.RemoveEmptyEntries))
                {
                    var parts = kv.Split('=', 2);
                    if (parts.Length == 2 && parts[0].Equals("sslmode", StringComparison.OrdinalIgnoreCase))
                    {
                        if (Enum.TryParse<SslMode>(parts[1], true, out var mode)) csb.SslMode = mode;
                    }
                }
            }

            opts.UseNpgsql(csb.ConnectionString);
        }
        else
        {
            // local dev fallback
            opts.UseSqlite("Data Source=app.db");
        }

        return new ApplicationDbContext(opts.Options);
    }
}

}
