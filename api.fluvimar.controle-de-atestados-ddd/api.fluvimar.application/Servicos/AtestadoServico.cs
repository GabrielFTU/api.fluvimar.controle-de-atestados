using api.fluvimar.domain.DTO;
using api.fluvimar.domain.Entities;
using api.fluvimar.domain.Interfaces.Repositorios;
using api.fluvimar.domain.Interfaces.Servicos;

namespace api.fluvimar.application.Servicos;

public sealed class AtestadoServico : IAtestadoServico
{
    private readonly IAtestadosRepositorio _atestadosRepositorio;
    private readonly IFuncionarioRepositorio _funcionarioRepositorio;
    private readonly IMedicoRepositorio _medicoRepositorio;

    public AtestadoServico(
        IAtestadosRepositorio atestadosRepositorio,
        IFuncionarioRepositorio funcionarioRepositorio,
        IMedicoRepositorio medicoRepositorio)
    {
        _atestadosRepositorio = atestadosRepositorio;
        _funcionarioRepositorio = funcionarioRepositorio;
        _medicoRepositorio = medicoRepositorio;
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
        var medico = await ResolverMedicoAsync(dto.MedicoId);

        var atestado = new AtestadoEntity(userId);
        AplicarDados(atestado, dto, funcionario, medico);

        await _atestadosRepositorio.AdicionarAsync(atestado);
    }

    public async Task AtualizarAsync(AtestadoDTO.AbstractAtestadoWithIdDTO dto, string userId)
    {
        var atestado = await _atestadosRepositorio.ObterPorIdAsync(dto.Id);
        var funcionario = await _funcionarioRepositorio.ObterPorIdAsync(dto.FuncionarioId);
        var medico = await ResolverMedicoAsync(dto.MedicoId);

        AplicarDados(atestado, dto, funcionario, medico);
        atestado.Update(userId);

        await _atestadosRepositorio.AtualizarAsync(atestado);
    }

    public async Task RemoveAsync(Guid id)
    {
        var atestado = await _atestadosRepositorio.ObterPorIdAsync(id);
        await _atestadosRepositorio.RemoverAsync(atestado);
    }

    private async Task<MedicoEntity?> ResolverMedicoAsync(Guid? medicoId) =>
        medicoId.HasValue ? await _medicoRepositorio.ObterPorIdAsync(medicoId.Value) : null;

    private static void AplicarDados(
        AtestadoEntity atestado, AtestadoDTO.AbstractProdutoDTO dto, Funcionario funcionario, MedicoEntity? medico)
    {
        atestado.SetFuncionario(funcionario);
        atestado.SetCID(dto.CID);
        atestado.SetTipoAtestado(dto.TipoAtestado);
        atestado.SetClassificacao(dto.Classificacao);
        atestado.SetMedico(medico);
        atestado.SetDiaAfastamento(dto.DiaAfastamento!.Value);
        atestado.SetDiaRetorno(dto.DiaRetorno!.Value);
        atestado.SetHorario(dto.HoraInicio, dto.HoraFim);
        atestado.SetObservacao(dto.Observacoes);
    }

    private static AtestadoDTO.AtestadoResponse MapearParaResponse(AtestadoEntity atestado) =>
        new()
        {
            Id = atestado.Id,
            FuncionarioId = atestado.FuncionarioId,
            NomeFuncionario = atestado.NomeFuncionario,
            CID = atestado.CID,
            TipoAtestado = atestado.TipoAtestado,
            Classificacao = atestado.Classificacao,
            MedicoId = atestado.MedicoId,
            NomeMedico = atestado.NomeMedico,
            DiaAfastamento = atestado.DiaAfastamento,
            DiaRetorno = atestado.DiaRetorno,
            HoraInicio = atestado.HoraInicio,
            HoraFim = atestado.HoraFim,
            TotalDiasFora = atestado.TotalDiasFora,
            TotalHoras = atestado.TotalHoras,
            Observacoes = atestado.Observacoes
        };
}
