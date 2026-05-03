using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgendaTodo.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Icon",
                table: "notifications");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Icon",
                table: "notifications",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);
        }
    }
}
