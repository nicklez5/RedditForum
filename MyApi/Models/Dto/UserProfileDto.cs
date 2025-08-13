namespace MyApi.Models;

public class UserProfileDto
{
    public string? Id { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Username { get; set; }
    public string? Bio { get; set; }
    public string? Email { get; set; }
    public string? ProfileImageUrl { get; set; } = "https://www.redditstatic.com/avatars/avatar_default_02_FF4500.png";
    public string? ProfileImageKey { get; set; }
    public DateTime DateJoined { get; set; }
    public int PostCount { get; set; }
    public int Reputation { get; set; }
    public bool IsModerator { get; set; }
    public bool IsBanned { get; set; }

    public DateTime? BannedAt { get; set; }
}
public class UserProfileSummaryDto
{
    public string? Username { get; set; }
    public string? Bio { get; set; }
    public string? ProfileImageUrl { get; set; }
    public DateTime DateJoined { get; set; }
    public int PostCount { get; set; }
    public int Reputation { get; set; }
    public bool IsModerator { get; set; }
    public bool IsBanned { get; set; }
    public DateTime? BannedAt { get; set; }
}