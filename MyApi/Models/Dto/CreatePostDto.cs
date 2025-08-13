using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;

namespace MyApi.Models;

public class CreatePostDto
{
    public string? Content { get; set; }

    [Required]
    public int ThreadId { get; set; }


    public int? ParentPostId { get; set; }
}