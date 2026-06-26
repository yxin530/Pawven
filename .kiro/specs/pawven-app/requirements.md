# Requirements Document

## Introduction

Pawven is a community mobile app for animal welfare enthusiasts, focusing on community cat management and local event coordination. Built with Expo 52, Clerk authentication, NativeWind styling, and Zustand state management, the app provides a warm, nature-toned experience for users to discover events, connect with feeders/organizations, and report Trap-Neuter-Return (TNR) activities.

## Glossary

- **App**: The Pawven mobile application built with Expo 52
- **Auth_System**: The Clerk-based authentication module handling sign-in, sign-up, and session management
- **Root_Layout**: The top-level Expo Router layout that determines authenticated vs unauthenticated routing
- **Auth_Stack**: The navigation stack containing sign-in and sign-up screens, rendered without headers
- **Tab_Navigator**: The bottom tab bar providing navigation between Home, Discover, and TNR screens
- **Home_Feed**: The main event feed displaying event cards and update threads
- **Discover_Screen**: The screen presenting a Luma-style card feed with an optional map view toggle
- **TNR_Form**: The Trap-Neuter-Return report submission form for community cat management
- **Profile_Screen**: The user profile screen accessible from top-left navigation
- **Card_Component**: A shared UI component displaying content in a styled card layout
- **Badge_Component**: A shared UI component displaying status or category badges
- **FilterPill_Component**: A shared UI component for filtering content by category
- **Location_Hook**: The Expo Location hook providing device geolocation data
- **Auth_Store**: The Zustand store managing authentication state
- **Feeder_Store**: The Zustand store managing community feeder data
- **Cart_Store**: The Zustand store managing cart-related state
- **Badge_Store**: The Zustand store managing user badge/achievement data
- **TNR_Store**: The Zustand store managing TNR report data
- **API_Client**: The REST API client module for backend communication
- **Token_Cache**: The Clerk SecureStore-based token persistence mechanism
- **Color_Palette**: The warm nature-toned color constants used throughout the App

## Requirements

### Requirement 1: User Authentication

**User Story:** As a new or returning user, I want to sign in or sign up with email and password, so that I can access the community features securely.

#### Acceptance Criteria

1. WHEN an unauthenticated user opens the App, THE Root_Layout SHALL route the user to the Auth_Stack
2. WHEN an authenticated user opens the App, THE Root_Layout SHALL route the user to the Tab_Navigator
3. THE Auth_Stack SHALL render sign-in and sign-up screens without a navigation header
4. WHEN a user submits a valid email address and password on the sign-in screen, THE Auth_System SHALL authenticate the user, establish a session, and THE Root_Layout SHALL route the user to the Tab_Navigator
5. IF a user submits invalid credentials on the sign-in screen, THEN THE Auth_System SHALL display an error message indicating the reason for authentication failure and SHALL remain on the sign-in screen
6. WHEN a user submits a valid email address and a password of at least 8 characters on the sign-up screen, THE Auth_System SHALL create an account and send an email verification message to the provided address
7. WHEN a user completes email verification, THE Auth_System SHALL activate the account, establish a session, and THE Root_Layout SHALL route the user to the Tab_Navigator
8. IF email verification is not completed within 10 minutes, THEN THE Auth_System SHALL expire the verification link and prompt the user to request a new verification email
9. THE Token_Cache SHALL persist authentication tokens in SecureStore across app restarts
10. IF a user attempts to sign up with an email address already associated with an existing account, THEN THE Auth_System SHALL display an error message indicating the email is already registered and SHALL remain on the sign-up screen
11. IF a network error occurs during sign-in or sign-up submission, THEN THE Auth_System SHALL display an error message indicating the connection failure and SHALL preserve the user's entered form data

### Requirement 2: Profile Screen

**User Story:** As an authenticated user, I want to view and manage my profile, so that I can see my account information and personalize my experience.

#### Acceptance Criteria

1. THE Profile_Screen SHALL be accessible via a navigation element positioned in the top-left area of the screen
2. WHEN the user navigates to the Profile_Screen, THE App SHALL display the user's name, email address, and profile image retrieved from the Auth_System
3. WHILE the user is on any tab within the Tab_Navigator, THE Profile_Screen navigation element SHALL remain visible and accessible
4. WHEN the user taps the sign-out action on the Profile_Screen, THE Auth_Store SHALL clear the session and THE Root_Layout SHALL route the user to the Auth_Stack
5. IF the Auth_System fails to retrieve account information, THEN THE Profile_Screen SHALL display an error message indicating the data could not be loaded and SHALL provide a retry action
6. WHEN the user taps a back or dismiss control on the Profile_Screen, THE App SHALL return the user to the previously active tab in the Tab_Navigator

### Requirement 3: Tab-Based Navigation

