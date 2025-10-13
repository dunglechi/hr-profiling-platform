# Git CLI Setup and Configuration Script
# Thiết lập và cấu hình Git CLI cho Windows

Write-Host "🔧 GIT CLI SETUP & CONFIGURATION" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Function to test Git installation
function Test-GitInstallation {
    try {
        $gitPath = "C:\Program Files\Git\bin\git.exe"
        if (Test-Path $gitPath) {
            $version = & $gitPath --version
            Write-Host "✅ Git đã được cài đặt: $version" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ Git chưa được cài đặt" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Lỗi khi kiểm tra Git: $_" -ForegroundColor Red
        return $false
    }
}

# Function to add Git to PATH
function Add-GitToPath {
    $gitBinPath = "C:\Program Files\Git\bin"
    $currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
    
    if ($currentPath -notlike "*$gitBinPath*") {
        $newPath = $currentPath + ";$gitBinPath"
        [Environment]::SetEnvironmentVariable("PATH", $newPath, "User")
        Write-Host "✅ Đã thêm Git vào PATH" -ForegroundColor Green
    } else {
        Write-Host "ℹ️ Git đã có trong PATH" -ForegroundColor Yellow
    }
    
    # Update current session PATH
    $env:PATH += ";$gitBinPath"
}

# Function to configure Git
function Set-GitConfiguration {
    $gitPath = "C:\Program Files\Git\bin\git.exe"
    
    Write-Host ""
    Write-Host "🔧 Cấu hình Git..." -ForegroundColor Yellow
    
    # Prompt for user information
    $userName = Read-Host "Nhập tên của bạn (Git user.name)"
    $userEmail = Read-Host "Nhập email của bạn (Git user.email)"
    
    # Configure Git
    try {
        & $gitPath config --global user.name "$userName"
        & $gitPath config --global user.email "$userEmail"
        
        # Set default branch name
        & $gitPath config --global init.defaultBranch main
        
        # Set core editor (optional)
        & $gitPath config --global core.editor "code --wait"
        
        # Set line ending handling
        & $gitPath config --global core.autocrlf true
        
        # Set credential helper
        & $gitPath config --global credential.helper manager-core
        
        Write-Host "✅ Cấu hình Git thành công!" -ForegroundColor Green
        
        # Display configuration
        Write-Host ""
        Write-Host "📋 Cấu hình hiện tại:" -ForegroundColor Blue
        & $gitPath config --global --list | Where-Object { $_ -like "user.*" -or $_ -like "core.*" -or $_ -like "init.*" }
        
    } catch {
        Write-Host "❌ Lỗi khi cấu hình Git: $_" -ForegroundColor Red
    }
}

# Function to test Git functionality
function Test-GitFunctionality {
    $gitPath = "C:\Program Files\Git\bin\git.exe"
    
    Write-Host ""
    Write-Host "🧪 Kiểm tra chức năng Git..." -ForegroundColor Yellow
    
    try {
        # Test basic commands
        Write-Host "Checking git version..." -ForegroundColor Gray
        & $gitPath --version
        
        Write-Host "Checking git config..." -ForegroundColor Gray
        & $gitPath config --global user.name
        & $gitPath config --global user.email
        
        Write-Host "✅ Git hoạt động bình thường!" -ForegroundColor Green
        
    } catch {
        Write-Host "❌ Lỗi khi kiểm tra Git: $_" -ForegroundColor Red
    }
}

# Function to create SSH key (optional)
function New-GitSSHKey {
    $response = Read-Host "Bạn có muốn tạo SSH key cho GitHub/GitLab không? (y/n)"
    
    if ($response -eq 'y' -or $response -eq 'Y') {
        $email = Read-Host "Nhập email cho SSH key"
        
        try {
            # Create .ssh directory if not exists
            $sshDir = "$env:USERPROFILE\.ssh"
            if (!(Test-Path $sshDir)) {
                New-Item -ItemType Directory -Path $sshDir | Out-Null
            }
            
            # Generate SSH key
            ssh-keygen -t ed25519 -C "$email" -f "$sshDir\id_ed25519" -N '""'
            
            Write-Host "✅ SSH key đã được tạo!" -ForegroundColor Green
            Write-Host "📍 Public key location: $sshDir\id_ed25519.pub" -ForegroundColor Blue
            
            # Display public key
            Write-Host ""
            Write-Host "📋 Public key (copy to GitHub/GitLab):" -ForegroundColor Yellow
            Get-Content "$sshDir\id_ed25519.pub"
            
        } catch {
            Write-Host "❌ Lỗi khi tạo SSH key: $_" -ForegroundColor Red
        }
    }
}

# Main execution
Write-Host ""
Write-Host "Bắt đầu thiết lập Git CLI..." -ForegroundColor Green

# Step 1: Test installation
if (Test-GitInstallation) {
    # Step 2: Add to PATH
    Add-GitToPath
    
    # Step 3: Configure Git
    Set-GitConfiguration
    
    # Step 4: Test functionality
    Test-GitFunctionality
    
    # Step 5: Optional SSH key
    New-GitSSHKey
    
    Write-Host ""
    Write-Host "🎉 HOÀN THÀNH THIẾT LẬP GIT CLI!" -ForegroundColor Green
    Write-Host "=================================" -ForegroundColor Green
    Write-Host "✅ Git đã được cài đặt và cấu hình"
    Write-Host "✅ Đã thêm vào PATH"
    Write-Host "✅ User config đã được thiết lập"
    Write-Host ""
    Write-Host "📝 Các lệnh Git cơ bản:"
    Write-Host "  git init          - Khởi tạo repository"
    Write-Host "  git clone <url>   - Clone repository"
    Write-Host "  git add .         - Thêm file vào staging"
    Write-Host "  git commit -m     - Commit changes"
    Write-Host "  git push          - Đẩy code lên remote"
    Write-Host "  git pull          - Kéo code từ remote"
    Write-Host ""
    Write-Host "⚠️ Lưu ý: Khởi động lại PowerShell để sử dụng lệnh 'git' trực tiếp" -ForegroundColor Yellow
    
} else {
    Write-Host "❌ Vui lòng cài đặt Git trước khi chạy script này" -ForegroundColor Red
    Write-Host "💡 Tải Git tại: https://git-scm.com/download/win" -ForegroundColor Blue
}