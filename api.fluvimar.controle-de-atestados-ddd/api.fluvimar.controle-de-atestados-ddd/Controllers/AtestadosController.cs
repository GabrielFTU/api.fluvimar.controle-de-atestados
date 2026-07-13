using api.fluvimar.domain.DTO;
using api.fluvimar.domain.Interfaces.Servicos;
using Microsoft.AspNetCore.Mvc;

namespace api.fluvimar.controle_de_atestados_ddd.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AtestadosController : ControllerBase
{
    private readonly IAtestadoServico _atestadoServico;

    public AtestadosController(IAtestadoServico atestadoServico)
    {
        _atestadoServico = atestadoServico;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AtestadoDTO.AtestadoResponse>>> ObterTodos() =>
        Ok(await _atestadoServico.ObterTodosAsync());

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AtestadoDTO.AtestadoResponse>> ObterPorId(Guid id) =>
        Ok(await _atestadoServico.ObterPorIdAsync(id));

    [HttpPost]
    public async Task<IActionResult> Adicionar(AtestadoDTO.AtestadoRequest dto, [FromHeader(Name = "X-User-Id")] string userId)
    {
        await _atestadoServico.AdicionarAsync(dto, userId);
        return StatusCode(StatusCodes.Status201Created);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Atualizar(Guid id, AtestadoDTO.AtestadoRequestWithId dto, [FromHeader(Name = "X-User-Id")] string userId)
    {
        if (id != dto.Id)
            return BadRequest("O id da rota não corresponde ao id do corpo da requisição.");

        await _atestadoServico.AtualizarAsync(dto, userId);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Remover(Guid id)
    {
        await _atestadoServico.RemoveAsync(id);
        return NoContent();
    }
}
