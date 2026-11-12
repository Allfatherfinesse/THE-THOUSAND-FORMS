#include "ThousandFormsCharacter.h"

#include "Camera/CameraComponent.h"
#include "Components/CapsuleComponent.h"
#include "Components/InputComponent.h"
#include "Components/StaticMeshComponent.h"
#include "DrawDebugHelpers.h"
#include "Engine/StaticMesh.h"
#include "Engine/World.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "GameFramework/PlayerController.h"
#include "GameFramework/SpringArmComponent.h"
#include "Kismet/GameplayStatics.h"
#include "TrainingGameMode.h"
#include "UObject/ConstructorHelpers.h"

using namespace ThousandForms;

AThousandFormsCharacter::AThousandFormsCharacter()
{
    PrimaryActorTick.bCanEverTick = true;
    PrimaryActorTick.TickGroup = TG_PrePhysics;
    GetCapsuleComponent()->InitCapsuleSize(34.f, 88.f);
    GetCharacterMovement()->bOrientRotationToMovement = false;
    GetCharacterMovement()->bRunPhysicsWithNoController = true;
    GetCharacterMovement()->MaxWalkSpeed = 420.f;
    GetCharacterMovement()->BrakingDecelerationWalking = 2400.f;
    bUseControllerRotationYaw = false;

    CameraBoom = CreateDefaultSubobject<USpringArmComponent>(TEXT("CameraBoom"));
    CameraBoom->SetupAttachment(RootComponent);
    CameraBoom->TargetArmLength = 430.f;
    CameraBoom->SocketOffset = FVector(0.f, 55.f, 70.f);
    CameraBoom->bUsePawnControlRotation = true;
    CameraBoom->bDoCollisionTest = true;
    FollowCamera = CreateDefaultSubobject<UCameraComponent>(TEXT("FollowCamera"));
    FollowCamera->SetupAttachment(CameraBoom, USpringArmComponent::SocketName);
    FollowCamera->FieldOfView = 85.f;

    static ConstructorHelpers::FObjectFinder<UStaticMesh> Sphere(TEXT("/Engine/BasicShapes/Sphere.Sphere"));
    BodyProxy = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("BodyProxy"));
    HeadProxy = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("HeadProxy"));
    StrikeProxy = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("StrikeProxy"));
    for (UStaticMeshComponent* Part : {BodyProxy.Get(), HeadProxy.Get(), StrikeProxy.Get()})
    {
        Part->SetupAttachment(RootComponent);
        Part->SetCollisionEnabled(ECollisionEnabled::NoCollision);
        if (Sphere.Succeeded()) Part->SetStaticMesh(Sphere.Object);
    }
    BodyProxy->SetRelativeScale3D(FVector(0.48f, 0.60f, 1.0f));
    BodyProxy->SetRelativeLocation(FVector(0.f, 0.f, -10.f));
    HeadProxy->SetRelativeScale3D(FVector(0.30f));
    HeadProxy->SetRelativeLocation(FVector(0.f, 0.f, 58.f));
    StrikeProxy->SetRelativeScale3D(FVector(0.18f));
    StrikeProxy->SetRelativeLocation(FVector(36.f, 24.f, 15.f));
}

void AThousandFormsCharacter::BeginPlay()
{
    Super::BeginPlay();
    if (APlayerController* PC = Cast<APlayerController>(Controller))
    {
        PC->SetControlRotation(FRotator(-12.f, GetActorRotation().Yaw, 0.f));
        PC->SetInputMode(FInputModeGameOnly());
        PC->bShowMouseCursor = false;
    }
}

void AThousandFormsCharacter::ResetFighter(bool bAsOpponent, bool bAsBoss)
{
    bOpponent = bAsOpponent;
    bBoss = bAsBoss;
    bLockedOn = false;
    bTelegraphing = false;
    DecisionTime = 0.8f;
    PatternIndex = 0;
    EvadeDirection = FVector::ForwardVector;
    PendingEvadeDirection = FVector::ForwardVector;
    Combat.Reset(bBoss ? Style::Taekwondo : Style::MuayThai, bBoss ? 300.f : 100.f,
                 bBoss ? 150.f : 100.f);
    Combat.SetHybridStyle(Style::WingChun);
    GetCharacterMovement()->StopMovementImmediately();
    GetCharacterMovement()->SetMovementMode(MOVE_Walking);
    CombatEvent = TEXT("Ready");
}

