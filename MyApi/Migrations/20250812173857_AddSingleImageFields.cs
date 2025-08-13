using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyApi.Migrations
{
    /// <inheritdoc />
    public partial class AddSingleImageFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ProfileImageKey",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImageContentType",
                table: "Threads",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ImageHeight",
                table: "Threads",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImageKey",
                table: "Threads",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "ImageSizeBytes",
                table: "Threads",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ImageWidth",
                table: "Threads",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VideoContentType",
                table: "Threads",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "VideoDurationSec",
                table: "Threads",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VideoKey",
                table: "Threads",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "VideoSizeBytes",
                table: "Threads",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VideoUrl",
                table: "Threads",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImageContentType",
                table: "Posts",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ImageHeight",
                table: "Posts",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImageKey",
                table: "Posts",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "ImageSizeBytes",
                table: "Posts",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ImageWidth",
                table: "Posts",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VideoContentType",
                table: "Posts",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "VideoDurationSec",
                table: "Posts",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VideoKey",
                table: "Posts",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "VideoSizeBytes",
                table: "Posts",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VideoUrl",
                table: "Posts",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BannerContentType",
                table: "Forums",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "BannerHeight",
                table: "Forums",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BannerKey",
                table: "Forums",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "BannerSizeBytes",
                table: "Forums",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "BannerWidth",
                table: "Forums",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IconContentType",
                table: "Forums",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "IconHeight",
                table: "Forums",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IconKey",
                table: "Forums",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "IconSizeBytes",
                table: "Forums",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "IconWidth",
                table: "Forums",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProfileImageKey",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ImageContentType",
                table: "Threads");

            migrationBuilder.DropColumn(
                name: "ImageHeight",
                table: "Threads");

            migrationBuilder.DropColumn(
                name: "ImageKey",
                table: "Threads");

            migrationBuilder.DropColumn(
                name: "ImageSizeBytes",
                table: "Threads");

            migrationBuilder.DropColumn(
                name: "ImageWidth",
                table: "Threads");

            migrationBuilder.DropColumn(
                name: "VideoContentType",
                table: "Threads");

            migrationBuilder.DropColumn(
                name: "VideoDurationSec",
                table: "Threads");

            migrationBuilder.DropColumn(
                name: "VideoKey",
                table: "Threads");

            migrationBuilder.DropColumn(
                name: "VideoSizeBytes",
                table: "Threads");

            migrationBuilder.DropColumn(
                name: "VideoUrl",
                table: "Threads");

            migrationBuilder.DropColumn(
                name: "ImageContentType",
                table: "Posts");

            migrationBuilder.DropColumn(
                name: "ImageHeight",
                table: "Posts");

            migrationBuilder.DropColumn(
                name: "ImageKey",
                table: "Posts");

            migrationBuilder.DropColumn(
                name: "ImageSizeBytes",
                table: "Posts");

            migrationBuilder.DropColumn(
                name: "ImageWidth",
                table: "Posts");

            migrationBuilder.DropColumn(
                name: "VideoContentType",
                table: "Posts");

            migrationBuilder.DropColumn(
                name: "VideoDurationSec",
                table: "Posts");

            migrationBuilder.DropColumn(
                name: "VideoKey",
                table: "Posts");

            migrationBuilder.DropColumn(
                name: "VideoSizeBytes",
                table: "Posts");

            migrationBuilder.DropColumn(
                name: "VideoUrl",
                table: "Posts");

            migrationBuilder.DropColumn(
                name: "BannerContentType",
                table: "Forums");

            migrationBuilder.DropColumn(
                name: "BannerHeight",
                table: "Forums");

            migrationBuilder.DropColumn(
                name: "BannerKey",
                table: "Forums");

            migrationBuilder.DropColumn(
                name: "BannerSizeBytes",
                table: "Forums");

            migrationBuilder.DropColumn(
                name: "BannerWidth",
                table: "Forums");

            migrationBuilder.DropColumn(
                name: "IconContentType",
                table: "Forums");

            migrationBuilder.DropColumn(
                name: "IconHeight",
                table: "Forums");

            migrationBuilder.DropColumn(
                name: "IconKey",
                table: "Forums");

            migrationBuilder.DropColumn(
                name: "IconSizeBytes",
                table: "Forums");

            migrationBuilder.DropColumn(
                name: "IconWidth",
                table: "Forums");
        }
    }
}
