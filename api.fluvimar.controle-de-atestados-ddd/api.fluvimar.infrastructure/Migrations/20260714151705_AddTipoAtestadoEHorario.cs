using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.fluvimar.infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTipoAtestadoEHorario : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<TimeSpan>(
                name: "HoraFim",
                table: "Atestados",
                type: "interval",
                nullable: true);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "HoraInicio",
                table: "Atestados",
                type: "interval",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TipoAtestado",
                table: "Atestados",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HoraFim",
                table: "Atestados");

            migrationBuilder.DropColumn(
                name: "HoraInicio",
                table: "Atestados");

            migrationBuilder.DropColumn(
                name: "TipoAtestado",
                table: "Atestados");
        }
    }
}
