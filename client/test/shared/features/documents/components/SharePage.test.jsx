import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import SharePage from "@/features/documents/components/SharePage";
import { APP_VIEWS_MAP } from "@/shared/utils/constants";

jest.mock("@/features/documents/store/documents.slice", () => ({
  fetchDocuments: jest.fn(() => ({
    type: "documents/fetchDocuments",
    unwrap: () => Promise.resolve(),
  })),
  setSelectedId: jest.fn((id) => ({ type: "documents/setSelectedId", payload: id })),
  setModalProps: jest.fn((props) => ({ type: "documents/setModalProps", payload: props })),
  setActiveModal: jest.fn((modal) => ({ type: "documents/setActiveModal", payload: modal })),
}));

jest.mock("@/shared/hooks/useDocumentContextMenu", () => () => ({
  contextMenu: null,
  handleContextMenu: jest.fn(),
  closeContextMenu: jest.fn(),
  getContextMenuItems: jest.fn(() => []),
}));

jest.mock("@/shared/components/dashboard/Breadcrumb", () => () => <div data-testid="breadcrumb" />);
jest.mock("@/shared/components/common/Loading", () => ({ text }) => (
  <div data-testid="loading">{text}</div>
));
jest.mock("@/shared/components/common/EmptyState", () => ({ title }) => (
  <div data-testid="empty-state">{title}</div>
));
jest.mock("@/shared/components/common/ResourceNotFound", () => () => (
  <div data-testid="resource-not-found" />
));
jest.mock("@/shared/components/dashboard/FolderItem", () => ({ folder, onSelect }) => (
  <div data-testid={`folder-${folder.id}`} onClick={() => onSelect(folder.id)}>
    {folder.name}
  </div>
));
jest.mock("@/shared/components/dashboard/FileItem", () => ({ file, onSelect }) => (
  <div data-testid={`file-${file.id}`} onClick={() => onSelect(file.id)}>
    {file.name}
  </div>
));

const createMockStore = (initialState = {}) =>
  configureStore({
    reducer: {
      documentSystem: (state = initialState) => state,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });

const renderWithRouter = (ui, { initialEntries = ["/app/shared"], store = null } = {}) => {
  const finalStore =
    store ||
    createMockStore({
      documents: {
        [APP_VIEWS_MAP.SHARED]: { id: APP_VIEWS_MAP.SHARED, childDocuments: [] },
      },
      isLoading: false,
      selectedId: null,
      currentFolderId: null,
    });

  const utils = render(
    <Provider store={finalStore}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/app/shared" element={ui} />
          <Route path="/app/shared/:folderId" element={ui} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
  return { ...utils, store: finalStore };
};

describe("SharePage", () => {
  it("renders loading state when initial loading", () => {
    const store = createMockStore({
      documents: {},
      isLoading: true,
    });

    renderWithRouter(<SharePage />, { store });
    expect(screen.getByTestId("loading")).toHaveTextContent("Refreshing items...");
  });

  it("renders ResourceNotFound when folder doesn't exist and not loading", () => {
    const store = createMockStore({
      documents: {},
      isLoading: false,
    });

    renderWithRouter(<SharePage />, { store });
    expect(screen.getByTestId("resource-not-found")).toBeInTheDocument();
  });

  it("renders EmptyState when there are no shared documents", () => {
    const store = createMockStore({
      documents: {
        [APP_VIEWS_MAP.SHARED]: { id: APP_VIEWS_MAP.SHARED, childDocuments: [] },
      },
      isLoading: false,
    });

    renderWithRouter(<SharePage />, { store });
    expect(screen.getByTestId("empty-state")).toHaveTextContent("No shared items");
  });

  it("renders only documents that are children of the shared root", () => {
    const store = createMockStore({
      documents: {
        [APP_VIEWS_MAP.SHARED]: {
          id: APP_VIEWS_MAP.SHARED,
          childDocuments: ["doc-1", "doc-2"],
        },
        "doc-1": { id: "doc-1", name: "Shared Folder", docType: "folder" },
        "doc-2": { id: "doc-2", name: "Shared File", docType: "file" },
        "doc-3": { id: "doc-3", name: "Private Doc", docType: "file" },
      },
      isLoading: false,
    });

    renderWithRouter(<SharePage />, { store });

    // Should render doc-1 and doc-2
    expect(screen.getByTestId("folder-doc-1")).toBeInTheDocument();
    expect(screen.getByTestId("file-doc-2")).toBeInTheDocument();
    expect(screen.getByText("Shared Folder")).toBeInTheDocument();
    expect(screen.getByText("Shared File")).toBeInTheDocument();

    // Should NOT render doc-3
    expect(screen.queryByTestId("file-doc-3")).not.toBeInTheDocument();
    expect(screen.queryByText("Private Doc")).not.toBeInTheDocument();
  });

  it("renders child documents when inside a shared subfolder", () => {
    const subfolderId = "subfolder-123";
    const store = createMockStore({
      documents: {
        [APP_VIEWS_MAP.SHARED]: {
          id: APP_VIEWS_MAP.SHARED,
          childDocuments: [subfolderId],
        },
        [subfolderId]: {
          id: subfolderId,
          name: "Shared Subfolder",
          docType: "folder",
          childDocuments: ["doc-4"],
        },
        "doc-4": { id: "doc-4", name: "Deeply Shared File", docType: "file" },
      },
      isLoading: false,
    });

    renderWithRouter(<SharePage />, {
      initialEntries: [`/app/shared/${subfolderId}`],
      store,
    });

    expect(screen.getByTestId("file-doc-4")).toBeInTheDocument();
    expect(screen.getByText("Deeply Shared File")).toBeInTheDocument();
    expect(screen.queryByTestId(`folder-${subfolderId}`)).not.toBeInTheDocument();
  });

  it("dispatches setSelectedId when an item is clicked", () => {
    const { setSelectedId } = require("@/features/documents/store/documents.slice");
    const store = createMockStore({
      documents: {
        [APP_VIEWS_MAP.SHARED]: {
          id: APP_VIEWS_MAP.SHARED,
          childDocuments: ["doc-1"],
        },
        "doc-1": { id: "doc-1", name: "Shared File", docType: "file" },
      },
      isLoading: false,
    });

    renderWithRouter(<SharePage />, { store });

    fireEvent.click(screen.getByTestId("file-doc-1"));
    expect(setSelectedId).toHaveBeenCalledWith("doc-1");
  });
});
