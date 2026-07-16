using api.fluvimar.domain.DTO;
using api.fluvimar.domain.Entities;
using api.fluvimar.domain.Enums;
using api.fluvimar.domain.Interfaces.Repositorios;
using api.fluvimar.domain.Interfaces.Servicos;

namespace api.fluvimar.application.Servicos;

public sealed class EstatisticaServico : IEstatisticaServico
{
    private const int LimiteDiasInss = 15;

    private readonly IAtestadosRepositorio _atestadosRepositorio;
    private readonly IFuncionarioRepositorio _funcionarioRepositorio;
    private readonly ICidRepositorio _cidRepositorio;
    private readonly IMedicoRepositorio _medicoRepositorio;

    public EstatisticaServico(
        IAtestadosRepositorio atestadosRepositorio,
        IFuncionarioRepositorio funcionarioRepositorio,
        ICidRepositorio cidRepositorio,
        IMedicoRepositorio medicoRepositorio)
    {
        _atestadosRepositorio = atestadosRepositorio;
        _funcionarioRepositorio = funcionarioRepositorio;
        _cidRepositorio = cidRepositorio;
        _medicoRepositorio = medicoRepositorio;
    }

    public async Task<EstatisticaDTO.ResumoResponse> ObterResumoAsync()
    {
        var atestados = await ObterComAfastamentoAsync();
        var hoje = DateTime.UtcNow.Date;
        var ontem = hoje.AddDays(-1);
        var inicioMesAtual = new DateTime(hoje.Year, hoje.Month, 1);
        var inicioMesAnterior = inicioMesAtual.AddMonths(-1);

        var doMesAtual = atestados.Where(a => Data(a) >= inicioMesAtual && Data(a) < inicioMesAtual.AddMonths(1)).ToList();
        var doMesAnterior = atestados.Where(a => Data(a) >= inicioMesAnterior && Data(a) < inicioMesAtual).ToList();

        var diaCompletoAtestados = atestados.Where(a => a.TipoAtestado == TipoAtestado.DiaCompleto).ToList();
        var diaCompletoMesAtual = doMesAtual.Where(a => a.TipoAtestado == TipoAtestado.DiaCompleto).ToList();
        var horarioMesAtual = doMesAtual.Where(a => a.TipoAtestado == TipoAtestado.Horario).ToList();
        var horarioMesAnterior = doMesAnterior.Where(a => a.TipoAtestado == TipoAtestado.Horario).ToList();

        return new EstatisticaDTO.ResumoResponse
        {
            AtestadosHoje = atestados.Count(a => Data(a) == hoje),
            AtestadosOntem = atestados.Count(a => Data(a) == ontem),
            AtestadosMesAtual = doMesAtual.Count,
            AtestadosMesAnterior = doMesAnterior.Count,
            DiasAfastadosMesAtual = diaCompletoMesAtual.Sum(Dias),
            DiasAfastadosMesAnterior = doMesAnterior.Where(a => a.TipoAtestado == TipoAtestado.DiaCompleto).Sum(Dias),
            AtestadosAtivosAgora = diaCompletoAtestados.Count(a =>
                Data(a) <= hoje && a.DiaRetorno.HasValue && a.DiaRetorno.Value.Date >= hoje),
            MediaDiasPorAtestadoMesAtual =
                diaCompletoMesAtual.Count > 0 ? Math.Round(diaCompletoMesAtual.Average(Dias), 1) : 0,
            AtestadosAtivosAcimaDe15Dias = diaCompletoAtestados.Count(a =>
                Data(a) <= hoje &&
                a.DiaRetorno.HasValue &&
                a.DiaRetorno.Value.Date >= hoje &&
                (hoje - Data(a)).TotalDays >= LimiteDiasInss),
            HorasAtestadasMesAtual = Math.Round(horarioMesAtual.Sum(Horas), 1),
            HorasAtestadasMesAnterior = Math.Round(horarioMesAnterior.Sum(Horas), 1),
        };
    }

    public async Task<IEnumerable<int>> ObterAnosDisponiveisAsync()
    {
        var atestados = await ObterComAfastamentoAsync();
        var anos = new SortedSet<int>(Comparer<int>.Create((a, b) => b.CompareTo(a))) { DateTime.UtcNow.Year };
        foreach (var atestado in atestados)
            anos.Add(Data(atestado).Year);

        return anos;
    }

