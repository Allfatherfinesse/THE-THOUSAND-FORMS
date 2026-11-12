#!/usr/bin/env bash
set -euo pipefail
test_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
test_build_dir="$(mktemp -d "${TMPDIR:-/tmp}/thousand-forms-tests.XXXXXX")"
trap 'rm -rf -- "$test_build_dir"' EXIT
test_cxx="${CXX:-g++}"
test_flags=(-std=c++17 -Wall -Wextra -Wpedantic -Werror -O2)
if [[ "${SANITIZE:-0}" == "1" ]]; then
    test_flags+=(-O1 -g -fsanitize=address,undefined -fno-omit-frame-pointer)
fi
"$test_cxx" "${test_flags[@]}" "$test_root/Tests/CombatCoreTests.cpp" -o "$test_build_dir/combat-tests"
"$test_build_dir/combat-tests"
