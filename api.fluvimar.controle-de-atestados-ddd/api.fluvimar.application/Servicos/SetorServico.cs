using api.fluvimar.domain.DTO;
using api.fluvimar.domain.Entities;
using api.fluvimar.domain.Interfaces.Repositorios;
using api.fluvimar.domain.Interfaces.Servicos;

namespace api.fluvimar.application.Servicos;

public sealed class SetorServico : ISetorServico
{
    private readonly ISetorRepositorio _setorRepositorio;

    public SetorServico(ISetorRepositorio setorRepositorio)
    {
        _setorRepositorio = setorRepositorio;
    }

    public async Task<IEnumerable<SetorDTO.SetorResponse>> ObterTodosAsync()
    {
        var setores = await _setorRepositorio.ObterTodosAsync();
        return setores.Select(MapearParaResponse);
    }

    public async Task<SetorDTO.SetorResponse> ObterPorIdAsync(Guid id)
    {
        var setor = await _setorRepositorio.ObterPorIdAsync(id);
        return MapearParaResponse(setor);
    }

    public async Task AdicionarAsync(SetorDTO.SetorRequest dto, string userId)
    {
        var setor = new SetorEntity(userId);
        AplicarDados(setor, dto, userId);

        await _setorRepositorio.AdicionarAsync(setor);
    }

    public async Task AtualizarAsync(SetorDTO.AbstractSetorWithIdDTO dto, string userId)
    {
        var setor = await _setorRepositorio.ObterPorIdAsync(dto.Id);
        AplicarDados(setor, dto, userId);

        await _setorRepositorio.AtualizarAsync(setor);
    }

    public async Task RemoveAsync(Guid id)
    {
        var setor = await _setorRepositorio.ObterPorIdAsync(id);
        await _setorRepositorio.RemoverAsync(setor);
    }

    private static void AplicarDados(SetorEntity setor, SetorDTO.AbstractSetorDTO dto, string userId)
    {
        setor.setNomeDoSetor(dto.NomeDoSetor, userId);
        setor.setResponsavel(dto.Responsavel ?? string.Empty, userId);
        setor.SetUnidade(dto.Unidade, userId);
    }

    private static SetorDTO.SetorResponse MapearParaResponse(SetorEntity setor) =>
        new()
        {
            Id = setor.Id,
            NomeDoSetor = setor.NomeDoSetor,
            Responsavel = setor.Responsavel,
            Unidade = setor.Unidade
        };
}
