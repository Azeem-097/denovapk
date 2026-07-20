# Rollback script generated 20260720-132419
# Run this to restore all files to their previous state.

Write-Host "Rolling back mobile fixes from 20260720-132419..." -ForegroundColor Yellow
Write-Host ""

Copy-Item -LiteralPath "D:\Web Development\Websites\Clients\E-Commerce\Clothing\denovapk\_backups\mobile-fixes-20260720-132419\user-panel__src__components__animations__useDevicePerformance.ts" -Destination "D:\Web Development\Websites\Clients\E-Commerce\Clothing\denovapk\user-panel\src\components\animations\useDevicePerformance.ts" -Force
Write-Host "  Restored $_" -ForegroundColor Green
Copy-Item -LiteralPath "D:\Web Development\Websites\Clients\E-Commerce\Clothing\denovapk\_backups\mobile-fixes-20260720-132419\user-panel__src__components__animations__FadeIn.tsx" -Destination "D:\Web Development\Websites\Clients\E-Commerce\Clothing\denovapk\user-panel\src\components\animations\FadeIn.tsx" -Force
Write-Host "  Restored $_" -ForegroundColor Green
Copy-Item -LiteralPath "D:\Web Development\Websites\Clients\E-Commerce\Clothing\denovapk\_backups\mobile-fixes-20260720-132419\user-panel__src__components__animations__TextReveal.tsx" -Destination "D:\Web Development\Websites\Clients\E-Commerce\Clothing\denovapk\user-panel\src\components\animations\TextReveal.tsx" -Force
Write-Host "  Restored $_" -ForegroundColor Green
Copy-Item -LiteralPath "D:\Web Development\Websites\Clients\E-Commerce\Clothing\denovapk\_backups\mobile-fixes-20260720-132419\user-panel__src__components__animations__SlideIn.tsx" -Destination "D:\Web Development\Websites\Clients\E-Commerce\Clothing\denovapk\user-panel\src\components\animations\SlideIn.tsx" -Force
Write-Host "  Restored $_" -ForegroundColor Green
Copy-Item -LiteralPath "D:\Web Development\Websites\Clients\E-Commerce\Clothing\denovapk\_backups\mobile-fixes-20260720-132419\user-panel__src__components__animations__SlideUp.tsx" -Destination "D:\Web Development\Websites\Clients\E-Commerce\Clothing\denovapk\user-panel\src\components\animations\SlideUp.tsx" -Force
Write-Host "  Restored $_" -ForegroundColor Green
Copy-Item -LiteralPath "D:\Web Development\Websites\Clients\E-Commerce\Clothing\denovapk\_backups\mobile-fixes-20260720-132419\user-panel__src__components__animations__ScaleIn.tsx" -Destination "D:\Web Development\Websites\Clients\E-Commerce\Clothing\denovapk\user-panel\src\components\animations\ScaleIn.tsx" -Force
Write-Host "  Restored $_" -ForegroundColor Green
Copy-Item -LiteralPath "D:\Web Development\Websites\Clients\E-Commerce\Clothing\denovapk\_backups\mobile-fixes-20260720-132419\user-panel__src__components__sections__FixedHeroBackground.tsx" -Destination "D:\Web Development\Websites\Clients\E-Commerce\Clothing\denovapk\user-panel\src\components\sections\FixedHeroBackground.tsx" -Force
Write-Host "  Restored $_" -ForegroundColor Green
Copy-Item -LiteralPath "D:\Web Development\Websites\Clients\E-Commerce\Clothing\denovapk\_backups\mobile-fixes-20260720-132419\user-panel__src__components__sections__HeroSection.tsx" -Destination "D:\Web Development\Websites\Clients\E-Commerce\Clothing\denovapk\user-panel\src\components\sections\HeroSection.tsx" -Force

Write-Host ""
Write-Host "Rollback complete." -ForegroundColor Green