using System.ComponentModel.DataAnnotations;
using Microsoft.Identity.Client;

namespace MyApi.Models;

public class Forum
{
    public int Id { get; set; }

    [Required]
    public string? Title { get; set; }

    public string? Description { get; set; }

    public string? BannerUrl { get; set; }
    public string? IconUrl { get; set; }
    public string? IconKey { get; set; }
    public string? IconContentType { get; set; }

    public long? IconSizeBytes { get; set; }

    public int? IconWidth { get; set; }

    public int? IconHeight{ get; set; }

    public string? BannerKey { get; set; }
    public string? BannerContentType { get; set; }
    public long? BannerSizeBytes { get; set; }

    public int? BannerWidth { get; set; }

    public int? BannerHeight { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? ApplicationUserId { get; set; }
    public ApplicationUser? Author { get; set; }
    public ICollection<Threads> Threads { get; set; }  = new List<Threads>();

    public ICollection<ApplicationUser> Users { get; set; } = new List<ApplicationUser>();
}