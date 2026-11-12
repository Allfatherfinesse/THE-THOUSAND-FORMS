#pragma once

// Engine-independent prototype rules. These fictionalized actions are tuning
// hypotheses, not instruction or claims about any martial art's effectiveness.
#include <algorithm>
#include <array>
#include <cmath>
#include <cstdint>

namespace ThousandForms
{
enum class Style : std::uint8_t { MuayThai, WingChun, Taekwondo };
enum class Action : std::uint8_t { Light, Heavy, Guard, Evade, SwitchStyle, Hybrid };
enum class State : std::uint8_t
{
    Idle, Windup, Active, Recovery, Guarding, Evading, Switching,
    HitStun, PostureBroken, Dead
};
enum class HitResult : std::uint8_t
{
    Hit, Blocked, Deflected, Evaded, PostureBreak, Killed, Ignored
};

inline const char* GetStyleName(Style Value)
{
    switch (Value)
    {
    case Style::MuayThai: return "Muay Thai";
    case Style::WingChun: return "Wing Chun";
    case Style::Taekwondo: return "Taekwondo";
    }
    return "Unknown";
}

inline const char* GetStateName(State Value)
{
    switch (Value)
    {
    case State::Idle: return "Ready";
    case State::Windup: return "Windup";
    case State::Active: return "Active";
    case State::Recovery: return "Recovery";
    case State::Guarding: return "Guard";
    case State::Evading: return "Evade";
    case State::Switching: return "Switching";
    case State::HitStun: return "Hit stun";
    case State::PostureBroken: return "Posture broken";
    case State::Dead: return "Defeated";
    }
    return "Unknown";
}

inline Style NextStyle(Style Value)
{
    return static_cast<Style>((static_cast<unsigned>(Value) + 1U) % 3U);
}

struct AttackSpec
{
    const char* Name = "Pressure strike";
    Style Discipline = Style::MuayThai;
    float Windup = 0.20f;
    float Active = 0.12f;
    float Recovery = 0.28f;
    float StaminaCost = 15.0f;
    float Damage = 14.0f;
    float PostureDamage = 22.0f;
    float Range = 150.0f; // Unreal centimeters, measured from attacker center.
    float ArcDegrees = 85.0f; // Full cone angle; adapters use half of this.
};

inline AttackSpec GetAttackSpec(Style Discipline, bool Heavy)
{
    switch (Discipline)
    {
    case Style::MuayThai:
        if (Heavy) return {"Pressure heavy", Discipline, .42f, .16f, .45f, 29, 27, 40, 170, 90};
        return {"Pressure strike", Discipline, .20f, .12f, .28f, 15, 14, 22, 150, 85};
    case Style::WingChun:
        if (Heavy) return {"Centerline heavy", Discipline, .32f, .10f, .34f, 25, 21, 28, 150, 65};
        return {"Centerline strike", Discipline, .14f, .09f, .20f, 12, 10, 14, 135, 65};
    case Style::Taekwondo:
        if (Heavy) return {"Range heavy", Discipline, .52f, .14f, .50f, 32, 31, 32, 245, 75};
        return {"Range strike", Discipline, .28f, .12f, .34f, 18, 18, 18, 215, 75};
    }
    return {};
}

class Fighter
{
public:
    static constexpr float MaxStamina = 100.0f;
    static constexpr float BufferSeconds = .16f;
    static constexpr float EvadeSeconds = .48f;
    static constexpr float EvadeInvulnerableStart = .08f;
    static constexpr float EvadeInvulnerableEnd = .30f;
    static constexpr float SwitchSeconds = .22f;
    static constexpr float GuardRearmSeconds = .35f;

    Fighter() { Reset(); }

