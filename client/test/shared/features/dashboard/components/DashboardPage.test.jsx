// DashboardPage.test.jsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import DashboardPage from "@/features/dashboard/components/DashboardPage";
import { setCurrentFolder, clearUISelection } from "@/features/documents/store/documents.slice";
import { APP_VIEWS_MAP } from "@/shared/utils/constants";

jest.mock("@/shared/components/layout/Sidebar", () => () => <div data-testid="sidebar" />);
jest.mock("@/shared/components/layout/Header", () => () => <div data-testid="header" />);
jest.mock("@/shared/components/dashboard/FolderView", () => () => (
  <div data-testid="folder-view" />
));
jest.mock("@/shared/components/dashboard/RightSidebar", () => () => (
  <div data-testid="right-sidebar" />
));
jest.mock("@/features/documents/components/TrashPage", () => () => (
  <div data-testid="trash-page" />
));
jest.mock("@/features/documents/components/SharePage", () => () => (
  <div data-testid="share-page" />
));
jest.mock("@/features/auth/components/UserProfilePage", () => () => (
  <div data-testid="user-profile-page" />
));
jest.mock("@/shared/components/PageNotFound", () => () => <div data-testid="page-not-found" />);
jest.mock("@/shared/components/modals/ModalManager", () => () => (
  <div data-testid="modal-manager" />
));

jest.mock("@/features/documents/store/documents.slice", () => ({
  setCurrentFolder: jest.fn((payload) => ({ type: "documents/setCurrentFolder", payload })),
  clearUISelection: jest.fn(() => ({ type: "documents/clearUISelection" })),
}));

const createMockStore = (initialState = {}) =>
  configureStore({
    reducer: {
      documentSystem: (state = initialState) => state,
    },
  });

