using api.fluvimar.domain.DTO;
using api.fluvimar.domain.Entities;
using api.fluvimar.domain.Interfaces.Repositorios;
using api.fluvimar.domain.Interfaces.Servicos;

namespace api.fluvimar.application.Servicos;

public sealed class FuncionarioServico : IFuncionarioServico
{
    private readonly IFuncionarioRepositorio _funcionarioRepositorio;
    private readonly ISetorRepositorio _setorRepositorio;

    public FuncionarioServico(IFuncionarioRepositorio funcionarioRepositorio, ISetorRepositorio setorRepositorio)
    {
        _funcionarioRepositorio = funcionarioRepositorio;
        _setorRepositorio = setorRepositorio;
    }

    public async Task<IEnumerable<FuncionarioDTO.FuncionarioResponse>> ObterTodosAsync()
    {
        var funcionarios = await _funcionarioRepositorio.ObterTodosAsync();
        return funcionarios.Select(MapearParaResponse);
    }

    public async Task<FuncionarioDTO.FuncionarioResponse> ObterPorIdAsync(Guid id)
    {
        var funcionario = await _funcionarioRepositorio.ObterPorIdAsync(id);
        return MapearParaResponse(funcionario);
    }

    public async Task<FuncionarioDTO.FuncionarioResponse> AdicionarAsync(FuncionarioDTO.FuncionarioRequest dto, string userId)
    {
        var funcionario = new Funcionario(userId);
        funcionario.SetNome(dto.Nome);
        funcionario.SetSetor(await ResolverSetorAsync(dto.SetorId));

        await _funcionarioRepositorio.AdicionarAsync(funcionario);

        return MapearParaResponse(funcionario);
    }

    public async Task AtualizarAsync(FuncionarioDTO.AbstractFuncionarioWithIdDTO dto, string userId)
    {
        var funcionario = await _funcionarioRepositorio.ObterPorIdAsync(dto.Id);
        funcionario.SetNome(dto.Nome);
        funcionario.SetSetor(await ResolverSetorAsync(dto.SetorId));
        funcionario.Update(userId);

        await _funcionarioRepositorio.AtualizarAsync(funcionario);
    }

    public async Task RemoveAsync(Guid id)
    {
        var funcionario = await _funcionarioRepositorio.ObterPorIdAsync(id);
        await _funcionarioRepositorio.RemoverAsync(funcionario);
    }

    private async Task<SetorEntity?> ResolverSetorAsync(Guid? setorId) =>
        setorId.HasValue ? await _setorRepositorio.ObterPorIdAsync(setorId.Value) : null;

    private static FuncionarioDTO.FuncionarioResponse MapearParaResponse(Funcionario funcionario) =>
        new()
        {
            Id = funcionario.Id,
            Nome = funcionario.Nome,
            SetorId = funcionario.SetorId,
            NomeDoSetor = funcionario.Setor?.NomeDoSetor
        };
}
