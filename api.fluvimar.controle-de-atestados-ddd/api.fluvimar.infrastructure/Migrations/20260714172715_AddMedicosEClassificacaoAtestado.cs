using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace api.fluvimar.infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMedicosEClassificacaoAtestado : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Classificacao",
                table: "Atestados",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "MedicoId",
                table: "Atestados",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NomeMedico",
                table: "Atestados",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Medicos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CodigoInterno = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nome = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Crm = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    CreatedByUserId = table.Column<string>(type: "text", nullable: false),
                    CreateAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedByUserId = table.Column<string>(type: "text", nullable: false),
                    UpdateAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Medicos", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Atestados_MedicoId",
                table: "Atestados",
                column: "MedicoId");

            migrationBuilder.AddForeignKey(
                name: "FK_Atestados_Medicos_MedicoId",
                table: "Atestados",
                column: "MedicoId",
                principalTable: "Medicos",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Atestados_Medicos_MedicoId",
                table: "Atestados");

            migrationBuilder.DropTable(
                name: "Medicos");

            migrationBuilder.DropIndex(
                name: "IX_Atestados_MedicoId",
                table: "Atestados");

            migrationBuilder.DropColumn(
                name: "Classificacao",
                table: "Atestados");

            migrationBuilder.DropColumn(
                name: "MedicoId",
                table: "Atestados");

            migrationBuilder.DropColumn(
                name: "NomeMedico",
                table: "Atestados");
        }
    }
}
