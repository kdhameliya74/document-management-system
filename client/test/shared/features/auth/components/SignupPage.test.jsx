import React from "react";
import { render, screen } from "@testing-library/react";
import SignupPage from "@/features/auth/components/SignupPage.jsx";
import ROUTES from "@/shared/utils/routes.js";
import { signup } from "@/features/auth/store/auth.slice.js";
import { configureStore } from "@reduxjs/toolkit";
import userEvent from "@testing-library/user-event/dist/cjs/index.js";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";

jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

jest.mock("@/features/auth/store/auth.slice.js", () => ({
  signup: jest.fn(() => ({ type: "auth/signup" })),
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

const renderSignupPage = (authState = {}) => {
  const store = makeStore(authState);
  return {
    store,
    user: userEvent.setup(),
    ...render(
      <Provider store={store}>
        <MemoryRouter>
          <SignupPage />
        </MemoryRouter>
      </Provider>,
    ),
  };
};

describe("SignupPage", () => {
  it("renders the page heading", () => {
    renderSignupPage();
    expect(screen.getByText(/create account/i)).toBeInTheDocument();
  });

  it("renders the sub heading", () => {
    renderSignupPage();
    expect(screen.getByText(/Join the secure document ecosystem/i)).toBeInTheDocument();
  });
});

describe("Signup Form", () => {
  it("renders the form", () => {
    renderSignupPage();
    const form = screen.getByRole("form", { name: /signup form/i });
    expect(form).toBeInTheDocument();
  });

  it("updates field values on change", async () => {
    const { user } = renderSignupPage();
    const firstNameInput = screen.getByPlaceholderText("John");
    const lastNameInput = screen.getByPlaceholderText("Doe");

    await user.type(firstNameInput, "Jane");
    await user.type(lastNameInput, "Smith");

    expect(firstNameInput.value).toBe("Jane");
    expect(lastNameInput.value).toBe("Smith");
  });

  it("shows error if username contains special characters", async () => {
    const { user } = renderSignupPage();

    await user.type(screen.getByPlaceholderText("John"), "John");
    await user.type(screen.getByPlaceholderText("Doe"), "Doe");
    await user.type(screen.getByPlaceholderText("johndoe_99"), "user@name");
    await user.type(screen.getByPlaceholderText("john@example.com"), "john@example.com");
    await user.type(screen.getAllByPlaceholderText(/••••••••/i)[0], "password123");
    await user.type(screen.getAllByPlaceholderText(/••••••••/i)[1], "password456");
    await user.click(screen.getByRole("button", { name: /construct account/i }));

    expect(
      screen.getByText(/username can only contain letters, numbers, and underscores/i),
    ).toBeInTheDocument();
  });

  it("shows error if passwords do not match", async () => {
    const { user } = renderSignupPage();

    await user.type(screen.getByPlaceholderText("John"), "John");
    await user.type(screen.getByPlaceholderText("Doe"), "Doe");
    await user.type(screen.getByPlaceholderText("johndoe_99"), "johndoe");
    await user.type(screen.getByPlaceholderText("john@example.com"), "john@example.com");
    await user.type(screen.getAllByPlaceholderText(/••••••••/i)[0], "password123");
    await user.type(screen.getAllByPlaceholderText(/••••••••/i)[1], "password456");
    await user.click(screen.getByRole("button", { name: /construct account/i }));
    expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
  });

  it("shows error if password is too short", async () => {
    const { user } = renderSignupPage();

    await user.type(screen.getByPlaceholderText("John"), "John");
    await user.type(screen.getByPlaceholderText("Doe"), "Doe");
    await user.type(screen.getByPlaceholderText("johndoe_99"), "johndoe");
    await user.type(screen.getByPlaceholderText("john@example.com"), "john@example.com");
    await user.type(screen.getAllByPlaceholderText(/••••••••/i)[0], "short");
    await user.type(screen.getAllByPlaceholderText(/••••••••/i)[1], "short");

    await user.click(screen.getByRole("button", { name: /construct account/i }));

    expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
  });

  it("dispatches signup action on valid form submission", async () => {
    const { user } = renderSignupPage();

    await user.type(screen.getByPlaceholderText("John"), "John");
    await user.type(screen.getByPlaceholderText("Doe"), "Doe");
    await user.type(screen.getByPlaceholderText("johndoe_99"), "johndoe");
    await user.type(screen.getByPlaceholderText("john@example.com"), "john@example.com");
    await user.type(screen.getAllByPlaceholderText(/••••••••/i)[0], "password123");
    await user.type(screen.getAllByPlaceholderText(/••••••••/i)[1], "password123");

    await user.click(screen.getByRole("button", { name: /construct account/i }));

    expect(signup).toHaveBeenCalledWith({
      firstName: "John",
      lastName: "Doe",
      username: "johndoe",
      email: "john@example.com",
      password: "password123",
    });
  });

  it("displays server-side error message", () => {
    const serverError = "Email already exists";
    renderSignupPage({ error: serverError });

    expect(screen.getByText(serverError)).toBeInTheDocument();
  });

  it("redirects to home if already authenticated", () => {
    renderSignupPage({ isAuthenticated: true });
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.APP.ROOT);
  });

  it("clears error and dispatches signup after fixing validation issues", async () => {
    const { user } = renderSignupPage();

    // 1. Fill all required fields but with mismatching passwords
    await user.type(screen.getByPlaceholderText("John"), "John");
    await user.type(screen.getByPlaceholderText("Doe"), "Doe");
    await user.type(screen.getByPlaceholderText("john@example.com"), "john@example.com");
    await user.type(screen.getByPlaceholderText("johndoe_99"), "johndoe");
    await user.type(screen.getAllByPlaceholderText(/••••••••/i)[0], "password123");
    await user.type(screen.getAllByPlaceholderText(/••••••••/i)[1], "wrongpassword");
    await user.click(screen.getByRole("button", { name: /construct account/i }));

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();

    await user.clear(screen.getAllByPlaceholderText(/••••••••/i)[1]);
    await user.type(screen.getAllByPlaceholderText(/••••••••/i)[1], "password123");

    expect(screen.queryByText(/passwords do not match/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /construct account/i }));

    expect(signup).toHaveBeenCalled();
  });
});
