using api.fluvimar.domain.DTO;
using api.fluvimar.domain.Entities;
using api.fluvimar.domain.Interfaces.Repositorios;
using api.fluvimar.domain.Interfaces.Servicos;

namespace api.fluvimar.application.Servicos;

public sealed class MedicoServico : IMedicoServico
{
    private readonly IMedicoRepositorio _medicoRepositorio;

    public MedicoServico(IMedicoRepositorio medicoRepositorio)
    {
        _medicoRepositorio = medicoRepositorio;
    }

    public async Task<IEnumerable<MedicoDTO.MedicoResponse>> ObterTodosAsync()
    {
        var medicos = await _medicoRepositorio.ObterTodosAsync();
        return medicos.Select(MapearParaResponse);
    }

    public async Task<MedicoDTO.MedicoResponse> AdicionarAsync(MedicoDTO.MedicoRequest dto, string userId)
    {
        var medico = new MedicoEntity(userId);
        medico.SetNome(dto.Nome);
        medico.SetCrm(dto.Crm);

        await _medicoRepositorio.AdicionarAsync(medico);

        return MapearParaResponse(medico);
    }

    private static MedicoDTO.MedicoResponse MapearParaResponse(MedicoEntity medico) =>
        new()
        {
            Id = medico.Id,
            Nome = medico.Nome,
            Crm = medico.Crm,
        };
}
