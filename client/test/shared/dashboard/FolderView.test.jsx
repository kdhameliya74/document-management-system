import React from "react";
import FolderView from "@/shared/components/dashboard/FolderView";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import documentSystemReducer from "@/features/documents/store/documents.slice";
import { MemoryRouter, useParams } from "react-router-dom";
import { useFilter } from "@/shared/hooks/useFilter";
import useDocumentContextMenu from "@/shared/hooks/useDocumentContextMenu";
import DocumentService from "@/features/documents/api/document.api";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
  useNavigate: () => jest.fn(),
}));

jest.mock("@/shared/hooks/useFilter", () => ({ useFilter: jest.fn() }));
jest.mock("@/shared/hooks/useDocumentContextMenu", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => children,
}));
jest.mock("@/features/documents/api/document.api", () => ({
  getAll: jest.fn(),
  createFolder: jest.fn(),
}));
jest.mock("@/shared/components/dashboard/FolderItem", () => ({ folder, onNavigate }) => (
  <div data-testid="folder-item" onClick={() => onNavigate(folder.id)}>
    {folder.name}
  </div>
));
jest.mock("@/shared/components/dashboard/FileItem", () => ({ file, onSelect }) => (
  <div data-testid="file-item" onClick={() => onSelect(file.id)}>
    {file.name}
  </div>
));
jest.mock("@/shared/components/dashboard/Breadcrumb", () => () => (
  <div data-testid="breadcrumb">Breadcrumb</div>
));
jest.mock("@/shared/components/common/PageHeader", () => {
  const PageHeader = ({ children }) => <div data-testid="page-header">{children}</div>;
  PageHeader.Left = ({ title }) => <h1 data-testid="header-title">{title}</h1>;
  PageHeader.Middle = ({ children }) => <div>{children}</div>;
  PageHeader.Right = ({ children }) => <div>{children}</div>;
  return PageHeader;
});
jest.mock("@/shared/components/common/Filters", () => () => (
  <div data-testid="filters">Filters</div>
));
jest.mock("@/shared/components/common/Loading", () => ({ text }) => (
  <div data-testid="loading">{text}</div>
));
jest.mock("@/shared/components/common/ResourceNotFound", () => () => (
  <div data-testid="not-found">Resource Not Found</div>
));
jest.mock("@/shared/components/common/EmptyState", () => ({ title }) => (
  <div data-testid="empty-state">{title}</div>
));

describe("FolderView Component", () => {
  let store;

  const setup = (preloadedState = {}) => {
    store = configureStore({
      reducer: { documentSystem: documentSystemReducer },
      preloadedState: {
        documentSystem: {
          documents: {
            root: { id: "root", name: "My Drive", parentId: null, childDocuments: [] },
          },
          isLoading: false,
          selectedId: null,
          filters: { sortBy: "date_desc", color: null },
          ...preloadedState.documentSystem,
        },
      },
    });

    jest.spyOn(store, "dispatch");

    return render(
      <Provider store={store}>
        <MemoryRouter>
          <FolderView />
        </MemoryRouter>
      </Provider>,
    );
  };

  beforeEach(() => {
    useParams.mockReturnValue({ folderId: undefined });
    useFilter.mockReturnValue({ childDocuments: [], isEmpty: true });
    useDocumentContextMenu.mockReturnValue({
      contextMenu: null,
      handleContextMenu: jest.fn(),
      closeContextMenu: jest.fn(),
      getContextMenuItems: jest.fn(() => []),
    });

    DocumentService.getAll.mockReturnValue(new Promise(() => {}));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the initial loading state", () => {
    setup({
      documentSystem: {
        isLoading: true,
        documents: {},
      },
    });

    expect(screen.getByTestId("loading")).toHaveTextContent(/Refreshing items.../i);
  });

  it("renders 404 (ResourceNotFound) when folder does not exist", async () => {
    DocumentService.getAll.mockResolvedValue({ folders: [], files: [], breadcrumbs: [] });

    setup({
      documentSystem: {
        isLoading: false,
        documents: {},
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId("not-found")).toBeInTheDocument();
    });
  });

  it("renders the empty state when no documents are found", async () => {
    DocumentService.getAll.mockResolvedValue({ folders: [], files: [], breadcrumbs: [] });

    setup();

    await waitFor(() => {
      expect(screen.getByTestId("empty-state")).toHaveTextContent(/Your Drive is Empty/i);
    });
  });

  it("renders folder and file items", async () => {
    DocumentService.getAll.mockResolvedValue({ folders: [], files: [], breadcrumbs: [] });

    const mockFiles = [
      { id: "1", name: "Folder 1", docType: "folder" },
      { id: "2", name: "File 1.pdf", docType: "file" },
    ];
    useFilter.mockReturnValue({ childDocuments: mockFiles, isEmpty: false });

    setup();

    await waitFor(() => {
      expect(screen.getAllByTestId("folder-item")).toHaveLength(1);
      expect(screen.getAllByTestId("file-item")).toHaveLength(1);
    });
    expect(screen.getByText("Folder 1")).toBeInTheDocument();
    expect(screen.getByText("File 1.pdf")).toBeInTheDocument();
  });

  it("toggles the 'New' dropdown and shows options", async () => {
    setup();

    const newButton = await screen.findByRole("button", { name: /New/i });
    await userEvent.click(newButton);

    expect(screen.getByText("New Folder")).toBeInTheDocument();
    expect(screen.getByText("Upload File")).toBeInTheDocument();
  });

  it("dispatches setActiveModal when 'New Folder' is clicked from dropdown", async () => {
    setup();

    const newButton = await screen.findByRole("button", { name: /New/i });
    await userEvent.click(newButton);
    await userEvent.click(screen.getByText("New Folder"));

    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "documentSystem/setActiveModal",
        payload: "createFolder",
      }),
    );
  });

  it("dispatches setSelectedId when a file item is clicked", async () => {
    DocumentService.getAll.mockResolvedValue({ folders: [], files: [], breadcrumbs: [] });

    const mockFiles = [{ id: "2", name: "File 1.pdf", docType: "file" }];
    useFilter.mockReturnValue({ childDocuments: mockFiles, isEmpty: false });

    setup();

    const fileItem = await screen.findByTestId("file-item");
    await userEvent.click(fileItem);

    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "documentSystem/setSelectedId",
        payload: "2",
      }),
    );
  });

  it("renders the refreshing loader when isLoading is true but currentFolder exists", async () => {
    let resolveFetch;
    DocumentService.getAll.mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }),
    );

    setup({
      documentSystem: {
        isLoading: true,
        documents: {
          root: { id: "root", name: "My Drive", parentId: null, childDocuments: [] },
        },
      },
    });

    expect(screen.getByTestId("loading")).toHaveTextContent(/Refreshing items all.../i);

    await act(async () => {
      resolveFetch({ folders: [], files: [], breadcrumbs: [] });
    });
  });

  it("dispatches fetchDocuments on mount", async () => {
    setup();

    expect(store.dispatch).toHaveBeenCalled();

    // Flush all pending microtasks/state updates
    await act(async () => {});
  });

  it("closes the dropdown when clicking outside", async () => {
    setup();

    const newButton = await screen.findByRole("button", { name: /New/i });
    await userEvent.click(newButton);
    expect(screen.getByText("New Folder")).toBeInTheDocument();
    await userEvent.click(document.body);

    await waitFor(() => {
      expect(screen.queryByText("New Folder")).not.toBeInTheDocument();
    });
  });
});