    public async Task<IEnumerable<EstatisticaDTO.SerieMensalItem>> ObterSerieMensalAsync(
        int ano, Unidade? unidade, Guid? setorId, ClassificacaoAtestado? classificacao)
    {
        var doAno = AplicarFiltrosComuns(await ObterComAfastamentoAsync(), unidade, setorId, classificacao)
            .Where(a => Data(a).Year == ano).ToList();

        return Enumerable.Range(1, 12).Select(mes =>
        {
            var doMes = doAno.Where(a => Data(a).Month == mes).ToList();
            return new EstatisticaDTO.SerieMensalItem
            {
                Mes = mes,
                Quantidade = doMes.Count,
                DiasAfastados = doMes.Sum(Dias),
            };
        });
    }

    public async Task<IEnumerable<EstatisticaDTO.DiaSemanaItem>> ObterPorDiaSemanaAsync(
        int? ano, int? mes, Unidade? unidade, Guid? setorId, ClassificacaoAtestado? classificacao)
    {
        var atestados = AplicarFiltrosComuns(await ObterComAfastamentoAsync(), unidade, setorId, classificacao);
        var filtrados = atestados
            .Where(a => (!ano.HasValue || Data(a).Year == ano.Value) && (!mes.HasValue || Data(a).Month == mes.Value))
            .ToList();

        return Enumerable.Range(0, 7).Select(dia => new EstatisticaDTO.DiaSemanaItem
        {
            DiaSemana = dia,
            Quantidade = filtrados.Count(a => (int)Data(a).DayOfWeek == dia),
        });
    }

    public async Task<IEnumerable<EstatisticaDTO.SetorItem>> ObterPorSetorAsync(
        int? ano, int? mes, Unidade? unidade, ClassificacaoAtestado? classificacao)
    {
        var atestados = AplicarFiltrosComuns(await ObterComAfastamentoAsync(), unidade, null, classificacao);
        var filtrados = atestados
            .Where(a => (!ano.HasValue || Data(a).Year == ano.Value) && (!mes.HasValue || Data(a).Month == mes.Value))
            .ToList();

        return filtrados
            .GroupBy(a => new { a.Funcionario.SetorId, Nome = a.Funcionario.Setor?.NomeDoSetor ?? "Sem setor" })
            .Select(g => new EstatisticaDTO.SetorItem
            {
                SetorId = g.Key.SetorId,
                NomeDoSetor = g.Key.Nome,
                Quantidade = g.Count(),
                DiasAfastados = g.Sum(Dias),
            })
            .OrderByDescending(s => s.Quantidade);
    }

    public async Task<IEnumerable<EstatisticaDTO.TopFuncionarioItem>> ObterTopFuncionariosAsync(
        int ano, int? mes, int limite, Unidade? unidade, Guid? setorId, ClassificacaoAtestado? classificacao)
    {
        var atestados = AplicarFiltrosComuns(await ObterComAfastamentoAsync(), unidade, setorId, classificacao)
            .Where(a => Data(a).Year == ano && (!mes.HasValue || Data(a).Month == mes.Value));

        return atestados
            .GroupBy(a => new { a.FuncionarioId, a.NomeFuncionario })
            .Select(g => new EstatisticaDTO.TopFuncionarioItem
            {
                FuncionarioId = g.Key.FuncionarioId,
                NomeFuncionario = g.Key.NomeFuncionario,
                Quantidade = g.Count(),
            })
            .OrderByDescending(f => f.Quantidade)
            .Take(limite);
    }

    public async Task<IEnumerable<EstatisticaDTO.TopCidItem>> ObterTopCidsAsync(
        int? ano, int? mes, int limite, Unidade? unidade, Guid? setorId, ClassificacaoAtestado? classificacao)
    {
        var atestados = AplicarFiltrosComuns(await ObterComAfastamentoAsync(), unidade, setorId, classificacao)
            .Where(a => !string.IsNullOrWhiteSpace(a.CID));
        var filtrados = atestados
            .Where(a => (!ano.HasValue || Data(a).Year == ano.Value) && (!mes.HasValue || Data(a).Month == mes.Value));

        var contagem = filtrados
            .GroupBy(a => a.CID!)
            .Select(g => new
            {
                Cid = g.Key,
                Quantidade = g.Count(),
                QuantidadeFuncionarios = g.Select(a => a.FuncionarioId).Distinct().Count(),
            })
            .OrderByDescending(g => g.Quantidade)
            .Take(limite)
            .ToList();

        var descricoes = (await _cidRepositorio.ObterPorCodigosAsync(contagem.Select(c => c.Cid)))
            .ToDictionary(c => c.Codigo, c => c.Descricao);

        return contagem.Select(c => new EstatisticaDTO.TopCidItem
        {
            Cid = c.Cid,
            Descricao = descricoes.TryGetValue(c.Cid, out var descricao) ? descricao : null,
            Quantidade = c.Quantidade,
            QuantidadeFuncionarios = c.QuantidadeFuncionarios,
        });
    }

