# Test Task Creation with Enhanced User Information
Write-Host "=== Testing Enhanced Task Creation ===" -ForegroundColor Green
Write-Host ""

# Step 1: Register a new user
Write-Host "1. Registering new user..." -ForegroundColor Yellow
$registerData = @{
    Username = "taskuser"
    Email = "taskuser@example.com"
    Password = "password123"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-WebRequest -Uri "http://localhost:5046/api/auth/register" -Method POST -Body $registerData -ContentType "application/json"
    Write-Host "✅ User registered successfully: Status $($registerResponse.StatusCode)" -ForegroundColor Green
    
    $authResult = $registerResponse.Content | ConvertFrom-Json
    $accessToken = $authResult.accessToken
    $userId = $authResult.user.id
    $username = $authResult.user.username
    
    Write-Host "   User ID: $userId" -ForegroundColor Cyan
    Write-Host "   Username: $username" -ForegroundColor Cyan
    Write-Host "   Access Token: $($accessToken.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ User registration failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Cyan
        Write-Host "   Response: $($_.Exception.Response.Content)" -ForegroundColor Cyan
    }
    exit 1
}

Write-Host ""

# Step 2: Create a task (should include user info in response)
Write-Host "2. Creating task with enhanced user information..." -ForegroundColor Yellow
$createTaskData = @{
    Name = "Test Task with User Info"
    Description = "This task should include user details in the response"
    DueDate = (Get-Date).AddDays(7).ToString("yyyy-MM-ddTHH:mm:ssZ")
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $accessToken"
    "Content-Type" = "application/json"
}

try {
    $createResponse = Invoke-WebRequest -Uri "http://localhost:5046/api/tasks" -Method POST -Body $createTaskData -Headers $headers
    Write-Host "✅ Task created successfully: Status $($createResponse.StatusCode)" -ForegroundColor Green
    
    $taskResult = $createResponse.Content | ConvertFrom-Json
    Write-Host "   Task ID: $($taskResult.id)" -ForegroundColor Cyan
    Write-Host "   Task Name: $($taskResult.name)" -ForegroundColor Cyan
    Write-Host "   User ID: $($taskResult.userId)" -ForegroundColor Cyan
    Write-Host "   Username: $($taskResult.username)" -ForegroundColor Cyan
    Write-Host "   Is Completed: $($taskResult.isCompleted)" -ForegroundColor Cyan
    Write-Host "   Created At: $($taskResult.createdAtUtc)" -ForegroundColor Cyan
    
    # Verify user information is included
    if ($taskResult.userId -eq $userId -and $taskResult.username -eq $username) {
        Write-Host "✅ User information correctly included in task response!" -ForegroundColor Green
    } else {
        Write-Host "❌ User information mismatch in task response!" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Task creation failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Cyan
        Write-Host "   Response: $($_.Exception.Response.Content)" -ForegroundColor Cyan
    }
}

Write-Host ""

# Step 3: List tasks to see user information
Write-Host "3. Listing tasks to verify user information..." -ForegroundColor Yellow
try {
    $listResponse = Invoke-WebRequest -Uri "http://localhost:5046/api/tasks" -Method GET -Headers $headers
    Write-Host "✅ Tasks listed successfully: Status $($listResponse.StatusCode)" -ForegroundColor Green
    
    $tasksResult = $listResponse.Content | ConvertFrom-Json
    Write-Host "   Total Tasks: $($tasksResult.totalCount)" -ForegroundColor Cyan
    
    foreach ($task in $tasksResult.items) {
        Write-Host "   - Task: $($task.name) | User: $($task.username) (ID: $($task.userId))" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Task listing failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Cyan
        Write-Host "   Response: $($_.Exception.Response.Content)" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Green
