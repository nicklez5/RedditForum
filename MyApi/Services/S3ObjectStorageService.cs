namespace MyApi.Services;
using Amazon.S3;
using Amazon.S3.Model;

public sealed class S3ObjectStorageService(IAmazonS3 s3, IConfiguration cfg) : IObjectStorageService
{
    private readonly IAmazonS3 _s3 = s3;
    private readonly string _bucket = cfg["S3:Bucket"] ?? Environment.GetEnvironmentVariable("S3_BUCKET") ?? throw new("S3 bucket not configured");
    private readonly string _publicBase = cfg["S3:PublicBase"] ?? Environment.GetEnvironmentVariable("S3_PUBLIC_BASE") ?? throw new("S3 public base not configured");

    public (string Key, string UploadUrl, string PublicUrl) PresignPut(string folder, string contentType, string? fileName)
    {
        if (string.IsNullOrWhiteSpace(contentType)) throw new ArgumentException("contentType required");

        var ext = Path.GetExtension(fileName ?? "");
        if (string.IsNullOrEmpty(ext))
            ext = contentType switch {
                "image/png"  => ".png",
                "image/jpeg" => ".jpg",
                "image/webp" => ".webp",
                _ => ""
            };

        folder = folder.Trim('/'); // e.g., "images/posts"
        var key = $"{folder}/{Guid.NewGuid()}{ext}";

        var url = _s3.GetPreSignedURL(new GetPreSignedUrlRequest {
            BucketName = _bucket,
            Key = key,
            Verb = HttpVerb.PUT,
            Expires = DateTime.UtcNow.AddMinutes(10),
            ContentType = contentType
        });

        return (key, url, BuildPublicUrl(key));
    }

    public async Task DeleteAsync(string key, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(key)) return;
        try { await _s3.DeleteObjectAsync(_bucket, key, ct); } catch { /* log */ }
    }

    public string BuildPublicUrl(string key) => $"{_publicBase.TrimEnd('/')}/{key}";
}