void AThousandFormsCharacter::SetupPlayerInputComponent(UInputComponent* Input)
{
    Super::SetupPlayerInputComponent(Input);
    Input->BindAxis("MoveForward", this, &AThousandFormsCharacter::MoveForward);
    Input->BindAxis("MoveRight", this, &AThousandFormsCharacter::MoveRight);
    Input->BindAxis("Turn", this, &AThousandFormsCharacter::Turn);
    Input->BindAxis("LookUp", this, &AThousandFormsCharacter::LookUp);
    Input->BindAction("Light", IE_Pressed, this, &AThousandFormsCharacter::Light);
    Input->BindAction("Heavy", IE_Pressed, this, &AThousandFormsCharacter::Heavy);
    Input->BindAction("Guard", IE_Pressed, this, &AThousandFormsCharacter::GuardPressed);
    Input->BindAction("Guard", IE_Released, this, &AThousandFormsCharacter::GuardReleased);
    Input->BindAction("Evade", IE_Pressed, this, &AThousandFormsCharacter::Evade);
    Input->BindAction("SwitchStyle", IE_Pressed, this, &AThousandFormsCharacter::SwitchStyle);
    Input->BindAction("Hybrid", IE_Pressed, this, &AThousandFormsCharacter::Hybrid);
    Input->BindAction("LockOn", IE_Pressed, this, &AThousandFormsCharacter::ToggleLockOn);
    Input->BindAction("Sparring", IE_Pressed, this, &AThousandFormsCharacter::StartSparring);
    Input->BindAction("Boss", IE_Pressed, this, &AThousandFormsCharacter::StartBoss);
    Input->BindAction("Reset", IE_Pressed, this, &AThousandFormsCharacter::Restart);
}

void AThousandFormsCharacter::MoveForward(float Value)
{
    if (Controller && Combat.IsAlive())
        AddMovementInput(FRotationMatrix(FRotator(0.f, Controller->GetControlRotation().Yaw, 0.f)).GetUnitAxis(EAxis::X), Value);
}

void AThousandFormsCharacter::MoveRight(float Value)
{
    if (Controller && Combat.IsAlive())
        AddMovementInput(FRotationMatrix(FRotator(0.f, Controller->GetControlRotation().Yaw, 0.f)).GetUnitAxis(EAxis::Y), Value);
}

void AThousandFormsCharacter::Turn(float Value) { if (!bLockedOn) AddControllerYawInput(Value); }
void AThousandFormsCharacter::LookUp(float Value) { if (!bLockedOn) AddControllerPitchInput(Value); }
void AThousandFormsCharacter::Light() { Submit(Action::Light); }
void AThousandFormsCharacter::Heavy() { Submit(Action::Heavy); }
void AThousandFormsCharacter::GuardPressed() { Combat.SetGuardHeld(true); Submit(Action::Guard); }
void AThousandFormsCharacter::GuardReleased() { Combat.SetGuardHeld(false); }
void AThousandFormsCharacter::SwitchStyle() { Submit(Action::SwitchStyle); }
void AThousandFormsCharacter::Hybrid()
{
    Combat.SetHybridStyle(static_cast<Style>((static_cast<int>(Combat.GetStyle()) + 1) % 3));
    Submit(Action::Hybrid);
}

void AThousandFormsCharacter::Evade()
{
    // A queued evade captures its own direction without redirecting an active one.
    PendingEvadeDirection = GetLastMovementInputVector().GetSafeNormal2D();
    if (PendingEvadeDirection.IsNearlyZero()) PendingEvadeDirection = -GetActorForwardVector();
    Submit(Action::Evade);
}

