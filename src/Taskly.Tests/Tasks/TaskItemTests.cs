using NUnit.Framework;
using Taskly.Domain.Tasks;
using Taskly.Domain.Tasks.ValueObjects;

namespace Taskly.Tests.Tasks;

[TestFixture]
public class TaskItemTests
{
    [Test]
    public void Toggle_Changes_State_And_Timestamp()
    {
        var now = DateTime.UtcNow;
        var userId = Guid.NewGuid();
        var t = TaskItem.Create(userId, TaskName.Create("X"), TaskDescription.Create(null), DueDate.Create(null), now);
        Assert.That(t.IsCompleted, Is.False);
        t.ToggleComplete(now);
        Assert.That(t.IsCompleted, Is.True);
        Assert.That(t.CompletedAtUtc, Is.Not.Null);
    }
}