    void Reset(Style Initial = Style::MuayThai, float NewMaxHealth = 100.0f,
               float NewMaxPosture = 100.0f)
    {
        CurrentStyle = ValidStyle(Initial) ? Initial : Style::MuayThai;
        HybridStyle = NextStyle(CurrentStyle);
        PendingStyle = CurrentStyle;
        MaxHealth = std::isfinite(NewMaxHealth) && NewMaxHealth > 0 ? NewMaxHealth : 100.0f;
        MaxPosture = std::isfinite(NewMaxPosture) && NewMaxPosture > 0 ? NewMaxPosture : 100.0f;
        Health = MaxHealth;
        Stamina = MaxStamina;
        Posture = 0;
        CurrentState = State::Idle;
        StateTime = 0;
        StaminaDelay = 0;
        PostureDelay = 0;
        GuardHeld = false;
        GuardCanDeflect = false;
        GuardRearmDelay = 0;
        Buffered = false;
        BufferRemaining = 0;
        HitCount = 0;
        AttackSequence = 0;
        CurrentAttack = GetAttackSpec(CurrentStyle, false);
        HitStunSeconds = .28f;
    }

    // True means started or stored in the one-slot input buffer. Resources are
    // charged only when the action actually starts. Latest valid input wins.
    bool Request(Action Input)
    {
        if (!IsAlive()) return false;
        if (Input == Action::Guard)
        {
            SetGuardHeld(true);
            return true;
        }
        return RequestInternal(Input, NextStyle(CurrentState == State::Switching ? PendingStyle : CurrentStyle));
    }

    bool RequestStyle(Style Target)
    {
        if (!ValidStyle(Target) || Target == CurrentStyle || !IsAlive()) return false;
        return RequestInternal(Action::SwitchStyle, Target);
    }

    void SetGuardHeld(bool Held)
    {
        GuardHeld = Held && IsAlive();
        if (!GuardHeld && CurrentState == State::Guarding) Enter(State::Idle);
        else if (GuardHeld && CurrentState == State::Idle) Enter(State::Guarding);
    }

    void SetHybridStyle(Style Target)
    {
        if (ValidStyle(Target)) HybridStyle = Target;
    }

    // The adapter must query active hits during its own <= 1/120s simulation
    // steps. Advancing across an entire active interval cannot apply a world hit.
    // Split exactly at state/buffer boundaries; regeneration integrates elapsed
    // time analytically, independently of the caller's frame partition.
    void Tick(float DeltaSeconds)
    {
        if (!std::isfinite(DeltaSeconds) || DeltaSeconds <= 0 || !IsAlive()) return;
        TickStep(DeltaSeconds);
    }

    HitResult ReceiveHit(const AttackSpec& Incoming, bool Frontal = true)
    {
        if (!IsAlive()) return HitResult::Ignored;
        if (!std::isfinite(Incoming.Damage) || !std::isfinite(Incoming.PostureDamage)
            || Incoming.Damage < 0 || Incoming.PostureDamage < 0)
            return HitResult::Ignored;
        if (IsInvulnerable()) return HitResult::Evaded;

        if (CurrentState == State::Guarding && Frontal)
        {
            const float DeflectWindow = CurrentStyle == Style::WingChun ? .16f : .10f;
            if (GuardCanDeflect && StateTime < DeflectWindow && Stamina >= 5.0f)
            {
                SpendStamina(5.0f);
                Posture = std::max(0.0f, Posture - 10.0f);
                return HitResult::Deflected;
            }
            SpendStamina(Incoming.PostureDamage * .65f);
            Posture = std::min(MaxPosture, Posture + Incoming.PostureDamage);
            PostureDelay = .6f;
            if (Posture >= MaxPosture || Stamina <= 0)
            {
                Health = std::max(0.0f, Health - Incoming.Damage * .25f);
                if (Health <= 0) return Die();
                BreakPosture();
                return HitResult::PostureBreak;
            }
            return HitResult::Blocked;
        }

        Health = std::max(0.0f, Health - Incoming.Damage);
        Posture = std::min(MaxPosture, Posture + Incoming.PostureDamage * .65f);
        PostureDelay = .6f;
        StaminaDelay = std::max(StaminaDelay, .4f);
        Buffered = false;
        if (Health <= 0) return Die();
        // Further impacts during a break deal damage without extending the
        // recovery window indefinitely.
        if (CurrentState == State::PostureBroken) return HitResult::Hit;
        if (Posture >= MaxPosture)
        {
            BreakPosture();
            return HitResult::PostureBreak;
        }
        HitStunSeconds = .28f;
        Enter(State::HitStun);
        return HitResult::Hit;
    }

