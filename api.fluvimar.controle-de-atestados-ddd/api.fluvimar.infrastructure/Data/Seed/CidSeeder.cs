using api.fluvimar.domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace api.fluvimar.infrastructure.Data.Seed;

public static class CidSeeder
{
    private const string ResourceName = "api.fluvimar.infrastructure.Data.Seed.cid10.csv";

    public static async Task SeedAsync(AppDbContext context)
    {
        if (await context.Cids.AnyAsync())
            return;

        var assembly = typeof(CidSeeder).Assembly;
        using var stream = assembly.GetManifestResourceStream(ResourceName)
            ?? throw new InvalidOperationException($"Recurso incorporado '{ResourceName}' não encontrado.");
        using var reader = new StreamReader(stream);

        var cids = new List<CidEntity>();
        string? linha;
        while ((linha = await reader.ReadLineAsync()) is not null)
        {
            var separador = linha.IndexOf(';');
            if (separador <= 0)
                continue;

            var codigo = linha[..separador];
            var descricao = linha[(separador + 1)..];
            cids.Add(new CidEntity(codigo, descricao));
        }

        await context.Cids.AddRangeAsync(cids);
        await context.SaveChangesAsync();
    }
}
