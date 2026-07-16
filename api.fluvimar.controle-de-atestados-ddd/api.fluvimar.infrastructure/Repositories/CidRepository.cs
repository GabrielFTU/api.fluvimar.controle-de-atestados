using api.fluvimar.domain.Classes;
using api.fluvimar.domain.Entities;
using api.fluvimar.domain.Interfaces.Repositorios;
using api.fluvimar.infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace api.fluvimar.infrastructure.Repositories;

public sealed class CidRepository : ICidRepositorio
{
    private readonly AppDbContext _context;

    public CidRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<CidEntity>> BuscarAsync(string termo, int limite)
    {
        var termoNormalizado = NormalizadorTexto.Normalizar(termo.Trim());

        return await _context.Cids
            .Where(c => EF.Functions.ILike(c.Busca, $"%{termoNormalizado}%"))
            .OrderBy(c => EF.Functions.ILike(c.Busca, $"{termoNormalizado}%") ? 0 : 1)
            .ThenBy(c => c.Descricao)
            .Take(limite)
            .ToListAsync();
    }

    public async Task<IEnumerable<CidEntity>> ObterPorCodigosAsync(IEnumerable<string> codigos)
    {
        var lista = codigos.Distinct().ToList();
        return await _context.Cids.Where(c => lista.Contains(c.Codigo)).ToListAsync();
    }
}