    // The collision adapter calls this on the attacker when the defender
    // returns Deflected. Never apply a regular hit to the defender afterward.
    void ApplyDeflectStun()
    {
        if (!IsAlive() || CurrentState == State::PostureBroken) return;
        Buffered = false;
        Posture = std::min(MaxPosture, Posture + 28.0f);
        PostureDelay = .6f;
        StaminaDelay = std::max(StaminaDelay, .4f);
        if (Posture >= MaxPosture) BreakPosture();
        else
        {
            HitStunSeconds = .45f;
            Enter(State::HitStun);
        }
    }

    State GetState() const { return CurrentState; }
    float GetStateTime() const { return StateTime; }
    Style GetStyle() const { return CurrentStyle; }
    Style GetHybridStyle() const { return HybridStyle; }
    float GetHealth() const { return Health; }
    float GetMaxHealth() const { return MaxHealth; }
    float GetStamina() const { return Stamina; }
    float GetPosture() const { return Posture; }
    float GetMaxPosture() const { return MaxPosture; }
    const AttackSpec& GetAttack() const { return CurrentAttack; }
    std::uint64_t GetAttackSequence() const { return AttackSequence; }
    bool IsAlive() const { return CurrentState != State::Dead; }
    bool HasBufferedInput() const { return Buffered; }
    bool IsInvulnerable() const
    {
        return CurrentState == State::Evading
            && StateTime >= EvadeInvulnerableStart && StateTime < EvadeInvulnerableEnd;
    }
    bool CanHit(std::uint32_t Target) const
    {
        if (CurrentState != State::Active || HitCount >= HitTargets.size()) return false;
        for (std::size_t Index = 0; Index < HitCount; ++Index)
            if (HitTargets[Index] == Target) return false;
        return true;
    }
    bool RegisterHit(std::uint32_t Target)
    {
        if (!CanHit(Target)) return false;
        HitTargets[HitCount++] = Target;
        return true;
    }

private:
    static bool ValidStyle(Style Value)
    {
        return Value == Style::MuayThai || Value == Style::WingChun || Value == Style::Taekwondo;
    }

    bool IsReady() const { return CurrentState == State::Idle || CurrentState == State::Guarding; }

    bool RequestInternal(Action Input, Style Target)
    {
        if (IsReady()) return StartAction(Input, Target);
        if (CurrentState == State::Dead || CurrentState == State::HitStun
            || CurrentState == State::PostureBroken) return false;
        Buffered = true;
        BufferedAction = Input;
        BufferedStyle = Target;
        BufferRemaining = BufferSeconds;
        return true;
    }

    bool StartAction(Action Input, Style Target)
    {
        if (Input == Action::Light || Input == Action::Heavy || Input == Action::Hybrid)
        {
            AttackSpec Proposed = GetAttackSpec(Input == Action::Hybrid ? HybridStyle : CurrentStyle,
                                                Input != Action::Light);
            if (Input == Action::Hybrid)
            {
                Proposed.StaminaCost += 8.0f;
                Proposed.Recovery += .10f;
            }
            if (Stamina < Proposed.StaminaCost) return false;
            CurrentAttack = Proposed;
            SpendStamina(Proposed.StaminaCost);
            HitCount = 0;
            ++AttackSequence;
            Enter(State::Windup);
            return true;
        }
        if (Input == Action::Evade)
        {
            if (Stamina < 20.0f) return false;
            SpendStamina(20.0f);
            Enter(State::Evading);
            return true;
        }
        if (Input == Action::SwitchStyle)
        {
            if (Target == CurrentStyle || Stamina < 8.0f) return false;
            PendingStyle = Target;
            SpendStamina(8.0f);
            Enter(State::Switching);
            return true;
        }
        return false;
    }

