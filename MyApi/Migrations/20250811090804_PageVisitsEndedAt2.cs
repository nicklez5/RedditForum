using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyApi.Migrations
{
    /// <inheritdoc />
    public partial class PageVisitsEndedAt2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ClientVisitKey",
                table: "PageVisits",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_PageVisits_ClientVisitKey",
                table: "PageVisits",
                column: "ClientVisitKey",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PageVisits_ClientVisitKey",
                table: "PageVisits");

            migrationBuilder.DropColumn(
                name: "ClientVisitKey",
                table: "PageVisits");
        }
    }
}
