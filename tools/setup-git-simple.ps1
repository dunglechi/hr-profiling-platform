# Git CLI Setup Script
Write-Host "Git CLI Setup & Configuration" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

# Test Git installation
$gitPath = "C:\Program Files\Git\bin\git.exe"

if (Test-Path $gitPath) {
    Write-Host "Git found at: $gitPath" -ForegroundColor Green
    
    # Add to PATH
    $gitBinPath = "C:\Program Files\Git\bin"
    $currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
    
    if ($currentPath -notlike "*$gitBinPath*") {
        $newPath = $currentPath + ";$gitBinPath"
        [Environment]::SetEnvironmentVariable("PATH", $newPath, "User")
        Write-Host "Added Git to PATH" -ForegroundColor Green
    }
    
    # Update current session PATH
    $env:PATH += ";$gitBinPath"
    
    # Test Git
    try {
        $version = & $gitPath --version
        Write-Host "Git version: $version" -ForegroundColor Green
        
        # Configure Git
        Write-Host ""
        Write-Host "Configuring Git..." -ForegroundColor Yellow
        
        $userName = Read-Host "Enter your name for Git"
        $userEmail = Read-Host "Enter your email for Git"
        
        & $gitPath config --global user.name "$userName"
        & $gitPath config --global user.email "$userEmail"
        & $gitPath config --global init.defaultBranch main
        & $gitPath config --global core.autocrlf true
        
        Write-Host "Git configuration completed!" -ForegroundColor Green
        
        # Show config
        Write-Host ""
        Write-Host "Current Git configuration:" -ForegroundColor Blue
        & $gitPath config --global user.name
        & $gitPath config --global user.email
        
    } catch {
        Write-Host "Error configuring Git: $_" -ForegroundColor Red
    }
    
} else {
    Write-Host "Git not found. Please install Git first." -ForegroundColor Red
    Write-Host "Download from: https://git-scm.com/download/win" -ForegroundColor Blue
}

Write-Host ""
Write-Host "Setup completed! Restart PowerShell to use 'git' command directly." -ForegroundColor Yellow