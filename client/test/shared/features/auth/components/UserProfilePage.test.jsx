import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider, useDispatch } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import UserProfilePage from "@/features/auth/components/UserProfilePage";

import toast from "react-hot-toast";
import authService from "@/features/auth/api/auth.api";
import { updateProfile, changePassword } from "@/features/auth/store/auth.slice";
import { createThumbnail } from "@/shared/utils/image.utils";


// ✅ MOCKS

jest.mock('@/assets/avatar.png', () => 'avatar.png');

jest.mock("date-fns", () => ({
    format: jest.fn(() => "Jan 01, 2022"),
}));


jest.mock("react-hot-toast", () => ({
    __esModule: true,
    default: {
        success: jest.fn(),
        error: jest.fn(),
        loading: jest.fn(() => "toast-id"),
        dismiss: jest.fn(),
    },
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

global.URL.createObjectURL = jest.fn();
global.fetch = jest.fn();

const mockDispatch = jest.fn((thunk) => thunk());

jest.mock("react-redux", () => ({
    ...jest.requireActual("react-redux"),
    useDispatch: () => mockDispatch,
}));


const makeStore = (authOverrides = {}) =>
    configureStore({
        reducer: {
            auth: () => ({
                user: {
                    fullName: "John Doe",
                    username: "johndoe",
                    email: "john@example.com",
                    avatarUrl: "avatar.png",
                    createdAt: "2022-01-01T00:00:00.000Z",
                },
                loading: false,
                error: null,
                isAuthenticated: false,
                ...authOverrides,
            }),
        },
    });

const renderUserProfilePage = () => {
    const store = makeStore();
    return render(
        <Provider store={store}>
            <UserProfilePage />
        </Provider>
    );
};


// ================= TESTS =================

describe("UserProfilePage actions", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("updates profile avatar successfully", async () => {

        // ✅ Mock thumbnail
        createThumbnail.mockResolvedValue(
            new Blob(["mock"], { type: "image/webp" })
        );

        // ✅ Mock API
        authService.getAvatarUploadUrl.mockResolvedValue({
            uploadUrl: "http://upload.com",
            storageKey: "key",
            bucket: "bucket",
        });

        global.fetch.mockResolvedValue({ ok: true });

        global.URL.createObjectURL.mockReturnValue("mock-url");

        renderUserProfilePage();

        const file = new File(["avatar"], "avatar.png", {
            type: "image/png",
        });

        const input = document.querySelector('input[type="file"]');

        fireEvent.change(input, {
            target: { files: [file] },
        });

        // ✅ Wait full async chain
        await waitFor(() => {
            expect(createThumbnail).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(authService.getAvatarUploadUrl).toHaveBeenCalledWith("avatar.png");
        });

        await waitFor(() => {
            expect(updateProfile).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalled();
        });
    });
});