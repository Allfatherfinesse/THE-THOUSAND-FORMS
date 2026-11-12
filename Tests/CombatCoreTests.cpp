#include "../Source/ThousandForms/CombatCore/CombatModel.h"

#include <cmath>
#include <cstdlib>
#include <iostream>
#include <limits>

using namespace ThousandForms;

namespace
{
int Failures = 0;
int Scenarios = 0;

void Check(bool Condition, const char* Message, int Line)
{
    if (!Condition)
    {
        ++Failures;
        std::cerr << "FAIL line " << Line << ": " << Message << '\n';
    }
}
#define CHECK(condition) Check((condition), #condition, __LINE__)

bool Near(float A, float B, float Tolerance = .003f)
{
    return std::fabs(A - B) <= Tolerance;
}

void AttackLifecycle()
{
    ++Scenarios;
    for (Style Discipline : {Style::MuayThai, Style::WingChun, Style::Taekwondo})
    {
        for (Action Input : {Action::Light, Action::Heavy})
        {
            Fighter Model;
            Model.Reset(Discipline);
            CHECK(Model.Request(Input));
            const AttackSpec Attack = Model.GetAttack();
            CHECK(Model.GetState() == State::Windup);
            CHECK(Near(Model.GetStamina(), 100 - Attack.StaminaCost));
            CHECK(!Model.CanHit(1));
            Model.Tick(Attack.Windup + .001f);
            CHECK(Model.GetState() == State::Active);
            CHECK(Model.CanHit(1));
            Model.Tick(Attack.Active);
            CHECK(Model.GetState() == State::Recovery);
            CHECK(!Model.CanHit(1));
            Model.Tick(Attack.Recovery);
            CHECK(Model.GetState() == State::Idle);
        }
    }
}

void UniqueHitsPerSwing()
{
    ++Scenarios;
    Fighter Model;
    CHECK(!Model.RegisterHit(1));
    Model.Request(Action::Light);
    Model.Tick(.201f);
    CHECK(Model.RegisterHit(1));
    CHECK(!Model.RegisterHit(1));
    CHECK(Model.RegisterHit(2));
    CHECK(!Model.CanHit(2));
    Model.Tick(.5f);
    CHECK(!Model.RegisterHit(3));
    Model.Request(Action::Light);
    Model.Tick(.201f);
    CHECK(Model.RegisterHit(1));
    CHECK(Model.GetAttackSequence() == 2);
}

void HitSetCapacity()
{
    ++Scenarios;
    Fighter Model;
    Model.Request(Action::Light);
    Model.Tick(.201f);
    for (std::uint32_t Index = 0; Index < 32; ++Index) CHECK(Model.RegisterHit(Index));
    CHECK(!Model.RegisterHit(32));
}

void LateBufferExecutesOnce()
{
    ++Scenarios;
    Fighter Model;
    Model.Request(Action::Light);
    Model.Tick(.51f); // 90ms until ready.
    const float Before = Model.GetStamina();
    CHECK(Model.Request(Action::Heavy));
    CHECK(Model.HasBufferedInput());
    CHECK(Near(Model.GetStamina(), Before));
    Model.Tick(.10f);
    CHECK(Model.GetState() == State::Windup);
    CHECK(Model.GetAttackSequence() == 2);
    CHECK(!Model.HasBufferedInput());
    CHECK(Near(Model.GetStamina(), Before - 29));
    Model.Tick(2);
    CHECK(Model.GetState() == State::Idle);
    CHECK(Model.GetAttackSequence() == 2);
}

void EarlyBufferExpires()
{
    ++Scenarios;
    Fighter Model;
    Model.Request(Action::Heavy);
    CHECK(Model.Request(Action::Light));
    Model.Tick(.17f);
    CHECK(!Model.HasBufferedInput());
    Model.Tick(2);
    CHECK(Model.GetState() == State::Idle);
    CHECK(Model.GetAttackSequence() == 1);
}

void LatestBufferWins()
{
    ++Scenarios;
    Fighter Model;
    Model.Request(Action::Light);
    Model.Tick(.52f);
    CHECK(Model.Request(Action::Heavy));
    CHECK(Model.Request(Action::Evade));
    Model.Tick(.09f);
    CHECK(Model.GetState() == State::Evading);
    CHECK(Model.GetAttackSequence() == 1);
    CHECK(Near(Model.GetStamina(), 65));
}

void ResourceExhaustionAndRecovery()
{
    ++Scenarios;
    Fighter Model;
    for (int Index = 0; Index < 5; ++Index)
    {
        CHECK(Model.Request(Action::Evade));
        Model.Tick(Fighter::EvadeSeconds + .0001f);
    }
    CHECK(Near(Model.GetStamina(), 0));
    CHECK(!Model.Request(Action::Evade));
    CHECK(!Model.Request(Action::Light));
    CHECK(Model.GetState() == State::Idle);
    Model.Tick(.1f);
    CHECK(Near(Model.GetStamina(), 0));
    Model.Tick(5);
    CHECK(Near(Model.GetStamina(), 100));
    CHECK(Model.Request(Action::Light));
}

void GuardDeflectAndRearHit()
{
    ++Scenarios;
    const AttackSpec Incoming = GetAttackSpec(Style::MuayThai, false);
    Fighter Defender;
    Defender.SetGuardHeld(true);
    CHECK(Defender.ReceiveHit(Incoming) == HitResult::Deflected);
    CHECK(Near(Defender.GetHealth(), 100));
    CHECK(Near(Defender.GetStamina(), 95));
    Defender.Tick(.12f);
    Defender.SetGuardHeld(true); // Holding/repeated press cannot reopen parry window.
    CHECK(Defender.ReceiveHit(Incoming) == HitResult::Blocked);
    CHECK(Near(Defender.GetHealth(), 100));
    CHECK(Defender.GetPosture() > 0);
    CHECK(Defender.ReceiveHit(Incoming, false) == HitResult::Hit);
    CHECK(Near(Defender.GetHealth(), 86));
    CHECK(Defender.GetState() == State::HitStun);
    Defender.Tick(.29f);
    CHECK(Defender.GetState() == State::Guarding);
    Defender.SetGuardHeld(false);
    CHECK(Defender.GetState() == State::Idle);
}

void StyleDeflectDifference()
{
    ++Scenarios;
    const AttackSpec Incoming = GetAttackSpec(Style::Taekwondo, false);
    Fighter Pressure;
    Fighter Centerline;
    Centerline.Reset(Style::WingChun);
    Pressure.SetGuardHeld(true);
    Centerline.SetGuardHeld(true);
    Pressure.Tick(.13f);
    Centerline.Tick(.13f);
    CHECK(Pressure.ReceiveHit(Incoming) == HitResult::Blocked);
    CHECK(Centerline.ReceiveHit(Incoming) == HitResult::Deflected);
}

void GuardRepressCannotExtendDeflect()
{
    ++Scenarios;
    Fighter Model;
    const AttackSpec Incoming = GetAttackSpec(Style::WingChun, false);
    Model.SetGuardHeld(true);
    Model.Tick(.12f);
    Model.SetGuardHeld(false);
    Model.SetGuardHeld(true);
    CHECK(Model.ReceiveHit(Incoming) == HitResult::Blocked);
    Model.Tick(.25f); // The cooldown expiring while held does not reopen deflect.
    CHECK(Model.ReceiveHit(Incoming) == HitResult::Blocked);
    Model.SetGuardHeld(false);
    Model.SetGuardHeld(true);
    CHECK(Model.ReceiveHit(Incoming) == HitResult::Deflected);
}

void DeflectInterruptsAttacker()
{
    ++Scenarios;
    Fighter Attacker;
    Attacker.Request(Action::Light);
    Attacker.Tick(.201f);
    Attacker.Request(Action::Heavy);
    Attacker.ApplyDeflectStun();
    CHECK(Attacker.GetState() == State::HitStun);
    CHECK(!Attacker.HasBufferedInput());
    CHECK(!Attacker.CanHit(2));
    CHECK(!Attacker.Request(Action::Evade));
    CHECK(Near(Attacker.GetPosture(), 28));
    Attacker.Tick(.44f);
    CHECK(Attacker.GetState() == State::HitStun);
    Attacker.Tick(.02f);
    CHECK(Attacker.GetState() == State::Idle);
}

void EvadeTiming()
{
    ++Scenarios;
    const AttackSpec Incoming = GetAttackSpec(Style::WingChun, false);
    Fighter Early;
    Early.Request(Action::Evade);
    Early.Tick(.04f);
    CHECK(!Early.IsInvulnerable());
    CHECK(Early.ReceiveHit(Incoming) == HitResult::Hit);

    Fighter Middle;
    Middle.Request(Action::Evade);
    Middle.Tick(.12f);
    CHECK(Middle.IsInvulnerable());
    CHECK(Middle.ReceiveHit(Incoming) == HitResult::Evaded);
    CHECK(Near(Middle.GetHealth(), 100));
    CHECK(Middle.GetState() == State::Evading);

    Middle.Tick(.21f);
    CHECK(!Middle.IsInvulnerable());
    CHECK(Middle.ReceiveHit(Incoming) == HitResult::Hit);
}

void PostureBreakAndFiniteRecovery()
{
    ++Scenarios;
    Fighter Defender;
    Defender.Reset(Style::MuayThai, 500);
    Defender.SetGuardHeld(true);
    Defender.Tick(.2f);
    const AttackSpec Heavy = GetAttackSpec(Style::MuayThai, true);
    CHECK(Defender.ReceiveHit(Heavy) == HitResult::Blocked);
    CHECK(Defender.ReceiveHit(Heavy) == HitResult::Blocked);
    CHECK(Defender.ReceiveHit(Heavy) == HitResult::PostureBreak);
    CHECK(Defender.GetState() == State::PostureBroken);
    CHECK(Near(Defender.GetPosture(), 100));
    CHECK(!Defender.Request(Action::Light));
    Defender.Tick(.9f);
    CHECK(Defender.ReceiveHit(Heavy, false) == HitResult::Hit);
    Defender.Tick(.21f);
    CHECK(Defender.GetState() == State::Guarding);
    CHECK(Near(Defender.GetPosture(), 35));
}

void StaminaBreakWithoutFullPosture()
{
    ++Scenarios;
    Fighter Model;
    for (int Index = 0; Index < 4; ++Index)
    {
        Model.Request(Action::Evade);
        Model.Tick(.481f);
    }
    Model.SetGuardHeld(true);
    Model.Tick(.11f);
    const AttackSpec Heavy = GetAttackSpec(Style::MuayThai, true);
    CHECK(Model.ReceiveHit(Heavy) == HitResult::PostureBreak);
    CHECK(Near(Model.GetStamina(), 0));
    CHECK(Model.GetState() == State::PostureBroken);
}

void StanceTransitionAndCost()
{
    ++Scenarios;
    Fighter Model;
    CHECK(!Model.RequestStyle(Style::MuayThai));
    CHECK(Model.RequestStyle(Style::Taekwondo));
    CHECK(Model.GetState() == State::Switching);
    CHECK(Model.GetStyle() == Style::MuayThai);
    CHECK(Near(Model.GetStamina(), 92));
    Model.Tick(.10f);
    CHECK(Model.GetStyle() == Style::MuayThai);
    CHECK(Model.Request(Action::Light));
    Model.Tick(.13f);
    CHECK(Model.GetStyle() == Style::Taekwondo);
    CHECK(Model.GetState() == State::Windup);
    CHECK(Model.GetAttack().Discipline == Style::Taekwondo);
    Model.Tick(2);
    CHECK(Model.Request(Action::SwitchStyle));
    Model.Tick(.23f);
    CHECK(Model.GetStyle() == Style::MuayThai);
}

void InterruptedSwitchDoesNotCommit()
{
    ++Scenarios;
    Fighter Model;
    Model.RequestStyle(Style::WingChun);
    Model.Tick(.10f);
    Model.ReceiveHit(GetAttackSpec(Style::Taekwondo, false), false);
    Model.Tick(.3f);
    CHECK(Model.GetStyle() == Style::MuayThai);
    CHECK(Model.GetState() == State::Idle);
}

void BufferedStyleCycleUsesDestination()
{
    ++Scenarios;
    Fighter Model;
    CHECK(Model.Request(Action::SwitchStyle));
    Model.Tick(.12f);
    CHECK(Model.Request(Action::SwitchStyle));
    Model.Tick(.11f);
    CHECK(Model.GetStyle() == Style::WingChun);
    CHECK(Model.GetState() == State::Switching);
    Model.Tick(.23f);
    CHECK(Model.GetStyle() == Style::Taekwondo);
    CHECK(Model.GetState() == State::Idle);
    CHECK(Near(Model.GetStamina(), 84));
}

void HybridSnapshotAndRecovery()
{
    ++Scenarios;
    Fighter Model;
    Model.SetHybridStyle(Style::Taekwondo);
    CHECK(Model.Request(Action::Hybrid));
    CHECK(Model.GetAttack().Discipline == Style::Taekwondo);
    CHECK(Near(Model.GetAttack().StaminaCost, 40));
    CHECK(Near(Model.GetAttack().Recovery, .6f));
    CHECK(Near(Model.GetStamina(), 60));
    Model.SetHybridStyle(Style::WingChun); // Loadout changes cannot alter a live swing.
    CHECK(Model.GetAttack().Discipline == Style::Taekwondo);
    Model.Tick(1.27f);
    CHECK(Model.GetState() == State::Idle);
    CHECK(Model.GetStyle() == Style::MuayThai);
    CHECK(Model.GetHybridStyle() == Style::WingChun);
}

void DeathIsTerminalAndResetIsClean()
{
    ++Scenarios;
    Fighter Model;
    Model.Request(Action::Light);
    Model.Tick(.52f);
    Model.Request(Action::Heavy);
    AttackSpec Fatal = GetAttackSpec(Style::MuayThai, false);
    Fatal.Damage = 200;
    CHECK(Model.ReceiveHit(Fatal) == HitResult::Killed);
    CHECK(!Model.IsAlive());
    CHECK(!Model.HasBufferedInput());
    CHECK(!Model.Request(Action::Light));
    CHECK(!Model.RequestStyle(Style::Taekwondo));
    CHECK(Model.ReceiveHit(Fatal) == HitResult::Ignored);
    Model.SetGuardHeld(true);
    Model.Tick(10);
    CHECK(Model.GetState() == State::Dead);
    CHECK(Near(Model.GetHealth(), 0));
    Model.Reset(Style::WingChun, 120, 150);
    CHECK(Model.GetState() == State::Idle);
    CHECK(Model.GetStyle() == Style::WingChun);
    CHECK(Model.GetHybridStyle() == Style::Taekwondo);
    CHECK(Near(Model.GetHealth(), 120));
    CHECK(Near(Model.GetPosture(), 0));
    CHECK(Near(Model.GetStamina(), 100));
    CHECK(Model.GetAttackSequence() == 0);
}

void FramePartitionStability()
{
    ++Scenarios;
    Fighter Whole;
    Fighter Split;
    Whole.Request(Action::Heavy);
    Split.Request(Action::Heavy);
    Whole.Tick(2.0f);
    for (int Index = 0; Index < 240; ++Index) Split.Tick(1.0f / 120.0f);
    CHECK(Whole.GetState() == Split.GetState());
    CHECK(Near(Whole.GetStateTime(), Split.GetStateTime(), .001f));
    CHECK(Near(Whole.GetStamina(), Split.GetStamina(), .01f));
    CHECK(Near(Whole.GetPosture(), Split.GetPosture(), .01f));
}

void InvalidTimeAndHitsAreIgnored()
{
    ++Scenarios;
    Fighter Model;
    Model.Request(Action::Light);
    Model.Tick(-1);
    Model.Tick(std::numeric_limits<float>::quiet_NaN());
    Model.Tick(std::numeric_limits<float>::infinity());
    CHECK(Near(Model.GetStateTime(), 0));
    AttackSpec Invalid;
    Invalid.Damage = -1;
    CHECK(Model.ReceiveHit(Invalid) == HitResult::Ignored);
    Invalid.Damage = std::numeric_limits<float>::quiet_NaN();
    CHECK(Model.ReceiveHit(Invalid) == HitResult::Ignored);
    CHECK(Near(Model.GetHealth(), 100));
    Model.Tick(1.e20f); // A finite large time step must not trap a subtraction loop.
    CHECK(Model.GetState() == State::Idle);
    CHECK(Near(Model.GetStamina(), 100));
}

void StressActionsNeverStick()
{
    ++Scenarios;
    Fighter Model;
    std::uint32_t Seed = 1327;
    for (int Index = 0; Index < 12000; ++Index)
    {
        Seed = Seed * 1664525U + 1013904223U;
        if (Index % 17 == 0) Model.Request(static_cast<Action>((Seed >> 24) % 6));
        if (Index % 29 == 0) Model.SetGuardHeld(false);
        if (Index % 331 == 0) Model.ReceiveHit(GetAttackSpec(Style::WingChun, false));
        if (!Model.IsAlive()) Model.Reset();
        Model.Tick(1.0f / 120.0f);
        CHECK(Model.GetHealth() >= 0 && Model.GetHealth() <= Model.GetMaxHealth());
        CHECK(Model.GetStamina() >= 0 && Model.GetStamina() <= Fighter::MaxStamina);
        CHECK(Model.GetPosture() >= 0 && Model.GetPosture() <= Model.GetMaxPosture());
    }
    Model.SetGuardHeld(false);
    Model.Tick(5);
    CHECK(Model.GetState() == State::Idle);
    CHECK(!Model.HasBufferedInput());
}
} // namespace

int main()
{
    AttackLifecycle();
    UniqueHitsPerSwing();
    HitSetCapacity();
    LateBufferExecutesOnce();
    EarlyBufferExpires();
    LatestBufferWins();
    ResourceExhaustionAndRecovery();
    GuardDeflectAndRearHit();
    StyleDeflectDifference();
    GuardRepressCannotExtendDeflect();
    DeflectInterruptsAttacker();
    EvadeTiming();
    PostureBreakAndFiniteRecovery();
    StaminaBreakWithoutFullPosture();
    StanceTransitionAndCost();
    InterruptedSwitchDoesNotCommit();
    BufferedStyleCycleUsesDestination();
    HybridSnapshotAndRecovery();
    DeathIsTerminalAndResetIsClean();
    FramePartitionStability();
    InvalidTimeAndHitsAreIgnored();
    StressActionsNeverStick();
    if (Failures)
    {
        std::cerr << Failures << " assertion(s) failed across " << Scenarios << " scenarios.\n";
        return EXIT_FAILURE;
    }
    std::cout << "PASS: " << Scenarios << " combat core scenarios (no Unreal runtime validation).\n";
    return EXIT_SUCCESS;
}