void AThousandFormsCharacter::Submit(Action ActionToSubmit)
{
    const State Previous = Combat.GetState();
    const bool bAccepted = Combat.Request(ActionToSubmit);
    if (bAccepted && Previous != State::Evading && Combat.GetState() == State::Evading)
        EvadeDirection = PendingEvadeDirection;
    UE_LOG(LogTemp, Log, TEXT("TF Input actor=%s action=%d accepted=%d time=%.6f state=%s"),
        *GetName(), static_cast<int32>(ActionToSubmit), bAccepted, FPlatformTime::Seconds(),
        UTF8_TO_TCHAR(GetStateName(Combat.GetState())));
    CombatEvent = bAccepted ? TEXT("Input accepted / buffered") : TEXT("Input rejected: state or stamina");
}

void AThousandFormsCharacter::ToggleLockOn()
{
    if (AThousandFormsCharacter* Rival = GetRival())
        bLockedOn = !bLockedOn && Rival->Combat.IsAlive() && Combat.IsAlive();
}

void AThousandFormsCharacter::StartSparring()
{
    if (auto* Mode = GetWorld()->GetAuthGameMode<ATrainingGameMode>()) Mode->StartEncounter(false);
}
void AThousandFormsCharacter::StartBoss()
{
    if (auto* Mode = GetWorld()->GetAuthGameMode<ATrainingGameMode>()) Mode->StartEncounter(true);
}
void AThousandFormsCharacter::Restart()
{
    if (auto* Mode = GetWorld()->GetAuthGameMode<ATrainingGameMode>()) Mode->RestartEncounter();
}

AThousandFormsCharacter* AThousandFormsCharacter::GetRival() const
{
    if (bOpponent) return Cast<AThousandFormsCharacter>(UGameplayStatics::GetPlayerCharacter(this, 0));
    const auto* Mode = GetWorld()->GetAuthGameMode<ATrainingGameMode>();
    return Mode ? Mode->GetOpponent() : nullptr;
}

void AThousandFormsCharacter::Tick(float DeltaSeconds)
{
    Super::Tick(DeltaSeconds);
    if (bOpponent) UpdateOpponent(DeltaSeconds);
    UpdateFacing(DeltaSeconds);

    const State Current = Combat.GetState();
    float Speed = Combat.GetStyle() == Style::Taekwondo ? 470.f : 420.f;
    if (Current == State::Guarding) Speed *= 0.35f;
    else if (Current == State::Recovery || Current == State::Switching) Speed *= 0.3f;
    else if (Current != State::Idle && Current != State::Evading) Speed = 0.f;
    GetCharacterMovement()->MaxWalkSpeed = Speed;
    if (Current == State::Evading)
    {
        ConsumeMovementInputVector();
        GetCharacterMovement()->MaxWalkSpeed = 850.f;
        AddMovementInput(EvadeDirection, 1.f, true);
    }
    if (Speed == 0.f) GetCharacterMovement()->StopMovementImmediately();
    if (!Combat.IsAlive())
    {
        bTelegraphing = false;
        bLockedOn = false;
    }
    UpdateProxy();
}

void AThousandFormsCharacter::AdvanceCombat(float StepSeconds)
{
    const State Previous = Combat.GetState();
    const float PreviousTime = Combat.GetStateTime();
    Combat.Tick(StepSeconds);
    // A buffered evade can transition directly from the previous evade into a
    // new one, so compare elapsed state time as well as the state enum.
    const bool bNewEvade = Combat.GetState() == State::Evading &&
        (Previous != State::Evading || Combat.GetStateTime() < PreviousTime);
    if (bNewEvade) EvadeDirection = PendingEvadeDirection;
    if (Previous != Combat.GetState() || bNewEvade)
        UE_LOG(LogTemp, Log, TEXT("TF State actor=%s state=%s time=%.6f"), *GetName(),
            UTF8_TO_TCHAR(GetStateName(Combat.GetState())), FPlatformTime::Seconds());
}