**User Story:** As an authenticated user, I want to navigate between Home, Discover, and TNR screens using a bottom tab bar, so that I can easily access different sections of the app.

#### Acceptance Criteria

1. THE Tab_Navigator SHALL display three tabs in left-to-right order: "Home", "Discover", and "TNR"
2. WHEN the user taps a tab, THE Tab_Navigator SHALL switch the active screen to the corresponding tab content
3. THE Tab_Navigator SHALL distinguish the currently active tab from inactive tabs by rendering the active tab label and icon in a visually distinct style
4. WHEN an authenticated session is established, THE Tab_Navigator SHALL default to the Home tab
5. WHILE the user is on any tab screen, THE Tab_Navigator SHALL remain visible and accessible at the bottom of the screen

### Requirement 4: Home Feed

**User Story:** As a community member, I want to see an event feed with update threads, so that I can stay informed about local animal welfare activities.

#### Acceptance Criteria

1. WHEN the user navigates to the Home tab, THE Home_Feed SHALL display a scrollable list of event cards ordered by most recent first, rendering a maximum of 20 event cards per loaded batch
2. THE Home_Feed SHALL render each event using the Card_Component
3. WHEN the user taps an event card, THE Home_Feed SHALL navigate to a detail view displaying the event's update thread as a chronological list of updates
4. WHEN the user pulls down on the Home_Feed list, THE Home_Feed SHALL request the latest events from the API_Client and prepend any new events to the displayed list
5. IF the API_Client returns an error when loading events, THEN THE Home_Feed SHALL display an error message indicating the feed could not be loaded and SHALL provide a retry action
6. IF the API_Client returns no events, THEN THE Home_Feed SHALL display an empty state message indicating no events are available

### Requirement 5: Discover Screen

**User Story:** As a community member, I want to browse events and organizations in a visual card feed with the option to see them on a map, so that I can discover nearby activities and groups.

#### Acceptance Criteria

1. WHEN the user navigates to the Discover tab, THE Discover_Screen SHALL display a scrollable card feed where each card shows a large image, event or organization title, and associated organization information
2. THE Discover_Screen SHALL provide a toggle control to switch between card feed view and map view
3. WHEN the user activates the map toggle, THE Discover_Screen SHALL display event and organization locations as tappable pins on a map that supports pan and zoom gestures
4. WHEN the user deactivates the map toggle, THE Discover_Screen SHALL return to the card feed view preserving any active filter selections
5. WHEN the user taps a FilterPill_Component, THE Discover_Screen SHALL display only events and organizations matching the selected filter category, and SHALL update both the card feed and map views accordingly
6. WHILE the map view is active and location permission is granted, THE Discover_Screen SHALL use the Location_Hook to center the map on the user's current location
7. IF the map view is active and location permission is denied, THEN THE Discover_Screen SHALL display the map at a default regional view without centering on the user's position
8. IF no events or organizations match the active filters, THEN THE Discover_Screen SHALL display an empty state message indicating no results were found

### Requirement 6: TNR Report Form

**User Story:** As a community cat caretaker, I want to submit Trap-Neuter-Return reports, so that the community can track and coordinate TNR efforts.

#### Acceptance Criteria

1. WHEN the user navigates to the TNR tab, THE TNR_Form SHALL display a report submission form
2. THE TNR_Form SHALL collect the following required fields: location (coordinates or address), cat description (free text, maximum 500 characters), and activity type (one of: Trapped, Neutered, Returned, Feeding, Sighting)
3. WHEN the user submits a TNR report with all required fields populated, THE TNR_Store SHALL persist the report data, THE API_Client SHALL send the report to the backend, and THE TNR_Form SHALL display a success confirmation to the user
4. IF the user submits a TNR report with one or more required fields empty, THEN THE TNR_Form SHALL display a validation error adjacent to each missing field indicating that it is required
5. THE TNR_Form SHALL use the Location_Hook to pre-populate the report location with the user's current coordinates, and IF location is unavailable, THEN THE TNR_Form SHALL allow the user to manually enter a location
6. IF the API_Client fails to send the TNR report to the backend, THEN THE TNR_Form SHALL display an error message indicating the submission failed and SHALL retain all entered form data so the user can retry without re-entering information

### Requirement 7: Shared UI Components

**User Story:** As a developer, I want reusable UI components styled with NativeWind, so that the app maintains visual consistency and development efficiency.

#### Acceptance Criteria

1. THE Card_Component SHALL render children passed via props within a styled container that has visible boundaries (background color, border-radius, and padding) following the Color_Palette
2. THE Badge_Component SHALL display category or status labels where each distinct category maps to a visually distinct color from the Color_Palette
3. THE FilterPill_Component SHALL render tappable pill-shaped elements for content filtering with visually distinct active and inactive states
4. WHEN the user taps a FilterPill_Component, THE FilterPill_Component SHALL toggle its active state and invoke an onChange callback prop with the updated selection
5. THE Card_Component, Badge_Component, and FilterPill_Component SHALL be exported from a shared components/ui/index.ts barrel file

