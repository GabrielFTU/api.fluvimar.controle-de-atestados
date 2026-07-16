using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.fluvimar.infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUnidadeToSetor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Unidade",
                table: "Setores",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Unidade",
                table: "Setores");
        }
    }
}
