using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;

using Microsoft.EntityFrameworkCore;
using MyApi.Data;
using MyApi.Models;
using MyApi.Services;
namespace MyApi.Controllers;

[ApiController]
[Route("api/videos")]
public class VideosController(IVideoStorageService videos) : ControllerBase
{
    private readonly IVideoStorageService _videos = videos;

    [HttpPost("presign")]
    public IActionResult Presign([FromQuery] string contentType, [FromQuery] string? fileName) {
        var (key, uploadUrl, publicUrl) = _videos.PresignUpload(contentType, fileName);
        return Ok(new { key, url = uploadUrl, publicUrl });
    }
}