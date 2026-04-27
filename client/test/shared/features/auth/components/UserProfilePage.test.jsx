import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import UserProfilePage from "@/features/auth/components/UserProfilePage";
// import toast from "react-hot-toast";
import authService from "@/features/auth/api/auth.api";
import { updateProfile, changePassword } from "@/features/auth/store/auth.slice";
import { createThumbnail } from "@/shared/utils/image.utils";

// Mocking dependencies
jest.mock("@/assets/avatar.png", () => "avatar.png");

jest.mock("date-fns", () => ({
  format: jest.fn(() => "Jan 01, 2022"),
}));

jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
  loading: jest.fn(() => "toast-id"),
  dismiss: jest.fn(),
}));

jest.mock("@/features/auth/api/auth.api", () => ({
  __esModule: true,
  default: {
    getAvatarUploadUrl: jest.fn(),
  },
}));

jest.mock("@/features/auth/store/auth.slice", () => ({
  updateProfile: jest.fn(),
  changePassword: jest.fn(),
}));

jest.mock("@/shared/utils/image.utils", () => ({
  createThumbnail: jest.fn(),
}));

// Mock Global APIs
global.URL.createObjectURL = jest.fn(() => "mock-url");
global.fetch = jest.fn();

const makeStore = (authOverrides = {}) =>
  configureStore({
    reducer: {
      auth: () => ({
        user: {
          id: "1",
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          username: "johndoe",
          avatar: null,
          ...authOverrides,
        },
        loading: false,
      }),
    },
  });

const renderUserProfilePage = (authState = {}) => {
  const store = makeStore(authState);
  return render(
    <Provider store={store}>
      <UserProfilePage />
    </Provider>,
  );
};

describe("UserProfilePage Rendering", () => {
  test("renders headings", () => {
    renderUserProfilePage();
    expect(screen.getByText(/account settings/i)).toBeInTheDocument();
    expect(
      screen.getByText(/manage your profile information and security settings/i),
    ).toBeInTheDocument();
  });

  test("renders form fields", () => {
    renderUserProfilePage();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toHaveAttribute("readOnly");
    expect(screen.getByLabelText(/username/i)).toHaveAttribute("readOnly");
  });
});

describe("UserProfilePage Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockThunkSuccess = () => ({
    unwrap: jest.fn().mockResolvedValue({}),
  });

  it("updates password successfully", async () => {
    changePassword.mockReturnValue(mockThunkSuccess());

    renderUserProfilePage();

    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: "oldPassword" },
    });
    fireEvent.change(screen.getByLabelText(/^new password$/i), {
      target: { value: "newPassword123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: "newPassword123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /update password/i }));

    await waitFor(() => {
      expect(changePassword).toHaveBeenCalledWith({
        currentPassword: "oldPassword",
        newPassword: "newPassword123",
      });
    });

    // await waitFor(() => {
    //     expect(toast.success).toHaveBeenCalled();
    // });
  });

  it("shows error for short password", async () => {
    renderUserProfilePage();

    fireEvent.change(screen.getByLabelText(/^new password$/i), { target: { value: "short" } });
    fireEvent.click(screen.getByRole("button", { name: /update password/i }));

    expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    expect(changePassword).not.toHaveBeenCalled();
  });

  it("shows error for password mismatch", async () => {
    renderUserProfilePage();

    fireEvent.change(screen.getByLabelText(/^new password$/i), {
      target: { value: "newPassword123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: "mismatch" },
    });
    fireEvent.click(screen.getByRole("button", { name: /update password/i }));

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    expect(changePassword).not.toHaveBeenCalled();
  });

  it("updates profile avatar successfully", async () => {
    updateProfile.mockReturnValue(mockThunkSuccess());
    createThumbnail.mockResolvedValue(new Blob(["mock-blob"]));
    authService.getAvatarUploadUrl.mockResolvedValue({
      uploadUrl: "http://upload.com",
      storageKey: "key",
      bucket: "bucket",
    });
    global.fetch.mockResolvedValue({ ok: true });

    renderUserProfilePage();

    const file = new File(["avatar"], "avatar.png", { type: "image/png" });
    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(createThumbnail).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(authService.getAvatarUploadUrl).toHaveBeenCalledWith("avatar.png");
    });

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalled();
    });

    // await waitFor(() => {
    //     expect(toast.success).toHaveBeenCalled();
    // });
  });
});
