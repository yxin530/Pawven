import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";

// Mock dependencies
const mockCreate = jest.fn();
const mockPrepareEmailAddressVerification = jest.fn();
const mockAttemptEmailAddressVerification = jest.fn();
const mockSetActive = jest.fn();

jest.mock("@clerk/clerk-expo", () => ({
  useSignUp: () => ({
    signUp: {
      create: mockCreate,
      prepareEmailAddressVerification: mockPrepareEmailAddressVerification,
      attemptEmailAddressVerification: mockAttemptEmailAddressVerification,
    },
    setActive: mockSetActive,
    isLoaded: true,
  }),
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: jest.fn() }),
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

// Import after mocks
import SignUpScreen from "../../app/(auth)/sign-up";

describe("SignUpScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the registration form by default", () => {
    const { getByPlaceholderText, getByText } = render(<SignUpScreen />);

    expect(getByText("Pawven")).toBeTruthy();
    expect(getByText("Create your account")).toBeTruthy();
    expect(getByPlaceholderText("Enter your email")).toBeTruthy();
    expect(getByPlaceholderText("Minimum 8 characters")).toBeTruthy();
    expect(getByText("Sign Up")).toBeTruthy();
    expect(getByText("Sign In")).toBeTruthy();
  });

  it("shows error when password is less than 8 characters", async () => {
    const { getByPlaceholderText, getByText } = render(<SignUpScreen />);

    fireEvent.changeText(getByPlaceholderText("Enter your email"), "test@example.com");
    fireEvent.changeText(getByPlaceholderText("Minimum 8 characters"), "short");
    fireEvent.press(getByText("Sign Up"));

    await waitFor(() => {
      expect(getByText("Password must be at least 8 characters.")).toBeTruthy();
    });

    // Should not call Clerk
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("calls Clerk signUp.create and prepareEmailAddressVerification on valid submit", async () => {
    mockCreate.mockResolvedValueOnce({});
    mockPrepareEmailAddressVerification.mockResolvedValueOnce({});

    const { getByPlaceholderText, getByText } = render(<SignUpScreen />);

    fireEvent.changeText(getByPlaceholderText("Enter your email"), "user@test.com");
    fireEvent.changeText(getByPlaceholderText("Minimum 8 characters"), "password123");
    fireEvent.press(getByText("Sign Up"));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        emailAddress: "user@test.com",
        password: "password123",
      });
      expect(mockPrepareEmailAddressVerification).toHaveBeenCalledWith({
        strategy: "email_code",
      });
    });
  });

  it("shows verification form after successful registration", async () => {
    mockCreate.mockResolvedValueOnce({});
    mockPrepareEmailAddressVerification.mockResolvedValueOnce({});

    const { getByPlaceholderText, getByText } = render(<SignUpScreen />);

    fireEvent.changeText(getByPlaceholderText("Enter your email"), "user@test.com");
    fireEvent.changeText(getByPlaceholderText("Minimum 8 characters"), "password123");
    fireEvent.press(getByText("Sign Up"));

    await waitFor(() => {
      expect(getByText("Verify your email")).toBeTruthy();
      expect(getByText("user@test.com")).toBeTruthy();
      expect(getByPlaceholderText("Enter code")).toBeTruthy();
      expect(getByText("Verify Email")).toBeTruthy();
    });
  });

  it("displays error for duplicate email addresses", async () => {
    mockCreate.mockRejectedValueOnce({
      errors: [{ message: "Email already taken", code: "form_identifier_exists" }],
    });

    const { getByPlaceholderText, getByText } = render(<SignUpScreen />);

    fireEvent.changeText(getByPlaceholderText("Enter your email"), "existing@test.com");
    fireEvent.changeText(getByPlaceholderText("Minimum 8 characters"), "password123");
    fireEvent.press(getByText("Sign Up"));

    await waitFor(() => {
      expect(
        getByText("This email is already registered. Please sign in or use a different email.")
      ).toBeTruthy();
    });
  });

  it("shows connection error on network failure and preserves form data", async () => {
    mockCreate.mockRejectedValueOnce(new Error("Network request failed"));

    const { getByPlaceholderText, getByText, getByDisplayValue } = render(<SignUpScreen />);

    fireEvent.changeText(getByPlaceholderText("Enter your email"), "user@test.com");
    fireEvent.changeText(getByPlaceholderText("Minimum 8 characters"), "password123");
    fireEvent.press(getByText("Sign Up"));

    await waitFor(() => {
      expect(
        getByText("Connection failed. Please check your internet and try again.")
      ).toBeTruthy();
    });

    // Form data should be preserved
    expect(getByDisplayValue("user@test.com")).toBeTruthy();
    expect(getByDisplayValue("password123")).toBeTruthy();
  });

  it("activates session after successful email verification", async () => {
    // First, go through registration phase
    mockCreate.mockResolvedValueOnce({});
    mockPrepareEmailAddressVerification.mockResolvedValueOnce({});

    const { getByPlaceholderText, getByText } = render(<SignUpScreen />);

    fireEvent.changeText(getByPlaceholderText("Enter your email"), "user@test.com");
    fireEvent.changeText(getByPlaceholderText("Minimum 8 characters"), "password123");
    fireEvent.press(getByText("Sign Up"));

    await waitFor(() => {
      expect(getByText("Verify your email")).toBeTruthy();
    });

    // Now verify email
    mockAttemptEmailAddressVerification.mockResolvedValueOnce({
      status: "complete",
      createdSessionId: "session_123",
    });

    fireEvent.changeText(getByPlaceholderText("Enter code"), "123456");
    fireEvent.press(getByText("Verify Email"));

    await waitFor(() => {
      expect(mockAttemptEmailAddressVerification).toHaveBeenCalledWith({
        code: "123456",
      });
      expect(mockSetActive).toHaveBeenCalledWith({ session: "session_123" });
    });
  });

  it("allows going back to registration from verification phase", async () => {
    mockCreate.mockResolvedValueOnce({});
    mockPrepareEmailAddressVerification.mockResolvedValueOnce({});

    const { getByPlaceholderText, getByText } = render(<SignUpScreen />);

    fireEvent.changeText(getByPlaceholderText("Enter your email"), "user@test.com");
    fireEvent.changeText(getByPlaceholderText("Minimum 8 characters"), "password123");
    fireEvent.press(getByText("Sign Up"));

    await waitFor(() => {
      expect(getByText("Verify your email")).toBeTruthy();
    });

    fireEvent.press(getByText("← Back to registration"));

    await waitFor(() => {
      expect(getByText("Create your account")).toBeTruthy();
    });
  });
});
