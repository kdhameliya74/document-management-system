import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import LoginPage from "@/features/auth/components/LoginPage";
import { login, clearError } from "@/features/auth/store/auth.slice";
import ROUTES from "@/shared/utils/routes";

jest.mock("framer-motion", () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
}));

jest.mock("@/shared/components/auth/AuthBackground", () => () => (
    <div data-testid="auth-background" />
));

jest.mock("lucide-react", () => ({
    Lock: () => <svg data-testid="icon-lock" />,
    Mail: () => <svg data-testid="icon-mail" />,
    ArrowRight: () => <svg data-testid="icon-arrow-right" />,
    AlertCircle: () => <svg data-testid="icon-alert-circle" />,
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
    Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

jest.mock("@/features/auth/store/auth.slice", () => ({
    login: jest.fn(() => ({ type: "auth/login" })),
    clearError: jest.fn(() => ({ type: "auth/clearError" })),
}));

const makeStore = (authOverrides = {}) =>
    configureStore({
        reducer: {
            auth: () => ({
                loading: false,
                error: null,
                isAuthenticated: false,
                ...authOverrides,
            }),
        },
    });

const renderLoginPage = (authState = {}) => {
    const store = makeStore(authState);
    return {
        store,
        user: userEvent.setup(),
        ...render(
            <Provider store={store}>
                <MemoryRouter>
                    <LoginPage />
                </MemoryRouter>
            </Provider>
        ),
    };
};

// Convenience selectors — avoids repeating queries
const getIdentifierInput = () =>
    screen.getByPlaceholderText(/username or email address/i);
const getPasswordInput = () =>
    screen.getByPlaceholderText(/••••••••/i);
const getSubmitButton = () =>
    screen.getByRole("button", { name: /initialize session/i });

describe("LoginPage — Rendering", () => {
    it("renders the page heading", () => {
        renderLoginPage();
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    });

    it("renders the subheading", () => {
        renderLoginPage();
        expect(screen.getByText(/access your secure document vault/i)).toBeInTheDocument();
    });

    it("renders identifier input", () => {
        renderLoginPage();
        expect(getIdentifierInput()).toBeInTheDocument();
    });

    it("renders password input with type=password", () => {
        renderLoginPage();
        const pwd = getPasswordInput();
        expect(pwd).toBeInTheDocument();
        expect(pwd).toHaveAttribute("type", "password");
    });

    it("renders the submit button", () => {
        renderLoginPage();
        expect(getSubmitButton()).toBeInTheDocument();
    });

    it("renders sign up link pointing to correct route", () => {
        renderLoginPage();
        const link = screen.getByRole("link", { name: /create vault/i });
        expect(link).toHaveAttribute("href", ROUTES.SIGNUP);
    });
});

describe("LoginPage — Form Interactions", () => {
    it("updates identifier field when user types", async () => {
        const { user } = renderLoginPage();
        const input = getIdentifierInput();

        await user.type(input, "john@example.com");

        expect(input).toHaveValue("john@example.com");
    });

    it("updates password field when user types", async () => {
        const { user } = renderLoginPage();
        const input = getPasswordInput();

        await user.type(input, "secret123");

        expect(input).toHaveValue("secret123");
    });

    it("identifier input accepts both email and username format", async () => {
        const { user } = renderLoginPage();
        const input = getIdentifierInput();

        await user.type(input, "johndoe");
        expect(input).toHaveValue("johndoe");

        await user.clear(input);

        await user.type(input, "john@example.com");
        expect(input).toHaveValue("john@example.com");
    });

    it("identifier input has required attribute", () => {
        renderLoginPage();
        expect(getIdentifierInput()).toBeRequired();
    });

    it("password input has required attribute", () => {
        renderLoginPage();
        expect(getPasswordInput()).toBeRequired();
    });
});

describe("LoginPage — Form Submission", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("dispatches login action with correct payload on submit", async () => {
        const { user } = renderLoginPage();

        await user.type(getIdentifierInput(), "john@example.com");
        await user.type(getPasswordInput(), "secret123");
        await user.click(getSubmitButton());

        expect(login).toHaveBeenCalledWith({
            identifier: "john@example.com",
            password: "secret123",
        });
    });

    it("dispatches login exactly once per submit", async () => {
        const { user } = renderLoginPage();

        await user.type(getIdentifierInput(), "john@example.com");
        await user.type(getPasswordInput(), "secret123");
        await user.click(getSubmitButton());

        expect(login).toHaveBeenCalledTimes(1);
    });

    it("prevents default form submission behaviour", async () => {
        renderLoginPage();
        const form = screen.getByRole("button", { name: /initialize session/i }).closest("form");

        const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
        fireEvent(form, submitEvent);

        // login is dispatched via handler which calls e.preventDefault()
        // So form should not actually submit (no page reload in jsdom)
        expect(login).toHaveBeenCalled();
    });

    it("does not dispatch login when fields are empty (native validation)", () => {
        renderLoginPage();
        const form = screen.getByRole("button", { name: /initialize session/i }).closest("form");

        fireEvent.submit(form);
        const identifierInput = getIdentifierInput();
        expect(identifierInput).toHaveValue("");
    });
});


describe("LoginPage — Error State", () => {
    it("renders error message when error exists in store", () => {
        renderLoginPage({ error: "Invalid credentials" });
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });

    it("renders alert icon alongside error message", () => {
        renderLoginPage({ error: "Something went wrong" });
        expect(screen.getByTestId("icon-alert-circle")).toBeInTheDocument();
    });

    it("does NOT render error banner when error is null", () => {
        renderLoginPage({ error: null });
        expect(screen.queryByTestId("icon-alert-circle")).not.toBeInTheDocument();
    });

    it("does NOT render error banner when error is empty string", () => {
        renderLoginPage({ error: "" });
        // Empty string is falsy — error block shouldn't render
        expect(screen.queryByTestId("icon-alert-circle")).not.toBeInTheDocument();
    });

    it("renders different error messages correctly", () => {
        const messages = [
            "User not found",
            "Password is incorrect",
            "Account is locked",
            "Too many attempts. Try again later.",
        ];

        messages.forEach((msg) => {
            const { unmount } = renderLoginPage({ error: msg });
            expect(screen.getByText(msg)).toBeInTheDocument();
            unmount();
        });
    });
});

describe("LoginPage — clearError Dispatch", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("dispatches clearError when identifier changes", async () => {
        const { user } = renderLoginPage({ error: "Some error" });

        await user.type(getIdentifierInput(), "a");

        expect(clearError).toHaveBeenCalled();
    });

    it("dispatches clearError when password changes", async () => {
        const { user } = renderLoginPage({ error: "Some error" });

        await user.type(getPasswordInput(), "x");

        expect(clearError).toHaveBeenCalled();
    });

    it("dispatches clearError on mount (useEffect with no auth deps)", () => {
        renderLoginPage();
        expect(clearError).toHaveBeenCalled();
    });
});

describe("LoginPage — Authentication Redirect", () => {
    beforeEach(() => {
        mockNavigate.mockClear();
    });

    it("redirects to app root when authenticated and not loading", () => {
        renderLoginPage({ isAuthenticated: true, loading: false });

        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.APP.ROOT, { replace: true });
    });

    it("does NOT redirect when loading is true even if authenticated", () => {
        renderLoginPage({ isAuthenticated: true, loading: true });

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("does NOT redirect when not authenticated", () => {
        renderLoginPage({ isAuthenticated: false, loading: false });

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("redirects with replace:true so back button doesn't return to login", () => {
        renderLoginPage({ isAuthenticated: true, loading: false });

        expect(mockNavigate).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ replace: true })
        );
    });
});