    void Enter(State Value)
    {
        CurrentState = Value;
        StateTime = 0;
        if (Value == State::Guarding)
        {
            GuardCanDeflect = GuardRearmDelay <= 0;
            if (GuardCanDeflect) GuardRearmDelay = GuardRearmSeconds;
        }
    }
    void SpendStamina(float Amount)
    {
        Stamina = std::max(0.0f, Stamina - Amount);
        StaminaDelay = .75f;
    }
    void BreakPosture()
    {
        Buffered = false;
        Posture = MaxPosture;
        Enter(State::PostureBroken);
    }
    HitResult Die()
    {
        Buffered = false;
        GuardHeld = false;
        Health = 0;
        Enter(State::Dead);
        return HitResult::Killed;
    }

    float StateDuration() const
    {
        switch (CurrentState)
        {
        case State::Windup: return CurrentAttack.Windup;
        case State::Active: return CurrentAttack.Active;
        case State::Recovery: return CurrentAttack.Recovery;
        case State::Evading: return EvadeSeconds;
        case State::Switching: return SwitchSeconds;
        case State::HitStun: return HitStunSeconds;
        case State::PostureBroken: return 1.10f;
        default: return 0;
        }
    }

    void CompleteState()
    {
        switch (CurrentState)
        {
        case State::Windup: Enter(State::Active); break;
        case State::Active: Enter(State::Recovery); break;
        case State::Switching:
            CurrentStyle = PendingStyle;
            Enter(State::Idle);
            break;
        case State::PostureBroken:
            Posture = std::min(35.0f, MaxPosture * .35f);
            Enter(State::Idle);
            break;
        default: Enter(State::Idle); break;
        }
        if (CurrentState == State::Idle)
        {
            if (Buffered)
            {
                const Action Next = BufferedAction;
                const Style Target = BufferedStyle;
                Buffered = false;
                StartAction(Next, Target);
            }
            if (CurrentState == State::Idle && GuardHeld) Enter(State::Guarding);
        }
    }

    void TickStep(float DeltaSeconds)
    {
        // Split on state boundaries so overshoot carries into the next state.
        while (DeltaSeconds > 0)
        {
            const float Duration = StateDuration();
            float Step = DeltaSeconds;
            if (Duration > 0) Step = std::min(Step, std::max(0.0f, Duration - StateTime));
            if (Buffered && BufferRemaining < Step) Step = BufferRemaining;

            const float RegenTime = std::max(0.0f, Step - StaminaDelay);
            const float PostureRegenTime = std::max(0.0f, Step - PostureDelay);
            StaminaDelay = std::max(0.0f, StaminaDelay - Step);
            PostureDelay = std::max(0.0f, PostureDelay - Step);
            GuardRearmDelay = std::max(0.0f, GuardRearmDelay - Step);
            if (IsReady())
            {
                const float Rate = CurrentState == State::Guarding ? 8.0f : 26.0f;
                Stamina = std::min(MaxStamina, Stamina + Rate * RegenTime);
                if (CurrentState == State::Idle)
                    Posture = std::max(0.0f, Posture - 16.0f * PostureRegenTime);
            }
            StateTime += Step;
            DeltaSeconds -= Step;
            if (Buffered)
            {
                BufferRemaining -= Step;
                // At an exact tie the buffer expires; acceptance requires a
                // ready state strictly before its deadline.
                if (BufferRemaining <= 0.000001f) Buffered = false;
            }
            if (Duration > 0 && StateTime >= Duration - 0.000001f) CompleteState();
        }
    }

    Style CurrentStyle = Style::MuayThai;
    Style HybridStyle = Style::WingChun;
    Style PendingStyle = Style::MuayThai;
    State CurrentState = State::Idle;
    AttackSpec CurrentAttack;
    float MaxHealth = 100;
    float Health = 100;
    float Stamina = MaxStamina;
    float MaxPosture = 100;
    float Posture = 0;
    float StateTime = 0;
    float StaminaDelay = 0;
    float PostureDelay = 0;
    float HitStunSeconds = .28f;
    bool GuardHeld = false;
    bool GuardCanDeflect = false;
    float GuardRearmDelay = 0;
    bool Buffered = false;
    Action BufferedAction = Action::Light;
    Style BufferedStyle = Style::MuayThai;
    float BufferRemaining = 0;
    std::array<std::uint32_t, 32> HitTargets{};
    std::size_t HitCount = 0;
    std::uint64_t AttackSequence = 0;
};
} // namespace ThousandForms
