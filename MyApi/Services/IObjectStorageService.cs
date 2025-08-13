namespace MyApi.Services;

public interface IObjectStorageService
{
    (string Key, string UploadUrl, string PublicUrl) PresignPut(string folder, string contentType, string? fileName);
    Task DeleteAsync(string key, CancellationToken ct = default);
    string BuildPublicUrl(string key);
}