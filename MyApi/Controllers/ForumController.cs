using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyApi.Data;
using MyApi.Models;
using MyApi.Services;

namespace MyApi.Controllers;
public record PresignResponse(string Key, string Url, string PublicUrl);
public record AttachImageDto( string Key, string Url, string ContentType, long SizeBytes, int? Width, int? Height);
[ApiController]
[Route("api/[controller]")]
public class ForumController(UserManager<ApplicationUser> userManager,ForumService forumService) : ControllerBase
{
    private readonly ForumService _forumService = forumService;
    private readonly UserManager<ApplicationUser> _userManager = userManager;
    [HttpPost]
    public async Task<IActionResult> CreateForum([FromForm] CreateForumDto dto)
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return Unauthorized();
        
        var forum = await _forumService.CreateForumAsync(dto.Title, dto.Description!, userId);
        return Ok(forum);
    }
    [HttpPut("{id}")]
    public async Task<IActionResult> EditForum(int id, [FromForm] EditForumDto dto)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();
        var forum = await _forumService.GetForumByIdAsync(id);
        if(forum == null)
            return NotFound("Forum not found.");

        if (forum.Author != user.UserName && !await _userManager.IsInRoleAsync(user, "Admin"))
        {
            return Unauthorized("You are not the admin of this forum");
        }
        
        var success = await _forumService.UpdateForumAsync(id, dto.Title, dto.Description);
        return success ? Ok(await _forumService.GetForumByIdAsync(id)) : NotFound("Forum not found");
    }
    [HttpPost("presign/icon")]
    public async Task<ActionResult<PresignResponse>> PresignIcon([FromQuery] string contentType, [FromQuery] string? fileName)
    {
        if (!contentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
            return BadRequest("contentType must be image/*");

        var (key,url,publicUrl) = await _forumService.PresignIcon(contentType, fileName);
        return Ok(new PresignResponse(key, url, publicUrl ));
        
    }
    [HttpPost("presign/banner")]
    public async Task<ActionResult<PresignResponse>> PresignBanner([FromQuery] string contentType, [FromQuery] string? fileName)
    {
        if (!contentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
            return BadRequest("contentType must be image/*");

        var (key,url,publicUrl) = await _forumService.PresignBanner(contentType, fileName);
        return Ok(new PresignResponse(key, url, publicUrl ));
        
    }
    [HttpPost("{id}/icon")]
    public async Task<IActionResult> SetIcon(int id, [FromBody] AttachImageDto dto)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();
        var forum = await _forumService.GetForumByIdAsync(id);
        if (forum == null)
            return NotFound("Forum not found");
        if (forum.Author != user.UserName && !await _userManager.IsInRoleAsync(user, "Admin"))
        {
            return Unauthorized("You are not allowed to delete this forum");
        }
        var success = await _forumService.AttachIconAsync(id, dto.Key, dto.Url, dto.ContentType, dto.SizeBytes, dto.Width, dto.Height);
        return success
            ? Ok(await _forumService.GetForumByIdAsync(id))
            : NotFound("Forum not found");
    }
    [HttpPost("{id}/banner")]
    public async Task<IActionResult> SetBanner(int id, [FromBody] AttachImageDto dto)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();
        var forum = await _forumService.GetForumByIdAsync(id);
        if (forum == null)
            return NotFound("Forum not found");
        if (forum.Author != user.UserName && !await _userManager.IsInRoleAsync(user, "Admin"))
        {
            return Unauthorized("You are not allowed to delete this forum");
        }
        var success = await _forumService.AttachBannerAsync(id, dto.Key, dto.Url, dto.ContentType, dto.SizeBytes, dto.Width, dto.Height);
        return success
            ? Ok(await _forumService.GetForumByIdAsync(id))
            : NotFound("Forum not found");
    }
    [HttpDelete("{id}/banner")]
    public async Task<IActionResult> DeleteBanner(int id)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();

        var forum = await _forumService.GetForumByIdAsync(id);
        if (forum == null)
            return NotFound("Forum not found");
        if (forum.Author != user.UserName && !await _userManager.IsInRoleAsync(user, "Admin"))
        {
            return Unauthorized("You are not allowed to edit this forum");
        }
        var success = await _forumService.DeleteBannerAsync(id);
        return success
            ? Ok(await _forumService.GetForumByIdAsync(id))
            : NotFound("Forum not found");
    }
    [HttpDelete("{id}/icon")]
    public async Task<IActionResult> DeleteIcon(int id)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();

        var forum = await _forumService.GetForumByIdAsync(id);
        if (forum == null)
            return NotFound("Forum not found");
        if (forum.Author != user.UserName && !await _userManager.IsInRoleAsync(user, "Admin"))
        {
            return Unauthorized("You are not allowed to edit this forum");
        }
        var success = await _forumService.DeleteIconAsync(id);
        return success
            ? Ok(await _forumService.GetForumByIdAsync(id))
            : NotFound("Forum not found");
    }
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteForum(int id)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();
        var forum = await _forumService.GetForumByIdAsync(id);
        if (forum == null)
            return NotFound("Forum not found");

        if (forum.Author != user.UserName && !await _userManager.IsInRoleAsync(user, "Admin"))
        {
            return Unauthorized("You are not allowed to delete this forum");
        }
        var success = await _forumService.DeleteForumAsync(id);
        return success ? Ok("Deleted") : NotFound("Forum not found");
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAllForums()
    {
        var forums = await _forumService.GetAllForumsAsync();
        return Ok(forums);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetForumById(int id)
    {
        var forum = await _forumService.GetForumByIdAsync(id);
        return Ok(forum);
    }
    [HttpPost("{id}/subscribe")]
    public async Task<IActionResult> Subscribe(int id)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null) return Unauthorized();

        var success = await _forumService.SubscribeUserToForumAsync(user.Id, id);
        return success ? Ok("Subscribed.") : BadRequest("Could not subscribe.");
        
    }
    [HttpPost("upload-forum-image")]
    public async Task<IActionResult> UploadForumImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded.");
        var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);
        var filePath = Path.Combine(uploadsFolder, fileName);
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }
        var fileUrl = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";
        return Ok(new { url = fileUrl });
    }
    [HttpPost("{id}/unsubscribe")]
    public async Task<IActionResult> Unsubscribe(int id)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null) return Unauthorized();

        var success = await _forumService.UnSubscribeUserToForumAsync(user.Id, id);
        return success ? Ok("Unsubscribed.") : BadRequest("Could not unsubscribed.");
    }
    [HttpGet("{id}/subscribed")]
    public async Task<IActionResult> Subscribed(int id)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null) return Unauthorized();
        var success = await _forumService.IsUserSubscribedAsync(user.Id, id);
        return Ok(success);
    }
    [HttpGet("my-subscribed-forums")]
    public async Task<IActionResult> GetMySubscribedForums()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null) return Unauthorized();

        var forums = await _forumService.GetForumsByUserIdAsync(user.Id);
        return Ok(forums);
    }
    [HttpGet("search")]
    [AllowAnonymous]
    public async Task<IActionResult> Search([FromQuery] string query)
    {
        var result = await _forumService.SearchContentAsync(query);
        return Ok(result);
    }
}