void AThousandFormsCharacter::UpdateFacing(float DeltaSeconds)
{
    AThousandFormsCharacter* Rival = GetRival();
    if (bLockedOn && (!Rival || !Rival->Combat.IsAlive())) bLockedOn = false;
    const bool bCommitted = Combat.GetState() == State::Windup || Combat.GetState() == State::Active || bTelegraphing;
    if (bLockedOn && Rival && Controller)
    {
        FRotator View = (Rival->GetActorLocation() - GetActorLocation()).Rotation();
        View.Pitch = -12.f;
        Controller->SetControlRotation(FMath::RInterpTo(Controller->GetControlRotation(), View, DeltaSeconds, 9.f));
    }
    if (!Combat.IsAlive() || bCommitted) return;
    if ((bOpponent || bLockedOn) && Rival)
        SetActorRotation(FRotator(0.f, (Rival->GetActorLocation() - GetActorLocation()).Rotation().Yaw, 0.f));
    else if (Controller) SetActorRotation(FRotator(0.f, Controller->GetControlRotation().Yaw, 0.f));
}

void AThousandFormsCharacter::UpdateOpponent(float DeltaSeconds)
{
    AThousandFormsCharacter* Player = GetRival();
    if (!Combat.IsAlive() || !Player || !Player->Combat.IsAlive())
    {
        bTelegraphing = false;
        return;
    }
    if (Combat.GetState() != State::Idle)
    {
        // An interrupted telegraph is cancelled, never resumed invisibly after hit stun.
        bTelegraphing = false;
        DecisionTime = bBoss ? 0.6f : 1.0f;
        return;
    }
    if (bTelegraphing)
    {
        DecisionTime -= DeltaSeconds;
        if (DecisionTime <= 0.f)
        {
            bTelegraphing = false;
            if (Combat.Request(PlannedAction)) ++PatternIndex;
            DecisionTime = 0.8f;
        }
        return;
    }

    const FVector ToPlayer = Player->GetActorLocation() - GetActorLocation();
    const float Distance = ToPlayer.Size2D();
    const Action Pattern[] = { Action::Light, Action::Heavy, Action::Hybrid };
    PlannedAction = bBoss ? Pattern[PatternIndex % 3] : Action::Light;
    const Style AttackStyle = PlannedAction == Action::Hybrid ? Combat.GetHybridStyle() : Combat.GetStyle();
    const float DesiredRange = GetAttackSpec(AttackStyle, PlannedAction != Action::Light).Range - 15.f;
    if (Distance > DesiredRange)
    {
        AddMovementInput(ToPlayer.GetSafeNormal2D(), 0.65f, true);
        return;
    }
    DecisionTime -= DeltaSeconds;
    if (DecisionTime <= 0.f && Combat.GetStamina() >= 35.f)
    {
        // Face once, then commit for this visible tell and the attack's own windup.
        SetActorRotation(FRotator(0.f, ToPlayer.Rotation().Yaw, 0.f));
        bTelegraphing = true;
        DecisionTime = bBoss ? 0.65f : 0.8f;
        GetCharacterMovement()->StopMovementImmediately();
    }
}

