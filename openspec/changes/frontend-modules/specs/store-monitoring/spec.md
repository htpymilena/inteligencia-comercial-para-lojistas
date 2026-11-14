# Spec Delta

## Purpose

Provides demonstration sensor monitoring placeholders and an interactive schematic store heat map, visualizing customer presence patterns while upholding strict simulation and privacy guidelines.

## ADDED Requirements

### Requirement: Simulated Camera Monitoring View
The application SHALL render a monitoring view with camera placeholders, synthetic entry/exit indicators, and explicit demonstration disclaimers without streaming live video.

#### Scenario: Inspecting camera monitoring cards
- **GIVEN** an active store with configured demonstration cameras
- **WHEN** the user opens the monitoring view
- **THEN** camera cards render schematic illustrations, synthetic occupant counts, observed zone tags, and a prominent DEMO badge

#### Scenario: Refreshing monitoring snapshot data
- **WHEN** the user triggers the refresh action
- **THEN** the application requests the latest synthetic snapshot without establishing persistent streaming or WebSockets

#### Scenario: Absence of biometric or personal surveillance features
- **WHEN** the user inspects the monitoring interface
- **THEN** the interface contains no video recordings, facial recognition features, or individual personal tracking controls

### Requirement: Interactive Schematic Store Heat Map
The application SHALL render a schematic store layout on a 10x8 cell grid, highlighting zones and coloring cells according to synthetic density intensity levels.

#### Scenario: Rendering heat map for a selected date
- **WHEN** the user selects a calendar date and applies the heat map filter
- **THEN** the 10x8 grid paints cells with intensity shades between zero and one and associates each cell with its designated retail zone

#### Scenario: Accessible representation of heat intensity
- **WHEN** viewing the heat map
- **THEN** an accessible legend and textual summary describe zones by category (Low, Medium, High intensity) alongside color indicators

#### Scenario: No heat map data available for selected date
- **WHEN** querying a date with no recorded heat map points
- **THEN** the view renders the blank store architectural outline accompanied by an explanatory empty state message
