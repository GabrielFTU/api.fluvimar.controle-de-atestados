using api.fluvimar.domain.DTO;
using api.fluvimar.domain.Entities;
using api.fluvimar.domain.Interfaces.Repositorios;
using api.fluvimar.domain.Interfaces.Servicos;

namespace api.fluvimar.application.Servicos;

public sealed class FuncionarioServico : IFuncionarioServico
{
    private readonly IFuncionarioRepositorio _funcionarioRepositorio;

    public FuncionarioServico(IFuncionarioRepositorio funcionarioRepositorio)
    {
        _funcionarioRepositorio = funcionarioRepositorio;
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

    public async Task AdicionarAsync(FuncionarioDTO.FuncionarioRequest dto, string userId)
    {
        var funcionario = new Funcionario(userId);
        funcionario.SetNome(dto.Nome);

        await _funcionarioRepositorio.AdicionarAsync(funcionario);
    }

    public async Task AtualizarAsync(FuncionarioDTO.AbstractFuncionarioWithIdDTO dto, string userId)
    {
        var funcionario = await _funcionarioRepositorio.ObterPorIdAsync(dto.Id);
        funcionario.SetNome(dto.Nome);
        funcionario.Update(userId);

        await _funcionarioRepositorio.AtualizarAsync(funcionario);
    }

    public async Task RemoveAsync(Guid id)
    {
        var funcionario = await _funcionarioRepositorio.ObterPorIdAsync(id);
        await _funcionarioRepositorio.RemoverAsync(funcionario);
    }

    private static FuncionarioDTO.FuncionarioResponse MapearParaResponse(Funcionario funcionario) =>
        new()
        {
            Id = funcionario.Id,
            Nome = funcionario.Nome
        };
}
