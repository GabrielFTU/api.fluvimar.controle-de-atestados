using api.fluvimar.domain.DTO;
using api.fluvimar.domain.Entities;
using api.fluvimar.domain.Interfaces.Repositorios;
using api.fluvimar.domain.Interfaces.Servicos;

namespace api.fluvimar.application.Servicos;

public sealed class AtestadoServico : IAtestadoServico
{
    private readonly IAtestadosRepositorio _atestadosRepositorio;
    private readonly IFuncionarioRepositorio _funcionarioRepositorio;

    public AtestadoServico(IAtestadosRepositorio atestadosRepositorio, IFuncionarioRepositorio funcionarioRepositorio)
    {
        _atestadosRepositorio = atestadosRepositorio;
        _funcionarioRepositorio = funcionarioRepositorio;
    }

    public async Task<IEnumerable<AtestadoDTO.AtestadoResponse>> ObterTodosAsync()
    {
        var atestados = await _atestadosRepositorio.ObterTodosAsync();
        return atestados.Select(MapearParaResponse);
    }

    public async Task<AtestadoDTO.AtestadoResponse> ObterPorIdAsync(Guid id)
    {
        var atestado = await _atestadosRepositorio.ObterPorIdAsync(id);
        return MapearParaResponse(atestado);
    }

    public async Task AdicionarAsync(AtestadoDTO.AtestadoRequest dto, string userId)
    {
        var funcionario = await _funcionarioRepositorio.ObterPorIdAsync(dto.FuncionarioId);

        var atestado = new AtestadoEntity(userId);
        AplicarDados(atestado, dto, funcionario);

        await _atestadosRepositorio.AdicionarAsync(atestado);
    }

    public async Task AtualizarAsync(AtestadoDTO.AbstractAtestadoWithIdDTO dto, string userId)
    {
        var atestado = await _atestadosRepositorio.ObterPorIdAsync(dto.Id);
        var funcionario = await _funcionarioRepositorio.ObterPorIdAsync(dto.FuncionarioId);

        AplicarDados(atestado, dto, funcionario);
        atestado.Update(userId);

        await _atestadosRepositorio.AtualizarAsync(atestado);
    }

    public async Task RemoveAsync(Guid id)
    {
        var atestado = await _atestadosRepositorio.ObterPorIdAsync(id);
        await _atestadosRepositorio.RemoverAsync(atestado);
    }

    private static void AplicarDados(AtestadoEntity atestado, AtestadoDTO.AbstractProdutoDTO dto, Funcionario funcionario)
    {
        atestado.SetFuncionario(funcionario);
        atestado.SetCID(dto.CID);
        atestado.SetDiaAfastamento(dto.DiaAfastamento!.Value);
        atestado.SetDiaRetorno(dto.DiaRetorno!.Value);
        atestado.SetObservacao(dto.Observacoes);
    }

    private static AtestadoDTO.AtestadoResponse MapearParaResponse(AtestadoEntity atestado) =>
        new()
        {
            Id = atestado.Id,
            FuncionarioId = atestado.FuncionarioId,
            NomeFuncionario = atestado.NomeFuncionario,
            CID = atestado.CID,
            DiaAfastamento = atestado.DiaAfastamento,
            DiaRetorno = atestado.DiaRetorno,
            Observacoes = atestado.Observacoes
        };
}
