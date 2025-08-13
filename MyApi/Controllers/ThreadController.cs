using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyApi.Data;
using MyApi.Models;
using MyApi.Services;
using SQLitePCL;

namespace MyApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ThreadController(ThreadService threadService, UserManager<ApplicationUser> userManager) : ControllerBase
{
    private readonly ThreadService _threadService = threadService;
    private readonly UserManager<ApplicationUser> _userManager = userManager;

    [HttpPost]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(ThreadDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateThread([FromForm] CreateThreadDto dto)
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return Unauthorized();

        var thread = await _threadService.CreateThreadAsync(dto.Title, dto.ForumId, userId, dto.Content);

        return CreatedAtAction(nameof(GetThreadById), new { id = thread.Id }, thread);
    }
    [HttpPut("{id}")]
    public async Task<IActionResult> EditThread(int id, [FromForm] EditThreadDto dto)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();

        var thread = await _threadService.GetThreadByIdAsync(id);
        if (thread == null)
            return NotFound("Thread not found.");

        if (thread.AuthorUsername != user.UserName && !await _userManager.IsInRoleAsync(user,"Admin"))
            return Forbid("You are not allowed to edit this thread.");

        
        var success = await _threadService.UpdateThreadAsync(id, dto.Title, dto.Content);
        return success ? Ok(await _threadService.GetThreadByIdAsync(id, user.Id)) : NotFound("Thread not found");
    }
    [HttpGet("all")]
    public async Task<IActionResult> GetAllThread([FromQuery] string? viewerUserId = null)
    {
        var result = await _threadService.GetAllThreads(viewerUserId);
        return Ok(result);
    }
    [HttpGet("forums/{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAllThreads(int id, [FromQuery] string? viewerUserId = null)
    {
        var result = await _threadService.GetThreadsByForumAsync(id, viewerUserId);
        return Ok(result);
    }
    [HttpPost("{id}/video")]
    public async Task<IActionResult> AttachOrReplaceVideo(int id, [FromBody] AttachVideoDto dto)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();
        var thread = await _threadService.GetThreadByIdAsync(id, user.Id);
        if (thread == null)
            return NotFound("Thread not found");

        if (thread.AuthorUsername != user.UserName && !await _userManager.IsInRoleAsync(user, "Admin"))
            return Forbid("You are not allowed to edit this thread");

        var success = await _threadService.AttachOrReplaceVideoThreadAsync(id, dto.Key, dto.Url, dto.ContentType, dto.SizeBytes, dto.DurationSec);
        return success ? Ok(await _threadService.GetThreadByIdAsync(id, user.Id)) : NotFound("Thread not found");
    }
    [HttpDelete("{id}/video")]
    public async Task<IActionResult> DeleteVideo(int id)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();
        var thread = await _threadService.GetThreadByIdAsync(id, user.Id);
        if (thread == null)
            return NotFound("Thread not found");
        if (thread.AuthorUsername != user.UserName && !await _userManager.IsInRoleAsync(user, "Admin"))
            return Forbid("You are not allowed to edit this thread");
        var success = await _threadService.DeleteVideoAsync(id);
        return success ? Ok(await _threadService.GetThreadByIdAsync(id, user.Id)) : NotFound("Thread not found");
    }
    [HttpPost("{id}/image")]
    public async Task<IActionResult> AttachOrReplaceImage(int id, [FromBody] AttachImageDto dto)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();
        var thread = await _threadService.GetThreadByIdAsync(id, user.Id);
        if (thread == null)
            return NotFound("Thread not found");

        if (thread.AuthorUsername != user.UserName && !await _userManager.IsInRoleAsync(user, "Admin"))
            return Forbid("You are not allowed to edit this thread");

        var success = await _threadService.AttachImage(id, dto.Url, dto.Key, dto.ContentType, dto.SizeBytes, dto.Width, dto.Height);
        return success ? Ok(await _threadService.GetThreadByIdAsync(id, user.Id)) : NotFound("Thread not found");
    }
    [HttpDelete("{id}/image")]
    public async Task<IActionResult> DeleteImage(int id)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();
        var thread = await _threadService.GetThreadByIdAsync(id, user.Id);
        if (thread == null)
            return NotFound("Thread not found");
        if (thread.AuthorUsername != user.UserName && !await _userManager.IsInRoleAsync(user, "Admin"))
            return Forbid("You are not allowed to edit this thread");
        var success = await _threadService.DeleteImageAsync(id);
        return success ? Ok(await _threadService.GetThreadByIdAsync(id, user.Id)) : NotFound("Thread not found");
    }
    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetThreadById(int id, [FromQuery] string? viewerUserId)
    {
        var thread = await _threadService.GetThreadByIdAsync(id, viewerUserId);
        return Ok(thread);
    }
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteThread(int id)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();
        var thread = await _threadService.GetThreadByIdAsync(id);
        if (thread == null)
            return NotFound("Thread not found.");
        var isAdmin = await _userManager.IsInRoleAsync(user, "Admin");
        if (thread.AuthorUsername != user.UserName && !isAdmin)
            return Forbid("You are not allowed to delete this thread.");

        var success = await _threadService.DeleteThreadAsync(id);
        return success ? Ok("Deleted") : NotFound("Thread not found");
    }
    [HttpPost("vote")]
    public async Task<IActionResult> LikeThread([FromBody] ThreadVoteDto voteDto)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();
        try
        {
            var updatedThread = await _threadService.VoteThreadAsync(voteDto.ThreadId, user.Id, voteDto.Vote);
            return Ok(updatedThread);
        }
        catch (KeyNotFoundException)
        {
            return NotFound("Thread not found.");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred: {ex.Message}");
        }
    }
    [HttpGet("{id}/likes")]
    public async Task<IActionResult> GetThreadLikes(int id)
    {
        var count = await _threadService.GetThreadLikeCountAsync(id);
        return Ok(count);
    }
    [HttpGet("search")]
    public async Task<IActionResult> SearchThreads([FromQuery] string? viewerUserId = null, [FromQuery] string sortBy = "new")
    {
        var results = await _threadService.SearchThreads(viewerUserId, sortBy);
        return Ok(results);
    }
    [HttpGet("{id}/search")]
    [AllowAnonymous]
    public async Task<IActionResult> SearchThreadsByForum(int id, [FromQuery] string? viewerUserId = null, [FromQuery] string sortBy = "new")
    {
        var results = await _threadService.SearchThreadsInForum(id, viewerUserId, sortBy);
        return Ok(results);
    }
}