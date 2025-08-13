using Amazon.S3;
using Amazon.S3.Model;
namespace MyApi.Services;
public sealed class S3VideoStorageService(IAmazonS3 s3, IConfiguration cfg) : IVideoStorageService
{
    private readonly IAmazonS3 _s3 = s3;
    private readonly string _bucket = cfg["S3:Bucket"] ?? Environment.GetEnvironmentVariable("S3_BUCKET")
                    ?? throw new InvalidOperationException("S3 bucket not configured");
    private readonly string _publicBase = cfg["S3:PublicBase"] ?? Environment.GetEnvironmentVariable("S3_PUBLIC_BASE")
                    ?? throw new InvalidOperationException("S3 public base not configured");

    public (string Key, string UploadUrl, string PublicUrl) PresignUpload(string contentType, string? fileName)
    {
        if (string.IsNullOrWhiteSpace(contentType) || !contentType.StartsWith("video/"))
            throw new ArgumentException("contentType must be video/*");
        var ext = System.IO.Path.GetExtension(fileName ?? "");
        if (string.IsNullOrEmpty(ext))
            ext = contentType switch { "video/mp4" => ".mp4", _ => "" };
        var key = $"videos/{Guid.NewGuid()}{ext}";
        var req = new GetPreSignedUrlRequest
        {
            BucketName = _bucket,
            Key = key,
            Verb = HttpVerb.PUT,
            Expires = DateTime.UtcNow.AddMinutes(10),
            ContentType = contentType
        };
        var url = _s3.GetPreSignedURL(req);
        return (key, url, BuildPublicUrl(key));
    }
    public async Task DeleteAsync(string key, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(key)) return;
        try { await _s3.DeleteObjectAsync(_bucket, key, ct); }
        catch { }
    }
   public string BuildPublicUrl(string key) =>
        $"{_publicBase.TrimEnd('/')}/{key.TrimStart('/')}";
}