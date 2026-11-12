using UnrealBuildTool;

public class ThousandForms : ModuleRules
{
    public ThousandForms(ReadOnlyTargetRules Target) : base(Target)
    {
        PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;
        // Use the installed engine's required standard; portable rules also build as C++17.
        CppStandard = CppStandardVersion.Default;
        PublicDependencyModuleNames.AddRange(new[] { "Core", "CoreUObject", "Engine", "InputCore" });
    }
}
