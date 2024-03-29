# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2023-07-08

### Added

- **GitHub** - Added a link to the [GitHub repository](https://github.com/mapmarktool/map-mark/) to the top bar.
- **Favicon** - Just a lil' favicon!

### Changed

- Moved Background Color picker to Map settings dialog

## [0.2.1] - 2023-07-08

### Changed

- Save data will no longer persist images, because of localStorage limitations. This should fix issue where stuff might crash when selecting an image that is too big to fit into localStorage.
  This means you will have to re-select images when you reload.

## [0.2.0] - 2023-07-08

### Added

- **Saving** - The tool will now automatically save your state, and restore it on load!
- **Map settings screen** - You can now edit a map's properties
- **Delete maps** - Now you can delete maps! This is done in the new Map Settings screen.
- **Changelog** - A changelog screen that will show up once per version, 👋 Hi!

### Changed

- Changed some colors around
- Dialogs should in general be a bit nicer looking

## [0.1.0] - 2023-07-07

Initial version!
