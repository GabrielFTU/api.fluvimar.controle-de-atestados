using api.fluvimar.domain.DTO;
using api.fluvimar.domain.Enums;

namespace api.fluvimar.domain.Interfaces.Servicos
{
    public interface IEstatisticaServico
    {
        Task<EstatisticaDTO.ResumoResponse> ObterResumoAsync();
        Task<IEnumerable<int>> ObterAnosDisponiveisAsync();
        Task<IEnumerable<EstatisticaDTO.SerieMensalItem>> ObterSerieMensalAsync(
            int ano, Unidade? unidade, Guid? setorId, ClassificacaoAtestado? classificacao);
        Task<IEnumerable<EstatisticaDTO.DiaSemanaItem>> ObterPorDiaSemanaAsync(
            int? ano, int? mes, Unidade? unidade, Guid? setorId, ClassificacaoAtestado? classificacao);
        Task<IEnumerable<EstatisticaDTO.SetorItem>> ObterPorSetorAsync(
            int? ano, int? mes, Unidade? unidade, ClassificacaoAtestado? classificacao);
        Task<IEnumerable<EstatisticaDTO.TopFuncionarioItem>> ObterTopFuncionariosAsync(
            int ano, int? mes, int limite, Unidade? unidade, Guid? setorId, ClassificacaoAtestado? classificacao);
        Task<IEnumerable<EstatisticaDTO.TopCidItem>> ObterTopCidsAsync(
            int? ano, int? mes, int limite, Unidade? unidade, Guid? setorId, ClassificacaoAtestado? classificacao);
        Task<IEnumerable<EstatisticaDTO.TopMedicoItem>> ObterTopMedicosAsync(
            int? ano, int? mes, int limite, Unidade? unidade, Guid? setorId, ClassificacaoAtestado? classificacao);
        Task<EstatisticaDTO.FuncionarioEstatisticaResponse> ObterPorFuncionarioAsync(Guid funcionarioId, int? ano, int? mes);
        Task<IEnumerable<EstatisticaDTO.AtestadoDetalheItem>> ObterDetalheAtestadosAsync(
            string? cid, Guid? setorId, bool semSetor, Guid? funcionarioId, Guid? medicoId,
            ClassificacaoAtestado? classificacao, Unidade? unidade, int? ano, int? mes,
            bool apenasAtivos, int? diasMinimosAfastamento);
        Task<IEnumerable<EstatisticaDTO.ReincidenteItem>> ObterReincidentesAsync(int meses, int minimoAtestados);
    }
}
