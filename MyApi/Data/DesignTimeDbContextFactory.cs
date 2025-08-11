using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Npgsql;

namespace MyApi.Data
{
    // MyApi/Data/DesignTimeDbContextFactory.cs
public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>();

        // Always use Postgres for scaffolding migrations
        var cs = Environment.GetEnvironmentVariable("DATABASE_URL")
                 ?? "Host=localhost;Port=5432;Database=app_dev;Username=postgres;Password=postgres";

        var uri = cs.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase)
            ? new Uri(cs)
            : null;

        if (uri != null)
        {
            var u = uri.UserInfo.Split(':', 2);
            var b = new Npgsql.NpgsqlConnectionStringBuilder
            {
                Host = uri.Host, Port = uri.Port,
                Username = u[0], Password = u.Length > 1 ? u[1] : "",
                Database = uri.AbsolutePath.Trim('/'),
                SslMode = Npgsql.SslMode.Disable
            };
            options.UseNpgsql(b.ConnectionString);
        }
        else
        {
            options.UseNpgsql(cs); // regular Npgsql connection string
        }

        return new ApplicationDbContext(options.Options);
    }
}

}
