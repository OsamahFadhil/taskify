# Test Authentication Flow
Write-Host "🔍 Testing Taskly API Authentication..." -ForegroundColor Yellow

# Test 1: Check database state
Write-Host "`n📊 Test 1: Checking database state..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5045/api/test/db-check" -Method GET
    Write-Host "✅ Database check successful" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "❌ Database check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: List users
Write-Host "`n👥 Test 2: Listing users..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5045/api/test/list-users" -Method GET
    Write-Host "✅ List users successful" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "❌ List users failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Try to login with seeded user
Write-Host "`n🔐 Test 3: Testing login..." -ForegroundColor Cyan
try {
    $loginData = @{
        UsernameOrEmail = "john@example.com"
        Password = "password123"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "http://localhost:5045/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "✅ Login successful" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor White
    
    # Extract token
    $result = $response.Content | ConvertFrom-Json
    $token = $result.AccessToken
    
    Write-Host "🔑 Token received: $($token.Substring(0, [Math]::Min(50, $token.Length)))..." -ForegroundColor Green
    
    # Test 4: Use token to get tasks
    Write-Host "`n📋 Test 4: Testing authenticated task list..." -ForegroundColor Cyan
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        $response = Invoke-WebRequest -Uri "http://localhost:5045/api/tasks" -Method GET -Headers $headers
        Write-Host "✅ Task list successful" -ForegroundColor Green
        Write-Host "Response: $($response.Content)" -ForegroundColor White
    } catch {
        Write-Host "❌ Task list failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🏁 Authentication testing complete!" -ForegroundColor Yellow