    public async Task<IEnumerable<EstatisticaDTO.TopMedicoItem>> ObterTopMedicosAsync(
        int? ano, int? mes, int limite, Unidade? unidade, Guid? setorId, ClassificacaoAtestado? classificacao)
    {
        var atestados = AplicarFiltrosComuns(await ObterComAfastamentoAsync(), unidade, setorId, classificacao)
            .Where(a => a.MedicoId.HasValue);
        var filtrados = atestados
            .Where(a => (!ano.HasValue || Data(a).Year == ano.Value) && (!mes.HasValue || Data(a).Month == mes.Value));

        var contagem = filtrados
            .GroupBy(a => new { a.MedicoId, a.NomeMedico })
            .Select(g => new
            {
                g.Key.MedicoId,
                NomeMedico = g.Key.NomeMedico ?? "",
                Quantidade = g.Count(),
                QuantidadeFuncionarios = g.Select(a => a.FuncionarioId).Distinct().Count(),
            })
            .OrderByDescending(g => g.Quantidade)
            .Take(limite)
            .ToList();

        var crms = (await _medicoRepositorio.ObterTodosAsync())
            .ToDictionary(m => m.Id, m => m.Crm);

        return contagem.Select(c => new EstatisticaDTO.TopMedicoItem
        {
            MedicoId = c.MedicoId!.Value,
            NomeMedico = c.NomeMedico,
            Crm = crms.TryGetValue(c.MedicoId.Value, out var crm) ? crm : null,
            Quantidade = c.Quantidade,
            QuantidadeFuncionarios = c.QuantidadeFuncionarios,
        });
    }

    public async Task<EstatisticaDTO.FuncionarioEstatisticaResponse> ObterPorFuncionarioAsync(Guid funcionarioId, int? ano, int? mes)
    {
        var funcionario = await _funcionarioRepositorio.ObterPorIdAsync(funcionarioId);

        var todos = (await ObterComAfastamentoAsync()).Where(a => a.FuncionarioId == funcionarioId).ToList();
        var doAno = ano.HasValue ? todos.Where(a => Data(a).Year == ano.Value).ToList() : todos;
        var doMesSelecionado = mes.HasValue ? doAno.Where(a => Data(a).Month == mes.Value).ToList() : doAno;

        var serieMensal = Enumerable.Range(1, 12).Select(mesDoAno =>
        {
            var doMes = doAno.Where(a => Data(a).Month == mesDoAno).ToList();
            return new EstatisticaDTO.SerieMensalItem
            {
                Mes = mesDoAno,
                Quantidade = doMes.Count,
                DiasAfastados = doMes.Sum(Dias),
            };
        }).ToList();

        var porDiaSemana = Enumerable.Range(0, 7).Select(dia => new EstatisticaDTO.DiaSemanaItem
        {
            DiaSemana = dia,
            Quantidade = doMesSelecionado.Count(a => (int)Data(a).DayOfWeek == dia),
        }).ToList();

        return new EstatisticaDTO.FuncionarioEstatisticaResponse
        {
            FuncionarioId = funcionarioId,
            NomeFuncionario = funcionario.Nome,
            TotalAtestados = doMesSelecionado.Count,
            TotalDiasAfastado = doMesSelecionado.Sum(Dias),
            TotalHorasAfastado = Math.Round(doMesSelecionado.Sum(Horas), 1),
            MediaDiasPorAtestado =
                doMesSelecionado.Count(a => a.TipoAtestado == TipoAtestado.DiaCompleto) > 0
                    ? Math.Round(doMesSelecionado.Where(a => a.TipoAtestado == TipoAtestado.DiaCompleto).Average(Dias), 1)
                    : 0,
            UltimoAtestado = doMesSelecionado.Count > 0 ? doMesSelecionado.Max(a => a.DiaAfastamento) : null,
            SerieMensal = serieMensal,
            PorDiaSemana = porDiaSemana,
        };
    }

