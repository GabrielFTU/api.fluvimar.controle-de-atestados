using api.fluvimar.domain.DTO;
using api.fluvimar.domain.Interfaces.Servicos;
using Microsoft.AspNetCore.Mvc;

namespace api.fluvimar.controle_de_atestados_ddd.Controllers;

[ApiController]
[Route("api/[controller]")]
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
    public async Task<IActionResult> Adicionar(FuncionarioDTO.FuncionarioRequest dto, [FromHeader(Name = "X-User-Id")] string userId)
    {
        await _funcionarioServico.AdicionarAsync(dto, userId);
        return StatusCode(StatusCodes.Status201Created);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Atualizar(Guid id, FuncionarioDTO.FuncionarioRequestWithId dto, [FromHeader(Name = "X-User-Id")] string userId)
    {
        if (id != dto.Id)
            return BadRequest("O id da rota não corresponde ao id do corpo da requisição.");

        await _funcionarioServico.AtualizarAsync(dto, userId);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Remover(Guid id)
    {
        await _funcionarioServico.RemoveAsync(id);
        return NoContent();
    }
}
