using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using MyApi.Models;
namespace MyApi.Data;
public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<Forum> Forums { get; set; }
    public DbSet<Threads> Threads { get; set; }
    public DbSet<Post> Posts { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    
    public DbSet<RefreshToken> RefreshTokens { get; set; }
    public DbSet<PostVote> PostVotes { get; set; }
    public DbSet<ThreadVote> ThreadVotes { get; set; }
    
    public DbSet<Message> Messages { get; set; }

  public DbSet<PageVisit> PageVisits => Set<PageVisit>();
  protected override void OnModelCreating(ModelBuilder builder)
  {
    base.OnModelCreating(builder);
    builder.Entity<ApplicationUser>(entity =>
    {
      entity.ToTable(name: "Users");
      entity.Property(u => u.FirstName).HasMaxLength(100);
      entity.Property(u => u.LastName).HasMaxLength(100);
      entity.Property(u => u.Bio).HasMaxLength(500);
      entity.Property(u => u.ProfileImageUrl).HasMaxLength(300);
      entity.Property(u => u.BannedAt);
      entity.HasMany(u => u.Posts)
        .WithOne(p => p.Author)
        .HasForeignKey(p => p.ApplicationUserId)
        .OnDelete(DeleteBehavior.SetNull);

      entity.HasMany(u => u.Threads)
        .WithOne(t => t.Author)
        .HasForeignKey(t => t.ApplicationUserId)
        .OnDelete(DeleteBehavior.SetNull);

      entity.HasMany(u => u.Notifications)
        .WithOne(n => n.Recipient)
        .HasForeignKey(n => n.RecipientId)
        .OnDelete(DeleteBehavior.Cascade);

      entity.HasMany(u => u.RefreshTokens)
            .WithOne(t => t.User)
            .HasForeignKey(t => t.UserId)
            .IsRequired();

      entity.HasMany(u => u.Forums)
            .WithMany(f => f.Users);

      entity.HasMany(u => u.SentMessages)
            .WithOne(m => m.Sender)
            .HasForeignKey(m => m.SenderId)
            .OnDelete(DeleteBehavior.Restrict);

      entity.HasMany(u => u.ReceivedMessages)
            .WithOne(m => m.Recipient)
            .HasForeignKey(m => m.RecipientId)
            .OnDelete(DeleteBehavior.Restrict);

    });

    builder.Entity<IdentityRole>(entity =>
    {
      entity.ToTable(name: "Roles");
    });

    builder.Entity<Threads>(entity =>
    {
      entity.ToTable("Threads");

      entity.Property(t => t.Title)
        .IsRequired();
      entity.Property(t => t.Content);

      entity.HasOne(t => t.Forum)
                .WithMany(f => f.Threads)
                .HasForeignKey(t => t.ForumId)
                .OnDelete(DeleteBehavior.Cascade);

      entity.HasOne(t => t.Author)
                .WithMany(u => u.Threads)
                .HasForeignKey(t => t.ApplicationUserId)
                .OnDelete(DeleteBehavior.Cascade);

      entity.HasMany(t => t.Posts)
                .WithOne(p => p.Thread)
                .HasForeignKey(p => p.ThreadId)
                .OnDelete(DeleteBehavior.Cascade);

      entity.HasMany(t => t.Votes)
                    .WithOne(v => v.Thread)
                    .HasForeignKey(v => v.ThreadId)
                    .OnDelete(DeleteBehavior.Cascade);
    });

    builder.Entity<Post>(entity =>
    {
      entity.ToTable("Posts");

      entity.Property(p => p.Content)
        .IsRequired(false);

      entity.HasOne(p => p.Author)
        .WithMany(u => u.Posts)
        .HasForeignKey(p => p.ApplicationUserId)
        .OnDelete(DeleteBehavior.Cascade);
      entity.HasOne(p => p.Thread)
        .WithMany(t => t.Posts)
        .HasForeignKey(p => p.ThreadId)
        .OnDelete(DeleteBehavior.Cascade);

      entity.HasMany(p => p.Votes)
            .WithOne(v => v.Post)
            .HasForeignKey(v => v.PostId)
            .OnDelete(DeleteBehavior.Cascade);
      entity.HasOne(p => p.ParentPost)
            .WithMany(p => p.Replies)
            .HasForeignKey(p => p.ParentPostId)
            .OnDelete(DeleteBehavior.Restrict);
    });

    builder.Entity<Forum>(entity =>
    {
      entity.ToTable("Forums");

      entity.Property(f => f.Title)
        .IsRequired();

      entity.Property(f => f.Description);

      entity.Property(f => f.BannerUrl)
            .HasMaxLength(300);

      entity.Property(f => f.IconUrl)
            .HasMaxLength(300);

      entity.HasMany(f => f.Threads)
        .WithOne(t => t.Forum)
        .HasForeignKey(t => t.ForumId)
        .OnDelete(DeleteBehavior.Cascade);

      entity.HasMany(f => f.Users)
            .WithMany(u => u.Forums);
      entity.HasOne(f => f.Author)
            .WithMany()
            .HasForeignKey(f => f.ApplicationUserId)
            .OnDelete(DeleteBehavior.SetNull);
    });

    builder.Entity<Notification>(entity =>
    {
      entity.ToTable("Notifications");

      entity.Property(n => n.Message)
                .IsRequired()
                .HasMaxLength(1000);

      entity.Property(n => n.Url)
                    .HasMaxLength(1000);

      entity.HasOne(n => n.Recipient)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.RecipientId)
                .OnDelete(DeleteBehavior.Cascade);

      entity.HasOne(n => n.Sender)
                .WithMany()
                .HasForeignKey(n => n.SenderId)
                .OnDelete(DeleteBehavior.Cascade);
    });
    builder.Entity<RefreshToken>(token =>
    {
      token.ToTable("RefreshTokens");

      token.Property(rt => rt.Token)
                   .HasMaxLength(1000);

      token.HasOne(rt => rt.User)
                   .WithMany(u => u.RefreshTokens)
                   .HasForeignKey(rt => rt.UserId)
                   .OnDelete(DeleteBehavior.Cascade);
    });
    builder.Entity<PostVote>()
          .HasKey(pv => new { pv.UserId, pv.PostId });

    builder.Entity<PostVote>()
          .HasOne(pv => pv.User)
          .WithMany()
          .HasForeignKey(pv => pv.UserId);

    builder.Entity<PostVote>()
          .HasOne(pv => pv.Post)
          .WithMany(p => p.Votes)
          .HasForeignKey(pv => pv.PostId);

    builder.Entity<ThreadVote>()
           .HasKey(tv => new { tv.UserId, tv.ThreadId });
    builder.Entity<ThreadVote>()
           .HasOne(tv => tv.User)
           .WithMany()
           .HasForeignKey(tv => tv.UserId);
    builder.Entity<ThreadVote>()
           .HasOne(tv => tv.Thread)
           .WithMany(t => t.Votes)
           .HasForeignKey(tv => tv.ThreadId);

    builder.Entity<Message>()
           .HasOne(m => m.Sender)
           .WithMany(u => u.SentMessages)
           .HasForeignKey(m => m.SenderId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.Entity<Message>()
           .HasOne(m => m.Recipient)
           .WithMany(u => u.ReceivedMessages)
           .HasForeignKey(m => m.RecipientId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.Entity<PageVisit>()
           .HasIndex(x => new { x.UserId, x.StartedAt });
    builder.Entity<PageVisit>()
           .HasIndex(x => new { x.SessionId, x.StartedAt });
    builder.Entity<PageVisit>()
           .HasIndex(v => v.ClientVisitKey)
           .IsUnique();
  }
}