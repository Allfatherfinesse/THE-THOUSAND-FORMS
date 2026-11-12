#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "TrainingGameMode.generated.h"

class AThousandFormsCharacter;
class UStaticMesh;

UCLASS()
class THOUSANDFORMS_API ATrainingGameMode : public AGameModeBase
{
    GENERATED_BODY()

public:
    ATrainingGameMode();
    virtual void BeginPlay() override;
    virtual void Tick(float DeltaSeconds) override;
    void StartEncounter(bool bBoss);
    void RestartEncounter();
    AThousandFormsCharacter* GetOpponent() const { return Opponent.Get(); }
    bool IsBossEncounter() const { return bBossEncounter; }

private:
    UPROPERTY() TObjectPtr<UStaticMesh> ArenaCube;
    UPROPERTY() TObjectPtr<AThousandFormsCharacter> Opponent;
    bool bBossEncounter = false;
    float CombatAccumulator = 0.f;
    void BuildArena();
};
