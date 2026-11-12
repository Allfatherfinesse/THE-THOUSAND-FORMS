#pragma once

#include "CoreMinimal.h"
#include "GameFramework/HUD.h"
#include "TrainingHUD.generated.h"

UCLASS()
class THOUSANDFORMS_API ATrainingHUD : public AHUD
{
    GENERATED_BODY()
public:
    virtual void DrawHUD() override;
private:
    void DrawMeter(const FString& Label, float Value, float Maximum, float X, float Y,
                   const FLinearColor& Color);
};
