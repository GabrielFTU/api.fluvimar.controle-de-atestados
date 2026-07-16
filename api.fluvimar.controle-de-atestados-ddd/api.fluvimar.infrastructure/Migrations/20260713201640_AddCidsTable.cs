using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.fluvimar.infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCidsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Cids",
                columns: table => new
                {
                    Codigo = table.Column<string>(type: "character varying(6)", maxLength: 6, nullable: false),
                    Descricao = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Busca = table.Column<string>(type: "character varying(520)", maxLength: 520, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cids", x => x.Codigo);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Cids_Busca",
                table: "Cids",
                column: "Busca");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Cids");
        }
    }
}
