using api.fluvimar.domain.DTO;
using api.fluvimar.domain.Interfaces.Servicos;
using Microsoft.AspNetCore.Mvc;

namespace api.fluvimar.controle_de_atestados_ddd.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class SetoresController : ControllerBase
{
    private readonly ISetorServico _setorServico;

    public SetoresController(ISetorServico setorServico)
    {
        _setorServico = setorServico;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SetorDTO.SetorResponse>>> ObterTodos() =>
        Ok(await _setorServico.ObterTodosAsync());

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SetorDTO.SetorResponse>> ObterPorId(Guid id) =>
        Ok(await _setorServico.ObterPorIdAsync(id));

    [HttpPost]
    public async Task<IActionResult> Adicionar(SetorDTO.SetorRequest dto, [FromHeader(Name = "X-User-Id")] string userId)
    {
        await _setorServico.AdicionarAsync(dto, userId);
        return StatusCode(StatusCodes.Status201Created);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Atualizar(Guid id, SetorDTO.SetorRequestWihId dto, [FromHeader(Name = "X-User-Id")] string userId)
    {
        if (id != dto.Id)
            return BadRequest("O id da rota não corresponde ao id do corpo da requisição.");

        await _setorServico.AtualizarAsync(dto, userId);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Remover(Guid id)
    {
        await _setorServico.RemoveAsync(id);
        return NoContent();
    }
}
