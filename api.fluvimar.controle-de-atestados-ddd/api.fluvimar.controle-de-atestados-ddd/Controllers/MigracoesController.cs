using api.fluvimar.infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.fluvimar.controle_de_atestados_ddd.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class MigracoesController : ControllerBase
{
    private const string ProductVersion = "8.0.11";

    private readonly AppDbContext _context;

    public MigracoesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> ObterStatus()
    {
        var aplicadas = await _context.Database.GetAppliedMigrationsAsync();
        var pendentes = await _context.Database.GetPendingMigrationsAsync();

        return Ok(new { aplicadas, pendentes });
    }

    [HttpPost("aplicar")]
    public async Task<IActionResult> Aplicar()
    {
        await _context.Database.MigrateAsync();
        return NoContent();
    }

    [HttpPost("{migrationId}/marcar-concluida")]
    public async Task<IActionResult> MarcarComoConcluida(string migrationId)
    {
        if (!_context.Database.GetMigrations().Contains(migrationId))
            throw new KeyNotFoundException($"Migration '{migrationId}' não encontrada no projeto.");

        var aplicadas = await _context.Database.GetAppliedMigrationsAsync();
        if (aplicadas.Contains(migrationId))
            return NoContent();

        await _context.Database.ExecuteSqlInterpolatedAsync(
            $"INSERT INTO \"__EFMigrationsHistory\" (\"MigrationId\", \"ProductVersion\") VALUES ({migrationId}, {ProductVersion})");

        return NoContent();
    }
}
