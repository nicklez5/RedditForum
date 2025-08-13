using MyApi.Models;
using MyApi.Data;
using MyApi.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration.UserSecrets;
using Microsoft.EntityFrameworkCore.Metadata;
namespace MyApi.Services;
public interface IAssetUrlBuilder
{
    string Build(string key);
    string? BuildOrNull(string? key);
}

public sealed class AssetUrlBuilder : IAssetUrlBuilder
{
    private readonly string _base;

    public AssetUrlBuilder(IConfiguration cfg)
    {
        _base = (cfg["S3:PublicBase"]            // appsettings.json: { "S3": { "PublicBase": "https://..." } }
              ?? Environment.GetEnvironmentVariable("S3_PUBLIC_BASE"))
              ?? throw new InvalidOperationException("S3 public base not configured");

        _base = _base.TrimEnd('/');
    }

    public string Build(string key)         => $"{_base}/{key.TrimStart('/')}";
    public string? BuildOrNull(string? key) => string.IsNullOrWhiteSpace(key) ? null : Build(key!);
}
