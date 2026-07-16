using api.fluvimar.domain.Entities.Commun;
using api.fluvimar.domain.Enums;

namespace api.fluvimar.domain.Entities;

public sealed class AtestadoEntity : AbstractEntity
{
    public int CodigoInterno { get; private set; }
    public string NomeFuncionario { get; private set; } = string.Empty;
    public string? CID { get; private set; }
    public TipoAtestado TipoAtestado { get; private set; } = TipoAtestado.DiaCompleto;
    public ClassificacaoAtestado Classificacao { get; private set; } = ClassificacaoAtestado.Atestado;
    public Guid? MedicoId { get; private set; }
    public MedicoEntity? Medico { get; private set; }
    public string? NomeMedico { get; private set; }
    public DateTime? DiaAfastamento { get; private set; }
    public DateTime? DiaRetorno { get; private set; }
    public TimeSpan? HoraInicio { get; private set; }
    public TimeSpan? HoraFim { get; private set; }

    public int? TotalDiasFora => TipoAtestado == TipoAtestado.DiaCompleto &&
                                 DiaAfastamento.HasValue && DiaRetorno.HasValue ?
                                 (DiaRetorno.Value - DiaAfastamento.Value).Days : null;

    public double? TotalHoras => TipoAtestado == TipoAtestado.Horario &&
                                 HoraInicio.HasValue && HoraFim.HasValue ?
                                 Math.Round((HoraFim.Value - HoraInicio.Value).TotalHours, 2) : null;

    public string? Observacoes { get; private set; }
    public Guid FuncionarioId { get; private set; }
    public Funcionario Funcionario { get; private set; } = null!;

    private AtestadoEntity() : base() { }
    public AtestadoEntity(string userId) : base(userId) { }

    public void SetFuncionario(Funcionario funcionario)
    {
        Funcionario = funcionario ?? throw new ArgumentNullException(nameof(funcionario));
        FuncionarioId = funcionario.Id;
        NomeFuncionario = funcionario.Nome;
    }

    public void SetCID(string? cid)
    {
        CID = cid;
    }

    public void SetClassificacao(ClassificacaoAtestado classificacao)
    {
        Classificacao = classificacao;
    }

    public void SetMedico(MedicoEntity? medico)
    {
        Medico = medico;
        MedicoId = medico?.Id;
        NomeMedico = medico?.Nome;
    }

    public void SetTipoAtestado(TipoAtestado tipo)
    {
        TipoAtestado = tipo;
        if (tipo == TipoAtestado.DiaCompleto)
        {
            HoraInicio = null;
            HoraFim = null;
        }
    }

    public void SetDiaAfastamento(DateTime diaAfastamento)
    {
        if (diaAfastamento > DateTime.Now)
            throw new ArgumentException("O afastamento não pode ser no futuro.");

        if (DiaRetorno.HasValue && TipoAtestado != TipoAtestado.Horario && diaAfastamento >= DiaRetorno)
            throw new ArgumentException("O afastamento não pode ser feito após o retorno.");

        DiaAfastamento = diaAfastamento;
    }

    public void SetDiaRetorno(DateTime diaRetorno)
    {
        if (TipoAtestado == TipoAtestado.Horario)
        {
            if (DiaAfastamento.HasValue && diaRetorno.Date != DiaAfastamento.Value.Date)
                throw new ArgumentException("Atestados por horário devem ter o mesmo dia de afastamento e retorno.");
        }
        else if (DiaAfastamento.HasValue && diaRetorno <= DiaAfastamento)
        {
            throw new ArgumentException("O retorno não pode ser anterior ou igual ao afastamento.");
        }

        DiaRetorno = diaRetorno;
    }

    public void SetHorario(TimeSpan? horaInicio, TimeSpan? horaFim)
    {
        if (TipoAtestado != TipoAtestado.Horario)
        {
            HoraInicio = null;
            HoraFim = null;
            return;
        }

        if (!horaInicio.HasValue || !horaFim.HasValue)
            throw new ArgumentException("Informe o horário de início e fim do atestado.");

        if (horaFim <= horaInicio)
            throw new ArgumentException("O horário de fim deve ser posterior ao horário de início.");

        HoraInicio = horaInicio;
        HoraFim = horaFim;
    }

    public void SetObservacao(string? observacao)
    {
        Observacoes = observacao?.ToUpper();
    }
}
