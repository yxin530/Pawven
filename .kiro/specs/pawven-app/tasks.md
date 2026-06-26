# Implementation Plan: Pawven App

## Overview

Implement the Pawven community animal welfare mobile app using Expo 52, Clerk authentication, NativeWind styling, Zustand state management, Mapbox maps, and Stripe payments. Tasks are ordered by dependency — foundational infrastructure first, then shared components, then screens, then integration wiring.

## Tasks

- [x] 1. Project scaffolding and configuration
  - [x] 1.1 Initialize Expo 52 project with TypeScript and install core dependencies
    - Initialize with `npx create-expo-app` using the blank TypeScript template
    - Install dependencies: `nativewind`, `tailwindcss`, `zustand`, `@clerk/clerk-expo`, `expo-secure-store`, `expo-location`, `@rnmapbox/maps`, `@stripe/stripe-react-native`, `mqtt`, `expo-router`, `react-native-reanimated`, `fast-check`, `jest-expo`, `@testing-library/react-native`
    - Configure `tsconfig.json`, `babel.config.js`, `metro.config.js` for NativeWind and Expo Router
    - _Requirements: 11.2, 11.3_

  - [x] 1.2 Set up NativeWind and Tailwind configuration with color palette
    - Create `constants/Colors.ts` with the full `ColorPalette` interface (primary: #2D5016, secondary: #8B4513, background: #FFF8F0, surface: #E8F0E0, accent: #E8740C, text: #1A1A1A, textSecondary: #5C6B4A, border: #D4C5A0, active: #4CAF50, disabled: #B0B0B0)
    - Create `tailwind.config.js` extending colors with palette tokens
    - Create `global.css` with Tailwind directives
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [x] 1.3 Create constants/Config.ts with API URLs, timeouts, and MQTT broker settings
    - Define API base URL, 30-second timeout, MQTT broker host/port, Cloudinary cloud name
    - _Requirements: 10.1_

  - [x] 1.4 Define TypeScript interfaces in types/index.ts
    - Implement all client-side interfaces: User, GeoLocation, Feeder, Event, EventCategory, Organization, TNRReport, TNRActivityType, TNRStatus, TNRDraft, UpdateMessage, CartItem, Badge, Transaction, DiscoverFilter, MapMarker, ApiError, ApiResponse, ColorPalette
    - _Requirements: 12.2_

- [x] 2. Core infrastructure modules
  - [x] 2.1 Implement Clerk token cache with SecureStore persistence
    - Create `lib/auth/token-cache.ts` using `expo-secure-store` to persist and retrieve Clerk tokens
    - Implement `getToken`, `saveToken`, `deleteToken` functions
    - _Requirements: 1.9_

  - [x] 2.2 Implement API client with auth interceptor and error handling
    - Create `lib/api.ts` with GET, POST, PUT, DELETE methods
    - Inject Authorization header from auth store when session is active
    - Handle 401 responses: refresh token then retry once, sign out if refresh fails
    - Return structured `ApiResponse<T>` / `ApiError` with statusCode 0 for network errors and 30-second timeout
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ]* 2.3 Write property tests for API client auth header injection
    - **Property 12: API Client auth header injection**
    - Use fast-check to generate random HTTP methods, paths, bodies, and tokens
    - Verify Authorization header is present for all requests when session is active
    - **Validates: Requirements 10.2**

  - [ ]* 2.4 Write property tests for API client network error structure
    - **Property 13: API Client network error structure**
    - Use fast-check to simulate network failures and timeouts
    - Verify returned ApiError has statusCode 0, non-empty message, and retry boolean
    - **Validates: Requirements 10.3**

  - [x] 2.5 Implement useLocation hook with Expo Location APIs
    - Create `hooks/useLocation.ts` that requests foreground permission
    - Return `{ latitude, longitude }` on grant, `null` on denial or timeout (10-second limit)
    - Use Expo Location `requestForegroundPermissionsAsync` and `getCurrentPositionAsync`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 3. Zustand state stores
  - [x] 3.1 Implement auth store
    - Create `store/auth-store.ts` with session, user, loading, error state
    - Implement signIn, signOut, refreshSession actions
    - _Requirements: 9.1_

  - [x] 3.2 Implement feeder store
    - Create `store/feeder-store.ts` with feeders array, loading, error state
    - Implement fetchFeeders, refreshFeeders, clearFeeders actions using API_Client
    - _Requirements: 9.2, 9.7_

  - [x] 3.3 Implement cart store
    - Create `store/cart-store.ts` with items array and computed total
    - Implement addItem (new item adds, existing increments quantity), removeItem, updateQuantity (minimum 1), clearCart actions
    - _Requirements: 9.3_

  - [ ]* 3.4 Write property tests for cart store invariants
    - **Property 9: Cart state invariants**
    - Use fast-check to generate random sequences of cart operations
    - Verify: no quantity < 1, addItem new increases length by 1, addItem existing increments quantity, removeItem decreases length by 1, clearCart empties array
    - **Validates: Requirements 9.3**

  - [x] 3.5 Implement badge store
    - Create `store/badge-store.ts` with badges array, loading, error state
    - Implement fetchBadges, refreshBadges actions using API_Client
    - _Requirements: 9.4, 9.7_

  - [x] 3.6 Implement TNR store
    - Create `store/tnr-store.ts` with history, draft, loading, error state
    - Implement createDraft (empty defaults), updateDraft (partial merge), discardDraft (null), submitReport (move to history)
    - _Requirements: 9.5, 9.7_

  - [ ]* 3.7 Write property tests for TNR draft lifecycle
    - **Property 10: TNR draft lifecycle consistency**
    - Use fast-check to generate random draft operation sequences
    - Verify: createDraft produces non-null with defaults, updateDraft only modifies specified fields, discardDraft sets null, submitReport moves to history
    - **Validates: Requirements 9.5**

  - [ ]* 3.8 Write property tests for store error preservation
    - **Property 11: Store fetch error preserves existing data**
    - Use fast-check with random pre-loaded states and simulated fetch failures
    - Verify previously loaded data remains unchanged and error string is non-null
    - **Validates: Requirements 9.7**

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Mock data files
  - [x] 5.1 Create mock data for feeders, events, and organizations
    - Create `data/feeders.ts` with minimum 5 Feeder records conforming to Feeder interface
    - Create `data/events.ts` with minimum 5 Event records conforming to Event interface
    - Create `data/organizations.ts` with minimum 3 Organization records conforming to Organization interface
    - Each file exports a typed array as default export
    - _Requirements: 12.1, 12.2, 12.4_

  - [ ]* 5.2 Write property tests for mock data schema conformance
    - **Property 14: Mock data schema conformance**
    - Use fast-check to iterate all records in each mock data file
    - Verify all required fields present with correct types, no undefined required fields
    - **Validates: Requirements 12.2**

