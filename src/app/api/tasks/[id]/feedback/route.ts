import { NextResponse } from 'next/server';
import { getTask, updateTask, createTask } from '@/lib/tasks';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { passed, testNotes } = body;

    const task = await getTask(id);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (passed) {
      await updateTask(id, {
        status: 'passed',
        testStatus: 'passed',
        testNotes: testNotes || 'All tests passed',
      });
      return NextResponse.json({ success: true, status: 'passed' });
    } else {
      await updateTask(id, {
        status: 'failed',
        testStatus: 'failed',
        testNotes: testNotes || 'Test failed - no details provided',
        errorMessage: testNotes,
      });

      const followUpBrief = `FIX: ${task.brief}\n\nOriginal task failed testing. Error reported:\n${testNotes}\n\nPlease fix the issues described above.`;

      const followUp = await createTask({
        projectId: task.projectId,
        projectName: task.projectName,
        brief: followUpBrief,
        parentTaskId: id,
        claudeInstructions: `This is a fix for task ${id} which failed testing.\nOriginal brief: ${task.brief}\nError: ${testNotes}\nFix the reported issues.`,
      });

      try {
        const orchestratorUrl = process.env.ORCHESTRATOR_URL || 'https://orchestrator.moneturamedia.com';
        await fetch(`${orchestratorUrl}/run-task`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ORCHESTRATOR_SECRET || '',
          },
          body: JSON.stringify({
            taskId: followUp.id,
            projectId: followUp.projectId,
            brief: followUp.brief,
            claudeInstructions: followUp.claudeInstructions,
          }),
        });
      } catch (e) {
        console.log('Could not auto-trigger orchestrator for follow-up task:', e);
      }

      return NextResponse.json({
        success: true,
        status: 'failed',
        followUpTask: followUp,
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
