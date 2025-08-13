using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;

using Microsoft.EntityFrameworkCore;
using MyApi.Data;
using MyApi.Models;
using MyApi.Services;
namespace MyApi.Controllers;
[ApiController]
[Route("api/images")]
public class ImagesController(IObjectStorageService storage) : ControllerBase
{
    private readonly IObjectStorageService _storage = storage;

    // POST /api/images/presign?contentType=image/png&fileName=pic.png&scope=post
    [HttpPost("presign")]
    public IActionResult Presign([FromQuery] string contentType, [FromQuery] string? fileName, [FromQuery] string scope = "post")
    {
        if (!contentType.StartsWith("image/")) return BadRequest("contentType must be image/*");
        var folder = scope == "thread" ? "images/threads" : "images/posts";
        var (key, url, publicUrl) = _storage.PresignPut(folder, contentType, fileName);
        return Ok(new { key, url, publicUrl });
    }
}