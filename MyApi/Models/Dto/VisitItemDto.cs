namespace MyApi.Models;

public class VisitItemDto
{
    public long Id { get; set; }
    public string Kind { get; set; }
    public string Url { get; set; }
    public int? DurationMs { get; set; }
    public string Title { get; set; } // <-- add
    public DateTime StartedAt { get; set; }
}