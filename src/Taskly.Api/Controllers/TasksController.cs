using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Taskly.Application.Features.Tasks.Commands;
using Taskly.Application.Features.Tasks.Queries;

namespace Taskly.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/tasks")]
public sealed class TasksController : ControllerBase
{
    private readonly IMediator _mediator;
    public TasksController(IMediator mediator) => _mediator = mediator;

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTaskCommand cmd, CancellationToken ct)
        => Ok(await _mediator.Send(cmd, ct));

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] bool? completed, [FromQuery] DateTime? dueOnOrBefore,
                                          [FromQuery] int page = 1, [FromQuery] int pageSize = 20,
                                          CancellationToken ct = default)
        => Ok(await _mediator.Send(new ListTasksQuery(completed, dueOnOrBefore, page, pageSize), ct));

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTaskCommand cmd, CancellationToken ct)
        => Ok(await _mediator.Send(cmd with { Id = id }, ct));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteTaskCommand(id), ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/toggle")]
    public async Task<IActionResult> Toggle(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new ToggleCompleteCommand(id), ct));
}

