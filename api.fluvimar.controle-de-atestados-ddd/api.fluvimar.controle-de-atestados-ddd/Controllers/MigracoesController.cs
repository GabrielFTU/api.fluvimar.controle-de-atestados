using api.fluvimar.infrastructure.Data;
using api.fluvimar.infrastructure.Data.Seed;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.fluvimar.controle_de_atestados_ddd.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public sealed class MigracoesController : ControllerBase
{
    private const string ProductVersion = "8.0.11";

    private readonly AppDbContext _context;
    private readonly IHostEnvironment _environment;

    public MigracoesController(AppDbContext context, IHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    [HttpGet]
    public async Task<IActionResult> ObterStatus()
    {
        if (!_environment.IsDevelopment())
            return NotFound();

        var aplicadas = await _context.Database.GetAppliedMigrationsAsync();
        var pendentes = await _context.Database.GetPendingMigrationsAsync();

        return Ok(new { aplicadas, pendentes });
    }

    [HttpPost("aplicar")]
    public async Task<IActionResult> Aplicar()
    {
        if (!_environment.IsDevelopment())
            return NotFound();

        await _context.Database.MigrateAsync();
        await CidSeeder.SeedAsync(_context);
        return NoContent();
    }

    [HttpPost("{migrationId}/marcar-concluida")]
    public async Task<IActionResult> MarcarComoConcluida(string migrationId)
    {
        if (!_environment.IsDevelopment())
            return NotFound();

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
