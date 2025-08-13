using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Client;

namespace MyApi.Models;

public class Post
{
    public int Id { get; set; }

    public string? Content { get; set; }

    public string? ImageUrl { get; set; }
    public string? ImageKey { get; set; }
    public string? ImageContentType { get; set; }
    public long?   ImageSizeBytes { get; set; }
    public int?    ImageWidth { get; set; }
    public int?    ImageHeight { get; set; }

    public string? ApplicationUserId { get; set; }
    public ApplicationUser? Author { get; set; }

    public Threads? Thread { get; set; }
    public int ThreadId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int? ParentPostId { get; set; }
    public Post? ParentPost { get; set; }
    public int LikeCount { get; set; }
    public string? VideoKey { get; set; }
    public string? VideoUrl { get; set; }
    public string? VideoContentType { get; set; }
    public long? VideoSizeBytes { get; set; }
    public double? VideoDurationSec { get; set; }
    public ICollection<PostVote> Votes { get; set; } = new List<PostVote>();

    public ICollection<Post> Replies { get; set; } = new List<Post>();
}