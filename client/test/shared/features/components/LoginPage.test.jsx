import React from "react";
import { render, screen } from "@testing-library/react";
import LoginPage from "@/features/auth/components/LoginPage";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/store/auth.slice";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";

jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children }) => <div>{children}</div>,
    },
}));


describe("LoginPage", () => {
    const renderWithProviders = (ui, { preloadedState } = {}) => {
        const defaultState = {
            auth: {
                user: null,
                isAuthenticated: false,
                error: null,
                isLoading: false,
            },
        };

        const store = configureStore({
            reducer: { auth: authReducer },
            preloadedState: {
                ...defaultState,
                ...preloadedState,
                auth: {
                    ...defaultState.auth,
                    ...(preloadedState?.auth || {}),
                },
            },
        });

        return render(
            <Provider store={store}>
                <MemoryRouter>{ui}</MemoryRouter>
            </Provider>
        );
    };

    it("renders the login page", () => {
        renderWithProviders(<LoginPage />);
        expect(screen.getByText("Login Identity")).toBeInTheDocument();
    });

    it("renders error message", async () => {
        renderWithProviders(<LoginPage />, {
            preloadedState: {
                auth: {
                    error: "Invalid credentials",
                },
            },
        });

        expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
        // screen.logTestingPlaygroundURL();
        // console.log(screen)
        // expect(screen.getByText(/invalid credentials/i)).toBeVisible();
    });
});
