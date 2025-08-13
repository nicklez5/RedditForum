using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using MyApi.Data;
using MyApi.Models;
using MyApi.Services;
using SQLitePCL;


namespace MyApi.Controllers;
public record AttachVideoDto(string Key, string Url, string ContentType, long SizeBytes, double? DurationSec);

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PostController(PostService postService, UserManager<ApplicationUser> userManager) : ControllerBase
{
    private readonly PostService _postService = postService;
    private readonly UserManager<ApplicationUser> _userManager = userManager;

    [HttpPost]
    public async Task<IActionResult> CreatePost([FromForm] CreatePostDto dto)
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return Unauthorized();

        var post = await _postService.CreatePostAsync(userId, dto.ThreadId, dto.ParentPostId, dto.Content);
        return Ok(post);
    }
    [HttpPost("{id}/video")]
    public async Task<IActionResult> AttachOrReplaceVideo(int id, [FromBody] AttachVideoDto dto)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();
        var post = await _postService.GetPostByIdAsync(id, user.Id);

        if (post == null)
            return NotFound("Post not found");

        if (post.AuthorUsername != user.UserName && !await _userManager.IsInRoleAsync(user, "Admin"))
            return Forbid("You are not allowed to edit this post.");

        var success = await _postService.AttachOrReplaceVideoPostAsync(id, dto.Key, dto.Url, dto.ContentType, dto.SizeBytes, dto.DurationSec);
        return success
            ? Ok(await _postService.GetPostByIdAsync(id, user.Id))
            : NotFound("Post not found");
    }
    [HttpDelete("{id}/video")]
    public async Task<IActionResult> DeleteVideo(int id)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();
        var post = await _postService.GetPostByIdAsync(id, user.Id);

        if (post == null)
            return NotFound("Post not found");

        if (post.AuthorUsername != user.UserName && !await _userManager.IsInRoleAsync(user, "Admin"))
            return Forbid("You are not allowed to edit this post.");
        var success = await _postService.DeleteVideoAsync(id);
        return success ? Ok(await _postService.GetPostByIdAsync(id, user.Id)) : NotFound("Post not found");
    }
    [HttpPost("{id}/image")]
    public async Task<IActionResult> AttachOrReplaceImage(int id, [FromBody] AttachImageDto dto)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();
        var post = await _postService.GetPostByIdAsync(id, user.Id);

        if (post == null)
            return NotFound("Post not found");

        if (post.AuthorUsername != user.UserName && !await _userManager.IsInRoleAsync(user, "Admin"))
            return Forbid("You are not allowed to edit this post.");

        var success = await _postService.AttachImage(id, dto.Url, dto.Key, dto.ContentType, dto.SizeBytes, dto.Width, dto.Height);
        return success
            ? Ok(await _postService.GetPostByIdAsync(id, user.Id))
            : NotFound("Post not found");
    }
    [HttpDelete("{id}/image")]
    public async Task<IActionResult> DeleteImage(int id)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();
        var post = await _postService.GetPostByIdAsync(id, user.Id);

        if (post == null)
            return NotFound("Post not found");

        if (post.AuthorUsername != user.UserName && !await _userManager.IsInRoleAsync(user, "Admin"))
            return Forbid("You are not allowed to edit this post.");
        var success = await _postService.DeleteImageAsync(id);
        return success ? Ok(await _postService.GetPostByIdAsync(id, user.Id)) : NotFound("Post not found");
    }
    [HttpPut("{id}")]
    public async Task<IActionResult> EditPost(int id, [FromForm] EditPostDto dto)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();

        var post = await _postService.GetPostByIdAsync(id, user.Id);
        if (post == null)
            return NotFound("Post not found.");

        if (post.AuthorUsername != user.UserName && !await _userManager.IsInRoleAsync(user, "Admin"))
            return Forbid("You are not allowed to edit this post.");


        var success = await _postService.UpdatePostAsync(id, dto.Content);
        return success
            ? Ok(await _postService.GetPostByIdAsync(id, user.Id))
            : NotFound("Post not found");
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAllPosts()
    {
        var userId = User.Identity?.IsAuthenticated == true
        ? User.FindFirstValue(ClaimTypes.NameIdentifier)
        : null;
        var result = await _postService.GetAllPostsAsync(userId);
        return Ok(result);
    }
    [HttpGet("posts")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAllPostsFlat()
    {
        var posts = await _postService.GetAllPostsFlat();
        return Ok(posts);
    }
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPostById(int id)
    {
        var userId = User.Identity?.IsAuthenticated == true
        ? User.FindFirstValue(ClaimTypes.NameIdentifier)
        : null;
        var post = await _postService.GetPostByIdAsync(id, userId);
        return Ok(post);
    }
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePost(int id)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();
        var post = await _postService.GetPostByIdAsync(id, user.Id);
        if (post == null)
            return NotFound("Post not found.");
        var isAdmin = await _userManager.IsInRoleAsync(user, "Admin");

        if (post.AuthorUsername != user.UserName && !isAdmin)
            return Forbid("You are not allowed to delete this post.");

        var success = await _postService.DeletePostAsync(id);
        return success ? Ok("Deleted") : NotFound("Post not found");
    }
    [HttpPost("vote")]
    public async Task<IActionResult> Vote([FromBody] PostVoteDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();
        try
        {
            await _postService.VotePostAsync(dto.PostId, userId, dto.Vote);
            var updatedPost = await _postService.GetPostByIdAsync(dto.PostId, userId);
            return Ok(updatedPost);
        }
        catch (KeyNotFoundException)
        {
            return NotFound("Post not found.");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred : {ex.Message}");
        }
    }
    [HttpPost("reply")]
    public async Task<IActionResult> ReplyToPost([FromForm] ReplyPostDto dto)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();

        var result = await _postService.ReplyToPostAsync(dto.ParentPostId, dto.Content, user.Id);
        return Ok(result);
        
    }
    [HttpGet("{id}/postLikes")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPostLikes(int id)
    {
        var count = await _postService.GetPostLikeCountAsync(id);
        return Ok(count);
    }
    [HttpGet("{id}/postUserLikes")]
    [AllowAnonymous]
    public async Task<IActionResult> GetUsersWhoLiked(int id)
    {
        var users = await _postService.GetUsersWhoLikedPostAsync(id);
        return Ok(users);
    }
}