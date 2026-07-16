using api.fluvimar.controle_de_atestados_ddd.Controllers.Extensions;
using api.fluvimar.domain.DTO;
using api.fluvimar.domain.Interfaces.Servicos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.fluvimar.controle_de_atestados_ddd.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class FuncionariosController : ControllerBase
{
    private readonly IFuncionarioServico _funcionarioServico;

    public FuncionariosController(IFuncionarioServico funcionarioServico)
    {
        _funcionarioServico = funcionarioServico;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<FuncionarioDTO.FuncionarioResponse>>> ObterTodos() =>
        Ok(await _funcionarioServico.ObterTodosAsync());

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<FuncionarioDTO.FuncionarioResponse>> ObterPorId(Guid id) =>
        Ok(await _funcionarioServico.ObterPorIdAsync(id));

    [HttpPost]
    public async Task<ActionResult<FuncionarioDTO.FuncionarioResponse>> Adicionar(FuncionarioDTO.FuncionarioRequest dto)
    {
        var response = await _funcionarioServico.AdicionarAsync(dto, this.UsuarioId());
        return StatusCode(StatusCodes.Status201Created, response);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Atualizar(Guid id, FuncionarioDTO.FuncionarioRequestWithId dto)
    {
        if (id != dto.Id)
            return BadRequest("O id da rota não corresponde ao id do corpo da requisição.");

        await _funcionarioServico.AtualizarAsync(dto, this.UsuarioId());
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Remover(Guid id)
    {
        await _funcionarioServico.RemoveAsync(id);
        return NoContent();
    }
}
