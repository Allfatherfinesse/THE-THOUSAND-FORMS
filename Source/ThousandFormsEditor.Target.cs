using UnrealBuildTool;

public class ThousandFormsEditorTarget : TargetRules
{
    public ThousandFormsEditorTarget(TargetInfo Target) : base(Target)
    {
        Type = TargetType.Editor;
        DefaultBuildSettings = BuildSettingsVersion.Latest;
        ExtraModuleNames.Add("ThousandForms");
    }
}
