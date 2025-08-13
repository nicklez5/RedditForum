namespace MyApi.Services;

public interface IVideoStorageService
{
    (string Key, string UploadUrl, string PublicUrl) PresignUpload(string contentType, string? fileName);
    Task DeleteAsync(string key, CancellationToken ct = default);
    string BuildPublicUrl(string key);
}