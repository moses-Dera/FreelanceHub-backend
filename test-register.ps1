$body = @{
    fullName = "John Doe"
    email = "john@example.com"
    password = "password123"
    role = "FREELANCER"
} | ConvertTo-Json

$params = @{
    Uri = "http://localhost:4500/api/auth/register"
    Method = "POST"
    ContentType = "application/json"
    Body = $body
}

$response = Invoke-RestMethod @params
Write-Host "User Registration Response:"
Write-Host ($response | ConvertTo-Json)
