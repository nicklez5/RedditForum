namespace MyApi.Models;

public class PostDto
{
    public int Id { get; set; }
    public string Content { get; set; } = string.Empty;

    public string? ImageUrl { get; set; }

    public string? ImageKey { get; set; }
    public string? ImageContentType { get; set; }
    public long?   ImageSizeBytes { get; set; }
    public int?    ImageWidth { get; set; }
    public int?    ImageHeight { get; set; }
    public string AuthorUsername { get; set; } = string.Empty;

    public string? ProfileImageUrl { get; set; } = string.Empty;

    public int? ParentPostId { get; set; }
    public int ThreadId { get; set; }
    public DateTime CreatedAt { get; set; }

    public int LikeCount { get; set; }
    public int UserVote { get; set; }
    public string? VideoKey { get; set; }
    public string? VideoUrl { get; set; }
    public string? VideoContentType { get; set; }
    public long? VideoSizeBytes { get; set; }
    public double? VideoDurationSec { get; set; }
    public List<PostDto> Replies { get; set; } = new();
}
public class PostVoteDto
{
    public int PostId { get; set; }
    public int Vote { get; set; }
}