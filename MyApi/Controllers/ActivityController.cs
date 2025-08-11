using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MyApi.Data;
using MyApi.Models;
namespace MyApi.Controllers;

public record VisitStartDto(
    PageEntityType EntityType,
    string ClientVisitKey,
    string Path,
    string? EntityId,
    int? EntityIntId,
    string? ReferrerPath,
    DateTime StartedAt
);

public record VisitEndDto(long VisitId, int DurationMs);

[ApiController]
[Route("api/activity")]
public class ActivityController(ApplicationDbContext db, UserManager<ApplicationUser> users) : ControllerBase
{
    private readonly ApplicationDbContext _db = db;
    private readonly UserManager<ApplicationUser> _users = users;

    private Guid EnsureSessionId()
    {
        const string cookieName = "sid";
        if (Request.Cookies.TryGetValue(cookieName, out var val) && Guid.TryParse(val, out var s))
            return s;
        var sid = Guid.NewGuid();
        Response.Cookies.Append(cookieName, sid.ToString(), new CookieOptions
        {
            HttpOnly = true,
            SameSite = SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.AddMonths(6)
        });
        return sid;
    }
    [HttpPost("visit")]
    public async Task<ActionResult<long>> StartVisit([FromBody] VisitStartDto dto)
    {
        var userId = _users.GetUserId(User);
        var session = EnsureSessionId();
        var existing = await _db.PageVisits.FirstOrDefaultAsync(v => v.ClientVisitKey == dto.ClientVisitKey);
        if (existing != null) return Ok(existing.Id);
        var visit = new PageVisit
        {
            ClientVisitKey = dto.ClientVisitKey,
            UserId = userId,
            SessionId = session,
            EntityType = dto.EntityType,
            EntityIntId = dto.EntityIntId,
            Path = dto.Path,
            EntityId = dto.EntityId,
            ReferrerPath = dto.ReferrerPath,
            StartedAt = DateTime.UtcNow
        };
        _db.PageVisits.Add(visit);
        await _db.SaveChangesAsync();
        return Ok(visit.Id);
    }
    [HttpPost("visit/end")]
    public async Task<IActionResult> EndVisit([FromBody] VisitEndDto dto)
    {
        var visit = await _db.PageVisits.FindAsync(dto.VisitId);
        if (visit == null) return NotFound();
        visit.DurationMs = dto.DurationMs;
        visit.EndedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok();
    }
    [HttpGet("history")]
    public async Task<ActionResult<IEnumerable<VisitItemDto>>> GetHistory([FromQuery] int take = 100)
    {
        take = Math.Clamp(take, 1, 500);

        var uid = _users.GetUserId(User);
        var sid = EnsureSessionId();

        var q = _db.PageVisits
                   .Where(v => (uid != null && v.UserId == uid) || (uid == null && v.SessionId == sid))
                   .OrderByDescending(v => v.StartedAt)
                   .Take(take);

        var items = await q
                        .Select(v => new VisitItemDto
                        {
                            Id = v.Id,
                            Kind = v.EntityType == PageEntityType.Forum ? "r/" + _db.Forums.Where(f => f.Id == v.EntityIntId).Select(f => f.Title).FirstOrDefault()
                                : v.EntityType == PageEntityType.Profile ? "u/" + _db.Users.Where(u => u.Id == v.EntityId).Select(u => u.UserName).FirstOrDefault()
                                : v.EntityType == PageEntityType.Thread  ? "Thread"
                                : "Route",
                            Title = v.EntityType == PageEntityType.Thread ? _db.Threads.Where(t => t.Id == v.EntityIntId).Select(t => t.Title).FirstOrDefault()
                                    : v.EntityType == PageEntityType.Forum ? _db.Forums.Where(f => f.Id == v.EntityIntId).Select(f => f.Description).FirstOrDefault()
                                    : v.Path,
                            Url = v.EntityType == PageEntityType.Thread ? "/threads/" + v.EntityIntId
                                : v.EntityType == PageEntityType.Forum ? "/forum/" + v.EntityIntId
                                : v.EntityType == PageEntityType.Profile ? "/profile/" + v.EntityId
                                : v.Path,
                            StartedAt = v.StartedAt,
                            DurationMs = v.DurationMs
                        }).ToListAsync();
        
        return Ok(items);
    }
    [Authorize]
    [HttpDelete("history")]
    public async Task<IActionResult> ClearHistory()
    {
        var userId = _users.GetUserId(User);
        var toRemove = _db.PageVisits.Where(v => v.UserId == userId);
        _db.PageVisits.RemoveRange(toRemove);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}