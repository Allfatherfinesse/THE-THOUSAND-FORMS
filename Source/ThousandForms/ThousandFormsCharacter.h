#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "CombatCore/CombatModel.h"
#include "ThousandFormsCharacter.generated.h"

class USpringArmComponent;
class UCameraComponent;
class UStaticMeshComponent;

/** Graybox adapter. Combat rules live in the engine-independent CombatModel. */
UCLASS()
class THOUSANDFORMS_API AThousandFormsCharacter : public ACharacter
{
    GENERATED_BODY()

public:
    AThousandFormsCharacter();
    virtual void Tick(float DeltaSeconds) override;
    virtual void SetupPlayerInputComponent(UInputComponent* Input) override;
    void ResetFighter(bool bAsOpponent, bool bAsBoss);
    // Called by the encounter's shared fixed-step clock after world movement.
    void AdvanceCombat(float StepSeconds);
    void ResolveAttack();

    const ThousandForms::Fighter& GetCombat() const { return Combat; }
    bool IsOpponent() const { return bOpponent; }
    bool IsBoss() const { return bBoss; }
    bool IsLockedOn() const { return bLockedOn; }
    bool IsTelegraphing() const { return bTelegraphing; }
    const FString& GetCombatEvent() const { return CombatEvent; }
    FString GetIntent() const;
    FLinearColor GetStyleColor() const;

protected:
    virtual void BeginPlay() override;

private:
    UPROPERTY(VisibleAnywhere) TObjectPtr<USpringArmComponent> CameraBoom;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UCameraComponent> FollowCamera;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> BodyProxy;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> HeadProxy;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> StrikeProxy;

    ThousandForms::Fighter Combat;
    bool bOpponent = false;
    bool bBoss = false;
    bool bLockedOn = false;
    bool bTelegraphing = false;
    float DecisionTime = 0.8f;
    int32 PatternIndex = 0;
    ThousandForms::Action PlannedAction = ThousandForms::Action::Light;
    FVector EvadeDirection = FVector::ForwardVector;
    FVector PendingEvadeDirection = FVector::ForwardVector;
    FString CombatEvent = TEXT("Ready");

    void MoveForward(float Value);
    void MoveRight(float Value);
    void Turn(float Value);
    void LookUp(float Value);
    void Light();
    void Heavy();
    void GuardPressed();
    void GuardReleased();
    void Evade();
    void SwitchStyle();
    void Hybrid();
    void ToggleLockOn();
    void StartSparring();
    void StartBoss();
    void Restart();
    void Submit(ThousandForms::Action Action);
    void UpdateOpponent(float DeltaSeconds);
    void UpdateFacing(float DeltaSeconds);
    void UpdateProxy();
    AThousandFormsCharacter* GetRival() const;
};
