using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Npgsql;

namespace MyApi.Data
{
    public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        public ApplicationDbContext CreateDbContext(string[] args)
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>();
            var dbUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
            if (!string.IsNullOrWhiteSpace(dbUrl))
            {
                var uri = new Uri(dbUrl);
                var userInfo = uri.UserInfo.Split(':');
                var builder = new Npgsql.NpgsqlConnectionStringBuilder
                {
                    Host = uri.Host,
                    Port = uri.Port,
                    Username = userInfo[0],
                    Password = userInfo.Length > 1 ? userInfo[1] : "",
                    Database = uri.AbsolutePath.TrimStart('/'),
                    SslMode =  Npgsql.SslMode.Require,
                    TrustServerCertificate = true
                };
                options.UseNpgsql(builder.ConnectionString);
            }
            else
            {
                options.UseSqlite("Data Source=app.db"); // <-- local dev
            }
            return new ApplicationDbContext(options.Options);
        }
        
    }
}
