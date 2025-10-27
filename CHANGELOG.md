# Change Log - NodeJS-EZTest

All _important_ changes to the extension "NodeJS-EZTest" are documented in this document.

## [0.1.0] - 2023-05-21

### Added

- First release of the extension "NodeJS-EZTest".
- Added support for launching Node.js projects.

<br>

## [0.1.1] & [0.1.2] - 2023-05-21

### Changed

- Small text errors in CHANGELOG.md and README.md

<br>

## [0.1.3] - 2023-05-24

### Added

- License

<br>

## [0.1.4] - 2023-08-01

### Changed

- In the command && was changed to |.

<br>

## [0.1.5] - 2024-06-04

### Changed

- Commands are now independent of command prompt host (example: Powershell).
- If typescript files are present, it will now wait until the `tsc` command is finished before starting the code.
- Updated README.md

<br>

## [0.2.0] - 2024-06-26

### Added

- Added second statusbar button for restarting the terminal (when active) and compile Typescript file (when exists).

<br>

## [0.2.1] - 2024-07-01

### Changed

- Fixed stupid mistake with setInterval .... _sigh_

## [0.3.0] - 2025-01-14

### Changed

- Fixed the buttons not loading when vs code opens
- Typescript compilation function
- upgraded vs code version

### Added

- Typescript error page for failed compilation. _It's not pretty, but it works._

## [0.3.1] - 2025-01-14

### Changed

- downgraded vs code version

## [1.0.0] - 2025-01-20

### Changed

- Updated README.md
- Updated Icon

## [1.1.0 & 1.1.1] - 2025-05-29

### Added

- Added Configuration Feature for "Start Testing"

## [1.1.2] - 2025-05-31

### Changed

- Fix: Changed old custom json path :facepalm:

## [1.2.0] - 2025-08-08

### Added

- Added Waiting for code to finish (toggable with Setting `nodejs-eztest.waitForCodeToFinish`)
- Added support for TS errors without a file specified in the error *(is more of a fix)*

## [1.2.2] - 2025-10-27

### Fixed

- Extension not detecting deleted terminal correctly

### Changed
- Updated README.md