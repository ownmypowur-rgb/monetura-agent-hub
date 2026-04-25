# Orchestrator Integration Guide

## Overview
The orchestrator (orchestrator.moneturamedia.com) should be updated to persist task records
to the Agent Hub's task memory system via API.

## API Base URL
`https://hub.moneturamedia.com`

## Authentication
All write operations require:
```
Authorization: Bearer <ORCHESTRATOR_SECRET>
```

## Integration Points

### 1. When a task starts
```python
import requests

def create_task_record(project_id, project_name, brief, claude_instructions=None):
    response = requests.post(
        "https://hub.moneturamedia.com/api/tasks",
        headers={
            "Authorization": f"Bearer {ORCHESTRATOR_SECRET}",
            "Content-Type": "application/json"
        },
        json={
            "projectId": project_id,
            "projectName": project_name,
            "brief": brief,
            "claudeInstructions": claude_instructions
        }
    )
    return response.json()  # returns task with id
```

### 2. Stream logs in real time
```python
def append_task_logs(task_id, new_log_lines):
    requests.patch(
        f"https://hub.moneturamedia.com/api/tasks/{task_id}",
        headers={
            "Authorization": f"Bearer {ORCHESTRATOR_SECRET}",
            "Content-Type": "application/json"
        },
        json={
            "status": "running",
            "appendLogs": new_log_lines
        }
    )
```

### 3. Update status as task progresses
```python
def update_task_status(task_id, status):
    requests.patch(
        f"https://hub.moneturamedia.com/api/tasks/{task_id}",
        headers={
            "Authorization": f"Bearer {ORCHESTRATOR_SECRET}",
            "Content-Type": "application/json"
        },
        json={"status": status}
    )
```

### 4. Mark complete with deployment URL
```python
def complete_task(task_id, deployment_url=None):
    data = {"status": "complete"}
    if deployment_url:
        data["deploymentUrl"] = deployment_url
    
    requests.patch(
        f"https://hub.moneturamedia.com/api/tasks/{task_id}",
        headers={
            "Authorization": f"Bearer {ORCHESTRATOR_SECRET}",
            "Content-Type": "application/json"
        },
        json=data
    )
```

### 5. Mark failed with error
```python
def fail_task(task_id, error_message):
    requests.patch(
        f"https://hub.moneturamedia.com/api/tasks/{task_id}",
        headers={
            "Authorization": f"Bearer {ORCHESTRATOR_SECRET}",
            "Content-Type": "application/json"
        },
        json={
            "status": "failed",
            "errorMessage": error_message
        }
    )
```

## Environment Variable
Add to orchestrator's `.env`:
```
ORCHESTRATOR_SECRET=JsjD7SzyMLvrFGOto68cfQ3dHun1U9ge
HUB_API_URL=https://hub.moneturamedia.com
```
