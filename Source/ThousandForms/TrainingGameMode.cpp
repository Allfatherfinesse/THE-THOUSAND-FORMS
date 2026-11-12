#include "TrainingGameMode.h"

#include "Components/StaticMeshComponent.h"
#include "Engine/StaticMesh.h"
#include "Engine/StaticMeshActor.h"
#include "Engine/World.h"
#include "GameFramework/PlayerController.h"
#include "Kismet/GameplayStatics.h"
#include "ThousandFormsCharacter.h"
#include "TrainingHUD.h"
#include "UObject/ConstructorHelpers.h"

ATrainingGameMode::ATrainingGameMode()
{
    PrimaryActorTick.bCanEverTick = true;
    PrimaryActorTick.bStartWithTickEnabled = true;
    PrimaryActorTick.TickGroup = TG_PostPhysics;
    DefaultPawnClass = AThousandFormsCharacter::StaticClass();
    HUDClass = ATrainingHUD::StaticClass();
    // Keep the floor/wall mesh visible to the cooker, including packaged builds.
    static ConstructorHelpers::FObjectFinder<UStaticMesh> Cube(TEXT("/Engine/BasicShapes/Cube.Cube"));
    if (Cube.Succeeded()) ArenaCube = Cube.Object;
}

void ATrainingGameMode::BeginPlay()
{
    Super::BeginPlay();
    BuildArena();
    StartEncounter(false);
}

void ATrainingGameMode::Tick(float DeltaSeconds)
{
    Super::Tick(DeltaSeconds);
    auto* Player = Cast<AThousandFormsCharacter>(UGameplayStatics::GetPlayerCharacter(this, 0));
    if (!IsValid(Player) || !IsValid(Opponent))
    {
        CombatAccumulator = 0.f;
        return;
    }

    // One clock advances both defenders before either attacker resolves hits.
    // World positions are sampled after this frame's movement, not at 120 Hz.
    // Stall catch-up is capped at 250 ms rather than simulating an unbounded hitch.
    CombatAccumulator = FMath::Min(CombatAccumulator + DeltaSeconds, 0.25f);
    constexpr float Step = 1.f / 120.f;
    while (CombatAccumulator >= Step)
    {
        Player->AdvanceCombat(Step);
        Opponent->AdvanceCombat(Step);
        // Same-step impacts use explicit player-first priority. A first hit can
        // interrupt the opponent before its hit is resolved; trades are deferred.
        Player->ResolveAttack();
        Opponent->ResolveAttack();
        CombatAccumulator -= Step;
    }
}

void ATrainingGameMode::BuildArena()
{
    UStaticMesh* Cube = ArenaCube.Get();
    if (!ensure(Cube)) return;
    auto Block = [this, Cube](FVector Position, FVector Scale)
    {
        AStaticMeshActor* Actor = GetWorld()->SpawnActor<AStaticMeshActor>(Position, FRotator::ZeroRotator);
        if (!Actor) return;
        UStaticMeshComponent* Mesh = Actor->GetStaticMeshComponent();
        Mesh->SetMobility(EComponentMobility::Movable);
        Mesh->SetStaticMesh(Cube);
        Mesh->SetWorldScale3D(Scale);
        Mesh->SetCollisionProfileName(TEXT("BlockAll"));
    };
    // A bounded 24 m square. Keep its interior clear until obstacle navigation exists.
    Block(FVector(0.f, 0.f, -50.f), FVector(24.f, 24.f, 1.f));
    Block(FVector(-1250.f, 0.f, 100.f), FVector(1.f, 26.f, 3.f));
    Block(FVector(1250.f, 0.f, 100.f), FVector(1.f, 26.f, 3.f));
    Block(FVector(0.f, -1250.f, 100.f), FVector(24.f, 1.f, 3.f));
    Block(FVector(0.f, 1250.f, 100.f), FVector(24.f, 1.f, 3.f));
}

void ATrainingGameMode::StartEncounter(bool bBoss)
{
    bBossEncounter = bBoss;
    CombatAccumulator = 0.f;
    if (IsValid(Opponent)) Opponent->Destroy();
    Opponent = nullptr;
    if (auto* Player = Cast<AThousandFormsCharacter>(UGameplayStatics::GetPlayerCharacter(this, 0)))
    {
        Player->ResetFighter(false, false);
        Player->SetActorLocationAndRotation(FVector(-350.f, 0.f, 100.f), FRotator::ZeroRotator,
                                            false, nullptr, ETeleportType::TeleportPhysics);
        if (AController* Controller = Player->GetController())
            Controller->SetControlRotation(FRotator(-12.f, 0.f, 0.f));
    }
    FActorSpawnParameters Spawn;
    Spawn.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AdjustIfPossibleButAlwaysSpawn;
    Opponent = GetWorld()->SpawnActor<AThousandFormsCharacter>(
        AThousandFormsCharacter::StaticClass(), FVector(350.f, 0.f, 100.f), FRotator(0.f, 180.f, 0.f), Spawn);
    if (ensure(Opponent)) Opponent->ResetFighter(true, bBoss);
    UE_LOG(LogTemp, Log, TEXT("TF Encounter reset: %s"), bBoss ? TEXT("boss") : TEXT("sparring"));
}

void ATrainingGameMode::RestartEncounter() { StartEncounter(bBossEncounter); }