    public async Task<IEnumerable<EstatisticaDTO.AtestadoDetalheItem>> ObterDetalheAtestadosAsync(
        string? cid, Guid? setorId, bool semSetor, Guid? funcionarioId, Guid? medicoId,
        ClassificacaoAtestado? classificacao, Unidade? unidade, int? ano, int? mes,
        bool apenasAtivos, int? diasMinimosAfastamento)
    {
        IEnumerable<AtestadoEntity> atestados = await ObterComAfastamentoAsync();

        if (unidade.HasValue)
            atestados = atestados.Where(a => a.Funcionario.Setor != null && a.Funcionario.Setor.Unidade == unidade.Value);

        if (!string.IsNullOrWhiteSpace(cid))
            atestados = atestados.Where(a => string.Equals(a.CID, cid, StringComparison.OrdinalIgnoreCase));

        if (semSetor)
            atestados = atestados.Where(a => a.Funcionario.SetorId == null);
        else if (setorId.HasValue)
            atestados = atestados.Where(a => a.Funcionario.SetorId == setorId.Value);

        if (funcionarioId.HasValue)
            atestados = atestados.Where(a => a.FuncionarioId == funcionarioId.Value);

        if (medicoId.HasValue)
            atestados = atestados.Where(a => a.MedicoId == medicoId.Value);

        if (classificacao.HasValue)
            atestados = atestados.Where(a => a.Classificacao == classificacao.Value);

        if (ano.HasValue)
            atestados = atestados.Where(a => Data(a).Year == ano.Value);

        if (mes.HasValue)
            atestados = atestados.Where(a => Data(a).Month == mes.Value);

        if (apenasAtivos)
        {
            var hoje = DateTime.UtcNow.Date;
            atestados = atestados.Where(a =>
                a.TipoAtestado == TipoAtestado.DiaCompleto &&
                Data(a) <= hoje && a.DiaRetorno.HasValue && a.DiaRetorno.Value.Date >= hoje);

            if (diasMinimosAfastamento.HasValue)
                atestados = atestados.Where(a => (hoje - Data(a)).TotalDays >= diasMinimosAfastamento.Value);
        }

        return atestados
            .OrderByDescending(a => a.DiaAfastamento)
            .Select(a => new EstatisticaDTO.AtestadoDetalheItem
            {
                AtestadoId = a.Id,
                FuncionarioId = a.FuncionarioId,
                NomeFuncionario = a.NomeFuncionario,
                NomeDoSetor = a.Funcionario.Setor?.NomeDoSetor,
                TipoAtestado = a.TipoAtestado,
                Classificacao = a.Classificacao,
                NomeMedico = a.NomeMedico,
                DiaAfastamento = a.DiaAfastamento,
                DiaRetorno = a.DiaRetorno,
                HoraInicio = a.HoraInicio,
                HoraFim = a.HoraFim,
                TotalDiasFora = a.TotalDiasFora,
                TotalHoras = a.TotalHoras,
                Observacoes = a.Observacoes,
            });
    }

    public async Task<IEnumerable<EstatisticaDTO.ReincidenteItem>> ObterReincidentesAsync(int meses, int minimoAtestados)
    {
        var atestados = await ObterComAfastamentoAsync();
        var limite = DateTime.UtcNow.Date.AddMonths(-meses);

        return atestados
            .Where(a => Data(a) >= limite)
            .GroupBy(a => new { a.FuncionarioId, a.NomeFuncionario, Setor = a.Funcionario.Setor?.NomeDoSetor })
            .Select(g => new EstatisticaDTO.ReincidenteItem
            {
                FuncionarioId = g.Key.FuncionarioId,
                NomeFuncionario = g.Key.NomeFuncionario,
                NomeDoSetor = g.Key.Setor,
                QuantidadeUltimosMeses = g.Count(),
                UltimoAtestado = g.Max(a => a.DiaAfastamento),
            })
            .Where(item => item.QuantidadeUltimosMeses >= minimoAtestados)
            .OrderByDescending(item => item.QuantidadeUltimosMeses);
    }

    private async Task<List<AtestadoEntity>> ObterComAfastamentoAsync()
    {
        var atestados = await _atestadosRepositorio.ObterTodosComFuncionarioESetorAsync();
        return atestados.Where(a => a.DiaAfastamento.HasValue).ToList();
    }

    private static IEnumerable<AtestadoEntity> AplicarFiltrosComuns(
        IEnumerable<AtestadoEntity> atestados, Unidade? unidade, Guid? setorId, ClassificacaoAtestado? classificacao)
    {
        if (unidade.HasValue)
            atestados = atestados.Where(a => a.Funcionario.Setor != null && a.Funcionario.Setor.Unidade == unidade.Value);

        if (setorId.HasValue)
            atestados = atestados.Where(a => a.Funcionario.SetorId == setorId.Value);

        if (classificacao.HasValue)
            atestados = atestados.Where(a => a.Classificacao == classificacao.Value);

        return atestados;
    }

    private static DateTime Data(AtestadoEntity atestado) => atestado.DiaAfastamento!.Value.Date;

    private static int Dias(AtestadoEntity atestado) => atestado.TotalDiasFora ?? 0;

    private static double Horas(AtestadoEntity atestado) => atestado.TotalHoras ?? 0;
}
