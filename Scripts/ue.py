#!/usr/bin/env python3
"""Local UE5 validation/build driver. Never downloads Unreal or deploys a build."""
import argparse
import json
import os
from pathlib import Path
import platform
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
PROJECT = ROOT / "ThousandForms.uproject"
MAP = ROOT / "Content/Maps/TrainingArena.umap"
BOOTSTRAP_RECEIPT = ROOT / "Saved/Phase1Bootstrap.ok"


def engine_info(engine_root):
    if not engine_root:
        raise RuntimeError("Unreal Engine is not configured. Set UE_ROOT to an installed UE5 root (the directory containing Engine).")
    root = Path(engine_root).expanduser().resolve()
    version_file = root / "Engine/Build/Build.version"
    if not version_file.is_file():
        raise RuntimeError(f"Missing engine version file: {version_file}")
    version = json.loads(version_file.read_text(encoding="utf-8-sig"))
    if version.get("MajorVersion") != 5:
        raise RuntimeError("This prototype requires Unreal Engine 5; no engine version is assumed.")
    host = platform.system()
    if host == "Linux":
        editor = root / "Engine/Binaries/Linux/UnrealEditor"
        build = root / "Engine/Build/BatchFiles/Linux/Build.sh"
        uat = root / "Engine/Build/BatchFiles/RunUAT.sh"
        target = "Linux"
    elif host == "Windows":
        editor = root / "Engine/Binaries/Win64/UnrealEditor.exe"
        build = root / "Engine/Build/BatchFiles/Build.bat"
        uat = root / "Engine/Build/BatchFiles/RunUAT.bat"
        target = "Win64"
    else:
        raise RuntimeError(f"Build driver currently supports Linux and Windows hosts, got {host}.")
    for path in (editor, build, uat):
        if not path.is_file():
            raise RuntimeError(f"Required Unreal tool missing: {path}")
    return root, version, editor, build, uat, target


def run(argv):
    argv = [str(arg) for arg in argv]
    print("Running:", subprocess.list2cmdline(argv), flush=True)
    subprocess.run(argv, cwd=ROOT, check=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=("doctor", "build", "bootstrap", "editor", "package"))
    parser.add_argument("--engine-root", default=os.environ.get("UE_ROOT"))
    args = parser.parse_args()
    root, version, editor, build, uat, target = engine_info(args.engine_root)
    version_name = ".".join(str(version[key]) for key in ("MajorVersion", "MinorVersion", "PatchVersion"))
    print(f"Unreal {version_name} | {root} | {target}")
    print(f"Project: {PROJECT}\nArena map: {'present' if MAP.is_file() else 'not generated'}")
    if args.command == "doctor":
        return
    # Record the actual local environment before any build or asset generation.
    saved = ROOT / "Saved"
    saved.mkdir(exist_ok=True)
    (saved / "Phase1Environment.json").write_text(json.dumps({
        "engine_root": str(root), "engine_version": version,
        "host": platform.platform(), "target": target, "requested_command": args.command,
    }, indent=2) + "\n", encoding="utf-8")
    if args.command == "build":
        run([build, "ThousandFormsEditor", target, "Development", f"-Project={PROJECT}", "-WaitMutex"])
    elif args.command == "bootstrap":
        # Build first so the map can resolve its native game mode and default pawn.
        BOOTSTRAP_RECEIPT.unlink(missing_ok=True)
        run([editor, PROJECT, "/Engine/Maps/Entry", f"-ExecutePythonScript={ROOT / 'Scripts/bootstrap_arena.py'}",
             "-unattended", "-nop4", "-nosplash", "-nullrhi", "-stdout", "-FullStdOutLogOutput"])
        if not MAP.is_file() or not BOOTSTRAP_RECEIPT.is_file():
            raise RuntimeError("Editor did not finish the arena bootstrap; inspect Saved/Logs before continuing.")
    elif args.command == "editor":
        if not MAP.is_file():
            raise RuntimeError("Run build then bootstrap first; the authored map is not included in the source preparation.")
        run([editor, PROJECT, "/Game/Maps/TrainingArena", "-log"])
    else:
        if not MAP.is_file():
            raise RuntimeError("Run build then bootstrap before packaging.")
        run([uat, "BuildCookRun", f"-project={PROJECT}", "-noP4", f"-platform={target}",
             "-clientconfig=Development", "-build", "-cook", "-map=/Game/Maps/TrainingArena",
             "-stage", "-pak", "-package", "-archive", f"-archivedirectory={ROOT / 'Builds' / target}"])


if __name__ == "__main__":
    try:
        main()
    except (RuntimeError, OSError, ValueError, subprocess.CalledProcessError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        sys.exit(1)