- [x] 6. Shared UI components
  - [x] 6.1 Implement Card component with NativeWind styling
    - Create `components/ui/Card.tsx` accepting children, style, and onPress props
    - Style with border-radius, padding, shadow using Color_Palette tokens via NativeWind classes
    - _Requirements: 7.1_

  - [x] 6.2 Implement Badge component with category-to-color mapping
    - Create `components/ui/Badge.tsx` accepting label, category, and size props
    - Map each distinct category to a visually distinct color from Color_Palette
    - _Requirements: 7.2_

  - [ ]* 6.3 Write property tests for Badge category-to-color mapping
    - **Property 7: Badge category-to-color mapping consistency**
    - Use fast-check to verify same category always produces same color and distinct categories map to distinct colors
    - **Validates: Requirements 7.2**

  - [x] 6.4 Implement FilterPill component with toggle behavior
    - Create `components/ui/FilterPill.tsx` accepting label, active, and onChange props
    - Render tappable pill with distinct active/inactive visual states
    - On tap: toggle active state and invoke onChange with new value
    - _Requirements: 7.3, 7.4_

  - [ ]* 6.5 Write property tests for FilterPill toggle behavior
    - **Property 8: FilterPill toggle behavior**
    - Use fast-check to generate random initial boolean states
    - Verify tap results in logical negation and onChange is called exactly once with new value
    - **Validates: Requirements 7.4**

  - [x] 6.6 Create barrel export in components/ui/index.ts
    - Export Card, Badge, and FilterPill from `components/ui/index.ts`
    - _Requirements: 7.5_

- [x] 7. Root layout and authentication screens
  - [x] 7.1 Implement root layout with Clerk provider and auth routing
    - Create `app/_layout.tsx` with ClerkProvider wrapping the app
    - Pass token-cache to ClerkProvider for SecureStore persistence
    - Conditionally route: unauthenticated → (auth) group, authenticated → (tabs) group
    - _Requirements: 1.1, 1.2, 1.9_

  - [x] 7.2 Implement auth stack layout (headerless)
    - Create `app/(auth)/_layout.tsx` as a Stack with `headerShown: false`
    - _Requirements: 1.3_

  - [x] 7.3 Implement sign-in screen
    - Create `app/(auth)/sign-in.tsx` with email/password form
    - On valid submit: call Clerk signIn, establish session, route to tabs
    - On invalid credentials: display error message, remain on screen
    - On network error: display connection failure message, preserve form data
    - Include navigation link to sign-up screen
    - _Requirements: 1.4, 1.5, 1.11_

  - [x] 7.4 Implement sign-up screen with email verification
    - Create `app/(auth)/sign-up.tsx` with email/password form (min 8 chars)
    - On valid submit: create account via Clerk, send verification email
    - Handle email verification completion: activate account, route to tabs
    - Display error for duplicate email addresses
    - On network error: preserve form data and show connection error
    - _Requirements: 1.6, 1.7, 1.8, 1.10, 1.11_