const renderWithRouter = (
  ui,
  { initialEntries = ["/app/folders"], store = createMockStore() } = {},
) => {
  const utils = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/app/*" element={ui} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
  return { ...utils, store };
};

describe("DashboardPage Component Analysis", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Component Structure & Layout", () => {
    it("renders Sidebar component", () => {
      renderWithRouter(<DashboardPage />);
      expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    });

    it("renders Header component", () => {
      renderWithRouter(<DashboardPage />);
      expect(screen.getByTestId("header")).toBeInTheDocument();
    });

    it("renders RightSidebar component", () => {
      renderWithRouter(<DashboardPage />);
      expect(screen.getByTestId("right-sidebar")).toBeInTheDocument();
    });

    it("renders ModalManager component", () => {
      renderWithRouter(<DashboardPage />);
      expect(screen.getByTestId("modal-manager")).toBeInTheDocument();
    });
  });

  describe("Routing Behavior", () => {
    it("redirects root path '/' to FOLDERS route", async () => {
      renderWithRouter(<DashboardPage />, { initialEntries: ["/app"] });

      await waitFor(() => {
        expect(screen.getByTestId("folder-view")).toBeInTheDocument();
      });
    });

    it("renders FolderView at FOLDERS route", () => {
      renderWithRouter(<DashboardPage />, {
        initialEntries: ["/app/folders"],
      });
      expect(screen.getByTestId("folder-view")).toBeInTheDocument();
    });

    it("renders TrashPage at TRASH route", () => {
      renderWithRouter(<DashboardPage />, {
        initialEntries: ["/app/trash"],
      });
      expect(screen.getByTestId("trash-page")).toBeInTheDocument();
    });

    it("renders SharePage at SHARED route", () => {
      renderWithRouter(<DashboardPage />, {
        initialEntries: ["/app/shared"],
      });
      expect(screen.getByTestId("share-page")).toBeInTheDocument();
    });

    it("renders UserProfilePage at PROFILE route", () => {
      renderWithRouter(<DashboardPage />, {
        initialEntries: ["/app/profile"],
      });
      expect(screen.getByTestId("user-profile-page")).toBeInTheDocument();
    });

    it("renders PageNotFound for unknown routes", () => {
      renderWithRouter(<DashboardPage />, {
        initialEntries: ["/app/unknown-route"],
      });
      expect(screen.getByTestId("page-not-found")).toBeInTheDocument();
    });

    it("renders PageNotFound for wildcard routes", () => {
      renderWithRouter(<DashboardPage />, {
        initialEntries: ["/app/any/random/path"],
      });
      expect(screen.getByTestId("page-not-found")).toBeInTheDocument();
    });
  });

  describe("URL-Based Folder State Management", () => {
    it("dispatches setCurrentFolder when navigating to FOLDERS route", () => {
      renderWithRouter(<DashboardPage />, {
        initialEntries: ["/app/folders"],
      });

      const type = "folders";
      expect(setCurrentFolder).toHaveBeenCalledWith(APP_VIEWS_MAP[type.toUpperCase()]);
    });

    it("dispatches setCurrentFolder when navigating to TRASH route", () => {
      renderWithRouter(<DashboardPage />, {
        initialEntries: ["/app/trash"],
      });

      const type = "trash";
      expect(setCurrentFolder).toHaveBeenCalledWith(APP_VIEWS_MAP[type.toUpperCase()]);
    });

    it("dispatches setCurrentFolder when navigating to SHARED route", () => {
      renderWithRouter(<DashboardPage />, {
        initialEntries: ["/app/shared"],
      });

      const type = "shared";
      expect(setCurrentFolder).toHaveBeenCalledWith(APP_VIEWS_MAP[type.toUpperCase()]);
    });

    it("dispatches setCurrentFolder when navigating to PROFILE route", () => {
      renderWithRouter(<DashboardPage />, {
        initialEntries: ["/app/profile"],
      });

      const type = "profile";
      expect(setCurrentFolder).toHaveBeenCalledWith(APP_VIEWS_MAP[type.toUpperCase()]);
    });
  });

  describe("4. Outside Click Handler Behavior", () => {
    const getScrollableArea = () => document.querySelector(".flex-1.overflow-y-auto");

    it("clears UI selection when showDetails is true and no modal is active", () => {
      const store = createMockStore({
        showDetails: true,
        activeModal: null,
        selectedId: null,
      });

      renderWithRouter(<DashboardPage />, {
        initialEntries: ["/app/folders"],
        store,
      });

      fireEvent.click(getScrollableArea());
      expect(clearUISelection).toHaveBeenCalledTimes(1);
    });

    it("clears UI selection when selectedId is set and no modal is active", () => {
      const store = createMockStore({
        showDetails: false,
        activeModal: null,
        selectedId: "doc-123",
      });

      renderWithRouter(<DashboardPage />, {
        initialEntries: ["/app/folders"],
        store,
      });

      fireEvent.click(getScrollableArea());
      expect(clearUISelection).toHaveBeenCalledTimes(1);
    });

    it("does not clear UI selection when a modal is active (regardless of other state)", () => {
      const store = createMockStore({
        showDetails: true,
        activeModal: "SOME_MODAL",
        selectedId: "doc-123",
      });

      renderWithRouter(<DashboardPage />, {
        initialEntries: ["/app/folders"],
        store,
      });

      fireEvent.click(getScrollableArea());
      expect(clearUISelection).not.toHaveBeenCalled();
    });

    it("does not clear UI selection when both showDetails and selectedId are false", () => {
      const store = createMockStore({
        showDetails: false,
        activeModal: null,
        selectedId: null,
      });

      renderWithRouter(<DashboardPage />, {
        initialEntries: ["/app/folders"],
        store,
      });

      fireEvent.click(getScrollableArea());
      expect(clearUISelection).not.toHaveBeenCalled();
    });

    it("does not clear UI selection when showDetails is false but selectedId exists with modal", () => {
      const store = createMockStore({
        showDetails: false,
        activeModal: "ACTIVE_MODAL",
        selectedId: "doc-456",
      });

      renderWithRouter(<DashboardPage />, {
        initialEntries: ["/app/folders"],
        store,
      });

      fireEvent.click(getScrollableArea());
      expect(clearUISelection).not.toHaveBeenCalled();
    });
  });

  describe("Edge Cases & Boundary Conditions", () => {
    it("handles route with trailing slash", () => {
      renderWithRouter(<DashboardPage />, {
        initialEntries: ["/app/folders/"],
      });

      expect(setCurrentFolder).toHaveBeenCalled();
    });

    it("handles route with query parameters", () => {
      renderWithRouter(<DashboardPage />, {
        initialEntries: ["/app/folders?tab=recent"],
      });

      // Should still extract type from path
      expect(setCurrentFolder).toHaveBeenCalled();
    });

    it("handles route with hash fragment", () => {
      renderWithRouter(<DashboardPage />, {
        initialEntries: ["/app/folders#section"],
      });

      expect(setCurrentFolder).toHaveBeenCalled();
    });

    it("renders correctly with folder ID in route", () => {
      // Test that component doesn't crash with dynamic folder ID
      renderWithRouter(<DashboardPage />, {
        initialEntries: ["/app/folders/abc123"],
      });

      expect(screen.getByTestId("folder-view")).toBeInTheDocument();
    });
  });
});
