// react-shell — public API barrel (the package `exports["."]` entry).
//
// This is the entire importable surface consumers get via the git-dep (D5).
// It is populated as the build phases land:
//   B theming · C providers + auth seam · D app-shell · E page/tab primitives ·
//   F i18n seam.
// The dev-harness (src/main.tsx, src/routes/**) is NOT exported.
//
// Intentionally empty until Phase B.
export {}
