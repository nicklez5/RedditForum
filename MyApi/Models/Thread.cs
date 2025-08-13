using System.ComponentModel.DataAnnotations;

namespace MyApi.Models;

public class Threads
{
    public int Id { get; set; }

    [Required]
    public string? Title { get; set; }

    public string? ImageUrl { get; set; }
    public string? ImageKey { get; set; }
    public string? ImageContentType { get; set; }
    public long?   ImageSizeBytes { get; set; }
    public int?    ImageWidth { get; set; }
    public int?    ImageHeight { get; set; }
    public string? Content { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int ForumId { get; set; }

    public Forum? Forum { get; set; }

    public string? ApplicationUserId { get; set; }

    public ApplicationUser? Author { get; set; }

    public string? VideoKey { get; set; }
    public string? VideoUrl { get; set; }
    public string? VideoContentType { get; set; }
    public long? VideoSizeBytes { get; set; }

    public double? VideoDurationSec { get; set; }

    public int LikeCount { get; set; }
    public ICollection<Post>? Posts { get; set; }

    public ICollection<ThreadVote> Votes { get; set; } = new List<ThreadVote>();
}