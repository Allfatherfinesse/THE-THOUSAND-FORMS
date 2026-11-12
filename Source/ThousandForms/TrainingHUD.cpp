#include "TrainingHUD.h"

#include "Engine/Canvas.h"
#include "Engine/World.h"
#include "Kismet/GameplayStatics.h"
#include "ThousandFormsCharacter.h"
#include "TrainingGameMode.h"

void ATrainingHUD::DrawMeter(const FString& Label, float Value, float Maximum, float X, float Y,
                             const FLinearColor& Color)
{
    DrawRect(FLinearColor(0.025f, 0.03f, 0.04f, 0.9f), X, Y, 280.f, 21.f);
    DrawRect(Color, X, Y, 280.f * FMath::Clamp(Value / FMath::Max(1.f, Maximum), 0.f, 1.f), 21.f);
    DrawText(FString::Printf(TEXT("%s  %.0f / %.0f"), *Label, Value, Maximum), FLinearColor::White, X + 6.f, Y + 2.f);
}

void ATrainingHUD::DrawHUD()
{
    Super::DrawHUD();
    if (!Canvas) return;
    const auto* Player = Cast<AThousandFormsCharacter>(UGameplayStatics::GetPlayerCharacter(this, 0));
    const auto* Mode = GetWorld()->GetAuthGameMode<ATrainingGameMode>();
    if (!Player || !Mode) return;
    const auto& Combat = Player->GetCombat();
    DrawRect(FLinearColor(0.015f, 0.02f, 0.03f, 0.8f), 12.f, 12.f, 440.f, 222.f);
    DrawText(TEXT("THE THOUSAND FORMS | COMBAT LAB"), FLinearColor::White, 24.f, 24.f, nullptr, 1.3f);
    DrawText(TEXT("GRAYBOX / fictional techniques / provisional tuning"), FLinearColor(0.7f, 0.75f, 0.8f), 24.f, 47.f);
    DrawText(FString::Printf(TEXT("Style: %s | %s"), UTF8_TO_TCHAR(ThousandForms::GetStyleName(Combat.GetStyle())),
        UTF8_TO_TCHAR(ThousandForms::GetStateName(Combat.GetState()))), Player->GetStyleColor(), 24.f, 70.f);
    DrawMeter(TEXT("Health"), Combat.GetHealth(), Combat.GetMaxHealth(), 24.f, 96.f, FLinearColor(0.65f, 0.15f, 0.18f));
    DrawMeter(TEXT("Stamina"), Combat.GetStamina(), 100.f, 24.f, 121.f, FLinearColor(0.12f, 0.6f, 0.3f));
    DrawMeter(TEXT("Posture strain"), Combat.GetPosture(), Combat.GetMaxPosture(), 24.f, 146.f, FLinearColor(0.85f, 0.6f, 0.15f));
    DrawText(Player->IsLockedOn() ? TEXT("Lock: ON") : TEXT("Lock: OFF"), FLinearColor::White, 24.f, 175.f);
    DrawText(Player->GetCombatEvent(), FLinearColor::White, 24.f, 199.f);

    if (const auto* Enemy = Mode->GetOpponent())
    {
        const float X = FMath::Max(470.f, Canvas->SizeX - 400.f);
        const auto& EnemyCombat = Enemy->GetCombat();
        DrawRect(FLinearColor(0.015f, 0.02f, 0.03f, 0.8f), X - 12.f, 12.f, 388.f, 192.f);
        DrawText(Enemy->IsBoss() ? TEXT("BOSS | THE FRACTURED ECHO") : TEXT("SPARRING PARTNER"), FLinearColor::White, X, 24.f, nullptr, 1.2f);
        DrawText(Enemy->GetIntent(), Enemy->IsTelegraphing() ? FLinearColor::Yellow : FLinearColor::White, X, 55.f);
        DrawMeter(TEXT("Health"), EnemyCombat.GetHealth(), EnemyCombat.GetMaxHealth(), X, 85.f, FLinearColor(0.7f, 0.18f, 0.2f));
        DrawMeter(TEXT("Posture strain"), EnemyCombat.GetPosture(), EnemyCombat.GetMaxPosture(), X, 110.f, FLinearColor(0.85f, 0.6f, 0.15f));
        DrawText(Enemy->IsBoss() ? TEXT("Pattern: light > heavy > hybrid") : TEXT("Pattern: tell > light > recover"), FLinearColor::White, X, 142.f);
        DrawText(Enemy->GetCombatEvent(), FLinearColor::White, X, 169.f);
        if (!Combat.IsAlive() || !EnemyCombat.IsAlive())
        {
            DrawText(Combat.IsAlive() ? TEXT("ENCOUNTER WON — R to reset") : TEXT("DEFEATED — R to retry"),
                FLinearColor::Yellow, Canvas->SizeX * 0.3f, Canvas->SizeY * 0.45f, nullptr, 1.8f);
        }
    }
    const float Bottom = Canvas->SizeY - 94.f;
    DrawRect(FLinearColor(0.015f, 0.02f, 0.03f, 0.85f), 12.f, Bottom - 10.f, Canvas->SizeX - 24.f, 96.f);
    DrawText(TEXT("WASD Move | Mouse Camera | LMB Light | RMB Heavy | F Deflect / hold Guard | Space Evade"), FLinearColor::White, 24.f, Bottom);
    DrawText(TEXT("Q Cycle Style | E Next-style Heavy (hybrid) | Tab Lock | 1 Sparring | 2 Boss | R Reset"), FLinearColor::White, 24.f, Bottom + 24.f);
    DrawText(TEXT("Yellow: tell/windup | Red: active strike | Posture fills toward break | Proxy shapes are not final animation"), FLinearColor(0.75f, 0.8f, 0.85f), 24.f, Bottom + 48.f);
}
