import React from "react";
import Breadcrumb from "@/shared/components/dashboard/Breadcrumb";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import documentSystemReducer from "@/features/documents/store/documents.slice";
import { MemoryRouter } from "react-router-dom";
import { APP_VIEWS_MAP } from "@/shared/utils/constants";
import { HOME_ROUTES } from "@/shared/utils/routes";

const mockNavigate = jest.fn();

// Mock utilities
jest.mock("@/shared/utils/utils", () => ({
  truncateFolderName: jest.fn((name) => name),
}));

// Mock useNavigate
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Breadcrumb Component", () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        documentSystem: documentSystemReducer,
      },
      preloadedState: {
        documentSystem: {
          documents: {
            1: { id: "1", name: "Folder 1", parentId: null },
            2: { id: "2", name: "Subfolder 2", parentId: "1" },
          },
        },
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    store = null;
  });

  it("renders the breadcrumb crumbs based on the currentFolderId", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Breadcrumb mode={APP_VIEWS_MAP.FOLDERS} currentFolderId="2" />
        </MemoryRouter>
      </Provider>,
    );

    // Verify both Folder 1 and Subfolder 2 are rendered
    expect(screen.getByText("Folder 1")).toBeInTheDocument();
    expect(screen.getByText("Subfolder 2")).toBeInTheDocument();
  });

  it("renders the home button", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Breadcrumb mode={APP_VIEWS_MAP.FOLDERS} currentFolderId="1" />
        </MemoryRouter>
      </Provider>,
    );
    const homeButton = screen.getByRole("button", { name: "" });
    expect(homeButton).toBeInTheDocument();
  });

  it("navigates to the parent folder when a crumb is clicked", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Breadcrumb mode={APP_VIEWS_MAP.FOLDERS} currentFolderId="2" />
        </MemoryRouter>
      </Provider>,
    );
    const folderCrumb = screen.getByText("Subfolder 2");
    expect(folderCrumb).toBeInTheDocument();
    fireEvent.click(folderCrumb);
    expect(screen.getByText("Folder 1")).toBeInTheDocument();
  });

  it("navigates to the root when a home button is clicked", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Breadcrumb mode={APP_VIEWS_MAP.FOLDERS} currentFolderId="2" />
        </MemoryRouter>
      </Provider>,
    );
    const homeButton = screen.getByRole("button", { name: "" });
    fireEvent.click(homeButton);

    expect(mockNavigate).toHaveBeenCalledWith(HOME_ROUTES.ROOT);
  });
});
