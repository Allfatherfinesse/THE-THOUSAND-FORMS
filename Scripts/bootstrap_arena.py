"""Run only inside the validated UE5 editor via Scripts/ue.py bootstrap.

Creates the minimal map and lighting. Native GameMode builds arena geometry at
runtime. Existing maps are never overwritten by this script.
"""
from pathlib import Path
import unreal

MAP_PATH = "/Game/Maps/TrainingArena"

def bootstrap():
    if unreal.EditorAssetLibrary.does_asset_exist(MAP_PATH):
        unreal.log(f"Preserving existing map: {MAP_PATH}")
    else:
        levels = unreal.get_editor_subsystem(unreal.LevelEditorSubsystem)
        actors = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
        unreal.EditorAssetLibrary.make_directory("/Game/Maps")
        if not levels.new_level(MAP_PATH):
            raise RuntimeError(f"Cannot create {MAP_PATH}")

        start = actors.spawn_actor_from_class(unreal.PlayerStart, unreal.Vector(-350, 0, 100))
        start.set_actor_label("Player Start")
        sun = actors.spawn_actor_from_class(unreal.DirectionalLight, unreal.Vector(0, 0, 600), unreal.Rotator(-45, -35, 0))
        sun.set_actor_label("Training Sun")
        light = sun.get_component_by_class(unreal.DirectionalLightComponent)
        light.set_mobility(unreal.ComponentMobility.MOVABLE)
        light.set_editor_property("intensity", 5.0)
        light.set_editor_property("atmosphere_sun_light", True)
        actors.spawn_actor_from_class(unreal.SkyAtmosphere, unreal.Vector(0, 0, 0))
        sky = actors.spawn_actor_from_class(unreal.SkyLight, unreal.Vector(0, 0, 500))
        sky_component = sky.get_component_by_class(unreal.SkyLightComponent)
        sky_component.set_mobility(unreal.ComponentMobility.MOVABLE)
        sky_component.set_editor_property("real_time_capture", True)
        if not levels.save_current_level():
            raise RuntimeError("Arena map save failed")
        unreal.log(f"Created {MAP_PATH}. Native TrainingGameMode is selected in DefaultEngine.ini.")


try:
    bootstrap()
    receipt = Path(unreal.Paths.project_saved_dir()) / "Phase1Bootstrap.ok"
    receipt.parent.mkdir(parents=True, exist_ok=True)
    receipt.write_text("Arena bootstrap completed\n", encoding="utf-8")
finally:
    unreal.SystemLibrary.quit_editor()
