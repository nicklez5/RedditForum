using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyApi.Migrations
{
    /// <inheritdoc />
    public partial class FixLockoutEnd : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
            ALTER TABLE ""Users""
            ALTER COLUMN ""LockoutEnd""
            TYPE timestamptz
            USING (NULLIF(""LockoutEnd"", '')::timestamptz);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE ""Users""
                ALTER COLUMN ""LockoutEnd""
                TYPE text
                USING (""LockoutEnd""::text);
            ");
        }
    }
}