void AThousandFormsCharacter::ResolveAttack()
{
    if (Combat.GetState() != State::Active) return;
    const AttackSpec& Attack = Combat.GetAttack();
    const FVector Origin = GetActorLocation() + FVector(0.f, 0.f, 12.f);
    const FVector End = Origin + GetActorForwardVector() * Attack.Range;
    FCollisionQueryParams Query(SCENE_QUERY_STAT(ThousandFormsStrike), false, this);
    TArray<FHitResult> Hits;
    GetWorld()->SweepMultiByObjectType(Hits, Origin, End, FQuat::Identity,
        FCollisionObjectQueryParams(ECC_Pawn), FCollisionShape::MakeSphere(24.f), Query);

    for (const FHitResult& Hit : Hits)
    {
        auto* Victim = Cast<AThousandFormsCharacter>(Hit.GetActor());
        if (!Victim || Victim == this || Victim->bOpponent == bOpponent || !Victim->Combat.IsAlive()) continue;
        const uint32 TargetId = Victim->GetUniqueID();
        if (!Combat.CanHit(TargetId)) continue;
        // Keep configured range center-to-center; collider radii must not add reach.
        if (FVector::DistSquared2D(GetActorLocation(), Victim->GetActorLocation()) > FMath::Square(Attack.Range)) continue;
        const FVector TowardVictim = (Victim->GetActorLocation() - GetActorLocation()).GetSafeNormal2D();
        if (FVector::DotProduct(GetActorForwardVector(), TowardVictim) < FMath::Cos(FMath::DegreesToRadians(Attack.ArcDegrees * 0.5f))) continue;

        FHitResult Wall;
        FCollisionQueryParams Visibility(SCENE_QUERY_STAT(ThousandFormsOcclusion), false, this);
        Visibility.AddIgnoredActor(Victim);
        if (GetWorld()->LineTraceSingleByChannel(Wall, Origin, Victim->GetActorLocation() + FVector(0.f, 0.f, 12.f), ECC_Visibility, Visibility)) continue;
        if (!Combat.RegisterHit(TargetId)) continue;
        const bool bFrontal = FVector::DotProduct(Victim->GetActorForwardVector(), -TowardVictim) >= 0.25f;
        const HitResult Result = Victim->Combat.ReceiveHit(Attack, bFrontal);
        const TCHAR* Label = TEXT("Hit");
        switch (Result)
        {
        case HitResult::Blocked: Label = TEXT("Guarded"); break;
        case HitResult::Deflected: Label = TEXT("Deflected"); Combat.ApplyDeflectStun(); break;
        case HitResult::Evaded: Label = TEXT("Evaded"); break;
        case HitResult::PostureBreak: Label = TEXT("Posture broken"); break;
        case HitResult::Killed: Label = TEXT("Defeated"); break;
        case HitResult::Ignored: Label = TEXT("Ignored"); break;
        default: break;
        }
        CombatEvent = FString::Printf(TEXT("%s: %s"), UTF8_TO_TCHAR(Attack.Name), Label);
        Victim->CombatEvent = Label;
        UE_LOG(LogTemp, Log, TEXT("TF Impact attacker=%s target=%s swing=%llu result=%s"),
            *GetName(), *Victim->GetName(), static_cast<unsigned long long>(Combat.GetAttackSequence()), Label);
        // An interrupted attack cannot continue to strike additional targets this substep.
        if (Combat.GetState() != State::Active) break;
    }
}

FString AThousandFormsCharacter::GetIntent() const
{
    if (bTelegraphing)
    {
        const TCHAR* Name = PlannedAction == Action::Light ? TEXT("LIGHT") :
            PlannedAction == Action::Heavy ? TEXT("HEAVY") : TEXT("HYBRID");
        return FString::Printf(TEXT("TELL: %s — committed direction"), Name);
    }
    return UTF8_TO_TCHAR(GetStateName(Combat.GetState()));
}

FLinearColor AThousandFormsCharacter::GetStyleColor() const
{
    switch (Combat.GetStyle())
    {
    case Style::MuayThai: return FLinearColor(1.f, 0.42f, 0.12f);
    case Style::WingChun: return FLinearColor(0.15f, 0.85f, 0.8f);
    case Style::Taekwondo: return FLinearColor(0.65f, 0.42f, 1.f);
    }
    return FLinearColor::White;
}

void AThousandFormsCharacter::UpdateProxy()
{
    const State Current = Combat.GetState();
    const bool bStriking = Current == State::Active;
    const bool bTell = bTelegraphing || Current == State::Windup;
    const FColor Color = bStriking ? FColor::Red : bTell ? FColor::Yellow : GetStyleColor().ToFColor(true);
    DrawDebugCapsule(GetWorld(), GetActorLocation(), 90.f, 36.f, GetActorQuat(), Color, false, -1.f, 0, 2.f);
    const float Reach = bStriking ? Combat.GetAttack().Range : bTell ? 55.f : 36.f;
    // A sphere is a timing/range marker, not a finished martial-arts animation.
    StrikeProxy->SetRelativeLocation(FVector(Reach, 24.f, Combat.GetStyle() == Style::Taekwondo ? -15.f : 15.f));
    BodyProxy->SetRelativeRotation(FRotator(Current == State::Dead ? 80.f : Current == State::HitStun ? -18.f : 0.f, 0.f, 0.f));
    if (bTell || bStriking)
        DrawDebugLine(GetWorld(), GetActorLocation(), GetActorLocation() + GetActorForwardVector() * 220.f, Color, false, -1.f, 0, 4.f);
}
