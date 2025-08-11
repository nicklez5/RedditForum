using System.Text.Json.Serialization;
namespace MyApi.Models;
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum PageEntityType
{
    Route,
    Thread,
    Forum,
    Profile
}

public class PageVisit
{
    public long Id { get; set; }
    public string? UserId { get; set; }
    public string ClientVisitKey { get; set; } = default!;
    public Guid SessionId { get; set; }
    public PageEntityType EntityType { get; set; }

    public string Path { get; set; } = default!;

    public string? EntityId { get; set; }
    public int? EntityIntId { get; set; }
    public string? ReferrerPath { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime EndedAt { get; set; }
    public int? DurationMs { get; set; }
}