- [x] 8. Tab navigator and main screens
  - [x] 8.1 Implement tab navigator layout
    - Create `app/(tabs)/_layout.tsx` with three tabs: Home, Discover, TNR (left to right)
    - Style active/inactive tab distinction
    - Default to Home tab on authenticated session
    - Tab bar remains visible on all tab screens
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 8.2 Implement Profile screen
    - Create `app/profile.tsx` as a modal screen
    - Display user name, email, profile image from Clerk session
    - Include sign-out action that clears session and routes to auth stack
    - Handle data load failure with error message and retry action
    - Include dismiss control to return to previous tab
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 8.3 Implement Home feed screen with pull-to-refresh
    - Create `app/(tabs)/home.tsx` with scrollable event card list
    - Render each event using Card component, ordered by most recent first
    - Implement pull-to-refresh to fetch latest events
    - Display max 20 events per batch
    - Handle error state with retry action and empty state message
    - Tap event card navigates to detail/update thread view
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 8.4 Write property tests for event feed ordering and pagination
    - **Property 1: Event feed ordering and pagination**
    - Use fast-check to generate random arrays of Event objects with varying createdAt
    - Verify result is sorted by most recent first and contains at most 20 items per batch
    - **Validates: Requirements 4.1**

  - [x] 8.5 Implement Discover screen with card feed and map toggle
    - Create `app/(tabs)/discover.tsx` with scrollable card feed showing large image, title, org info
    - Implement toggle between card feed view and map view (using @rnmapbox/maps)
    - Render FilterPill components for category filtering
    - Map view: show tappable pins, use Location_Hook to center on user location if permitted
    - Default regional view if location denied
    - Preserve filter selections across view toggles
    - Display empty state when no results match filters
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

  - [ ]* 8.6 Write property tests for filter preservation and correctness
    - **Property 2: Filter preservation across view toggle**
    - **Property 3: Filter correctness**
    - Use fast-check to generate random filter selections and toggle sequences
    - Verify filters are preserved across toggles and only matching items appear in results
    - **Validates: Requirements 5.4, 5.5**

  - [x] 8.7 Implement TNR report form
    - Create `app/(tabs)/tnr.tsx` with report submission form
    - Collect required fields: location (pre-populated via useLocation or manual entry), cat description (max 500 chars), activity type (Trapped/Neutered/Returned/Feeding/Sighting)
    - Validate required fields with inline error messages
    - On valid submit: persist to TNR store, send via API_Client, show success
    - On API failure: show error, preserve all form data for retry
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ]* 8.8 Write property tests for TNR form validation
    - **Property 4: TNR description length validation**
    - **Property 5: TNR required field validation**
    - **Property 6: TNR form data preservation on failure**
    - Use fast-check to generate random strings (0-1000 length), random subsets of empty fields, and valid form states with simulated failures
    - Verify: >500 chars rejected, 1-500 accepted; one error per missing field; all fields unchanged on failure
    - **Validates: Requirements 6.2, 6.4, 6.6**

- [x] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Integration wiring and fallback behavior
  - [x] 10.1 Wire API client fallback to mock data
    - Update Home feed, Discover screen, and stores to fall back to mock data when API_Client fails
    - _Requirements: 12.3_

  - [x] 10.2 Wire profile navigation element across all tabs
    - Add top-left profile avatar/button to tab screens that navigates to Profile modal
    - Ensure it remains visible on all tabs
    - _Requirements: 2.1, 2.3_

  - [x] 10.3 Wire Zustand stores to consuming screens
    - Connect auth store to root layout for session-driven routing
    - Connect feeder store to Discover screen
    - Connect TNR store to TNR form screen
    - Connect badge store to Profile screen
    - Ensure reactive updates without manual refresh
    - _Requirements: 9.6_

- [x] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document using fast-check with 100+ iterations
- Unit tests validate specific examples and edge cases
- Mock data files enable full UI development without a live backend
- The API client auth interceptor handles token refresh transparently
- All NativeWind styles reference Color_Palette tokens — no hardcoded colors

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4"] },
    { "id": 2, "tasks": ["2.1", "2.5", "5.1"] },
    { "id": 3, "tasks": ["2.2", "3.1", "3.3", "3.5", "3.6"] },
    { "id": 4, "tasks": ["2.3", "2.4", "3.2", "3.4", "3.7", "3.8", "5.2"] },
    { "id": 5, "tasks": ["6.1", "6.2", "6.4"] },
    { "id": 6, "tasks": ["6.3", "6.5", "6.6"] },
    { "id": 7, "tasks": ["7.1", "7.2"] },
    { "id": 8, "tasks": ["7.3", "7.4", "8.1"] },
    { "id": 9, "tasks": ["8.2", "8.3", "8.5", "8.7"] },
    { "id": 10, "tasks": ["8.4", "8.6", "8.8"] },
    { "id": 11, "tasks": ["10.1", "10.2", "10.3"] }
  ]
}
```
