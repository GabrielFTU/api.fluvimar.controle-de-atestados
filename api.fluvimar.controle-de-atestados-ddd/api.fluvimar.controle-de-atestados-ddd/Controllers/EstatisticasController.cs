using api.fluvimar.domain.DTO;
using api.fluvimar.domain.Enums;
using api.fluvimar.domain.Interfaces.Servicos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.fluvimar.controle_de_atestados_ddd.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class EstatisticasController : ControllerBase
{
    private readonly IEstatisticaServico _estatisticaServico;

    public EstatisticasController(IEstatisticaServico estatisticaServico)
    {
        _estatisticaServico = estatisticaServico;
    }

    [HttpGet("resumo")]
    public async Task<ActionResult<EstatisticaDTO.ResumoResponse>> ObterResumo() =>
        Ok(await _estatisticaServico.ObterResumoAsync());

    [HttpGet("anos")]
    public async Task<ActionResult<IEnumerable<int>>> ObterAnosDisponiveis() =>
        Ok(await _estatisticaServico.ObterAnosDisponiveisAsync());

    [HttpGet("serie-mensal")]
    public async Task<ActionResult<IEnumerable<EstatisticaDTO.SerieMensalItem>>> ObterSerieMensal(
        [FromQuery] int ano, [FromQuery] Unidade? unidade, [FromQuery] Guid? setorId,
        [FromQuery] ClassificacaoAtestado? classificacao) =>
        Ok(await _estatisticaServico.ObterSerieMensalAsync(ano, unidade, setorId, classificacao));

    [HttpGet("dia-semana")]
    public async Task<ActionResult<IEnumerable<EstatisticaDTO.DiaSemanaItem>>> ObterPorDiaSemana(
        [FromQuery] int? ano, [FromQuery] int? mes, [FromQuery] Unidade? unidade, [FromQuery] Guid? setorId,
        [FromQuery] ClassificacaoAtestado? classificacao) =>
        Ok(await _estatisticaServico.ObterPorDiaSemanaAsync(ano, mes, unidade, setorId, classificacao));

    [HttpGet("por-setor")]
    public async Task<ActionResult<IEnumerable<EstatisticaDTO.SetorItem>>> ObterPorSetor(
        [FromQuery] int? ano, [FromQuery] int? mes, [FromQuery] Unidade? unidade,
        [FromQuery] ClassificacaoAtestado? classificacao) =>
        Ok(await _estatisticaServico.ObterPorSetorAsync(ano, mes, unidade, classificacao));

    [HttpGet("top-funcionarios")]
    public async Task<ActionResult<IEnumerable<EstatisticaDTO.TopFuncionarioItem>>> ObterTopFuncionarios(
        [FromQuery] int ano, [FromQuery] int? mes, [FromQuery] int limite = 10, [FromQuery] Unidade? unidade = null,
        [FromQuery] Guid? setorId = null, [FromQuery] ClassificacaoAtestado? classificacao = null) =>
        Ok(await _estatisticaServico.ObterTopFuncionariosAsync(ano, mes, limite, unidade, setorId, classificacao));

    [HttpGet("top-cids")]
    public async Task<ActionResult<IEnumerable<EstatisticaDTO.TopCidItem>>> ObterTopCids(
        [FromQuery] int? ano, [FromQuery] int? mes, [FromQuery] int limite = 10, [FromQuery] Unidade? unidade = null,
        [FromQuery] Guid? setorId = null, [FromQuery] ClassificacaoAtestado? classificacao = null) =>
        Ok(await _estatisticaServico.ObterTopCidsAsync(ano, mes, limite, unidade, setorId, classificacao));

    [HttpGet("top-medicos")]
    public async Task<ActionResult<IEnumerable<EstatisticaDTO.TopMedicoItem>>> ObterTopMedicos(
        [FromQuery] int? ano, [FromQuery] int? mes, [FromQuery] int limite = 10, [FromQuery] Unidade? unidade = null,
        [FromQuery] Guid? setorId = null, [FromQuery] ClassificacaoAtestado? classificacao = null) =>
        Ok(await _estatisticaServico.ObterTopMedicosAsync(ano, mes, limite, unidade, setorId, classificacao));

    [HttpGet("funcionario/{funcionarioId:guid}")]
    public async Task<ActionResult<EstatisticaDTO.FuncionarioEstatisticaResponse>> ObterPorFuncionario(
        Guid funcionarioId, [FromQuery] int? ano, [FromQuery] int? mes) =>
        Ok(await _estatisticaServico.ObterPorFuncionarioAsync(funcionarioId, ano, mes));

    [HttpGet("atestados-detalhe")]
    public async Task<ActionResult<IEnumerable<EstatisticaDTO.AtestadoDetalheItem>>> ObterDetalheAtestados(
        [FromQuery] string? cid,
        [FromQuery] Guid? setorId,
        [FromQuery] bool semSetor,
        [FromQuery] Guid? funcionarioId,
        [FromQuery] Guid? medicoId,
        [FromQuery] ClassificacaoAtestado? classificacao,
        [FromQuery] Unidade? unidade,
        [FromQuery] int? ano,
        [FromQuery] int? mes,
        [FromQuery] bool apenasAtivos,
        [FromQuery] int? diasMinimosAfastamento) =>
        Ok(await _estatisticaServico.ObterDetalheAtestadosAsync(
            cid, setorId, semSetor, funcionarioId, medicoId, classificacao, unidade, ano, mes, apenasAtivos, diasMinimosAfastamento));

    [HttpGet("reincidentes")]
    public async Task<ActionResult<IEnumerable<EstatisticaDTO.ReincidenteItem>>> ObterReincidentes(
        [FromQuery] int meses = 6, [FromQuery] int minimo = 3) =>
        Ok(await _estatisticaServico.ObterReincidentesAsync(meses, minimo));
}