### Requirement 8: Location Services

**User Story:** As a user, I want the app to access my device location, so that I can see nearby events and pre-fill location data in reports.

#### Acceptance Criteria

1. WHEN the Location_Hook is first invoked by a consuming component, THE Location_Hook SHALL request foreground location permissions from the user via the system permission dialog
2. IF the user grants location permission, THEN THE Location_Hook SHALL retrieve the device's current coordinates as a single one-time fix within 10 seconds and provide latitude and longitude values to the consuming component
3. IF the user denies location permission, THEN THE Location_Hook SHALL return a null location value, THE Discover_Screen SHALL display the map at a default position without auto-centering, and THE TNR_Form SHALL render the location field empty and manually editable
4. THE Location_Hook SHALL use Expo Location APIs to retrieve device geolocation
5. IF the user grants location permission but location retrieval fails or times out, THEN THE Location_Hook SHALL return a null location value and the consuming component SHALL behave as if permission were denied

### Requirement 9: State Management

**User Story:** As a developer, I want centralized state management using Zustand stores, so that app state is predictable and accessible across components.

#### Acceptance Criteria

1. THE Auth_Store SHALL expose the current user session object (or null when unauthenticated) and provide actions to trigger sign-in, sign-out, and session refresh
2. THE Feeder_Store SHALL store the list of community feeders retrieved from the API_Client and provide actions to fetch, refresh, and clear feeder data
3. THE Cart_Store SHALL store cart items and provide actions to add an item, remove an item, update an item's quantity, and clear all items from the cart
4. THE Badge_Store SHALL store the authenticated user's earned badges and provide actions to fetch and refresh badge data from the API_Client
5. THE TNR_Store SHALL store TNR report submissions history and a current draft report, and provide actions to create a draft, update draft fields, discard a draft, and append a submitted report to the history
6. WHEN any store's state changes, THE App SHALL reactively update all subscribed components without requiring manual refresh
7. WHEN a store initiates a data fetch via the API_Client, THE store SHALL expose a loading indicator while the request is in progress and, IF the request fails, THEN THE store SHALL expose an error state describing the failure while preserving any previously loaded data

### Requirement 10: API Communication

**User Story:** As a developer, I want a centralized REST API client, so that all backend communication follows a consistent pattern with proper authentication headers.

#### Acceptance Criteria

1. THE API_Client SHALL support GET, POST, PUT, and DELETE HTTP requests to configured backend endpoints defined in Config.ts with a request timeout of 30 seconds
2. WHILE a user session is active, THE API_Client SHALL include the authentication token from the Auth_Store in the authorization header of every outgoing request
3. IF an API request fails due to a network error or timeout, THEN THE API_Client SHALL return a structured error object containing a status code (0 for network errors), an error message indicating the failure reason, and an optional retry flag
4. IF an API request returns an unauthorized status, THEN THE API_Client SHALL trigger a session refresh via the Auth_Store and retry the original request once with the new token
5. IF the session refresh triggered by an unauthorized response fails, THEN THE API_Client SHALL return a structured error object indicating the authentication failure and invoke the Auth_Store sign-out action

### Requirement 11: Visual Theming

**User Story:** As a user, I want the app to have a warm, nature-toned visual aesthetic, so that the experience feels welcoming and aligned with the animal welfare mission.

#### Acceptance Criteria

1. THE Color_Palette SHALL define at least 5 named color roles (primary, secondary, background, surface, and accent) using hues from the green, brown, warm orange, and cream families
2. THE App SHALL apply NativeWind utility classes referencing the Color_Palette for all component styling, with no inline or hardcoded color values outside of constants/Colors.ts and tailwind.config.js
3. THE Color_Palette SHALL be defined in a single constants/Colors.ts file and extended into tailwind.config.js so that NativeWind utility classes can reference the palette tokens by name
4. THE Color_Palette SHALL include distinct values for text, border, and interactive-state (active, disabled) usage so that all UI states are styled from the palette

### Requirement 12: Mock Data for Development

**User Story:** As a developer, I want mock data files for feeders, events, and organizations, so that I can develop and test the UI without requiring a live backend.

#### Acceptance Criteria

1. THE App SHALL include mock data files for feeders (minimum 5 records), events (minimum 5 records), and organizations (minimum 3 records) in the data/ directory
2. THE mock data SHALL conform to the TypeScript interfaces defined in types/index.ts
3. IF the API_Client request fails, THEN THE App SHALL fall back to mock data for rendering UI components
4. THE mock data files SHALL each export a typed array as the default export matching the corresponding TypeScript interface
