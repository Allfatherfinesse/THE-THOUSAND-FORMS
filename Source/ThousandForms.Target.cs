using UnrealBuildTool;

public class ThousandFormsTarget : TargetRules
{
    public ThousandFormsTarget(TargetInfo Target) : base(Target)
    {
        Type = TargetType.Game;
        // Follow the selected installation until an engine version is validated and pinned.
        DefaultBuildSettings = BuildSettingsVersion.Latest;
        ExtraModuleNames.Add("ThousandForms");
    }
}
