using api.fluvimar.domain.DTO;
using api.fluvimar.domain.Interfaces.Repositorios;
using api.fluvimar.domain.Interfaces.Servicos;

namespace api.fluvimar.application.Servicos;

public sealed class CidServico : ICidServico
{
    private const int LimiteResultados = 20;

    private readonly ICidRepositorio _cidRepositorio;

    public CidServico(ICidRepositorio cidRepositorio)
    {
        _cidRepositorio = cidRepositorio;
    }

    public async Task<IEnumerable<CidDTO.CidResponse>> BuscarAsync(string termo)
    {
        if (string.IsNullOrWhiteSpace(termo))
            return [];

        var cids = await _cidRepositorio.BuscarAsync(termo, LimiteResultados);

        return cids.Select(c => new CidDTO.CidResponse
        {
            Codigo = c.Codigo,
            Descricao = c.Descricao
        });
    }
}
