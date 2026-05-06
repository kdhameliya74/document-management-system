import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import TrashPage from "@/features/documents/components/TrashPage";
import { APP_VIEWS_MAP } from "@/shared/utils/constants";

jest.mock("@/features/documents/store/documents.slice", () => ({
    fetchDocuments: jest.fn(() => ({ type: "documents/fetchDocuments", unwrap: () => Promise.resolve() })),
    setSelectedId: jest.fn((id) => ({ type: "documents/setSelectedId", payload: id })),
    setModalProps: jest.fn((props) => ({ type: "documents/setModalProps", payload: props })),
    setActiveModal: jest.fn((modal) => ({ type: "documents/setActiveModal", payload: modal })),
    restoreDocument: jest.fn((id) => ({ type: "documents/restoreDocument", payload: id })),
}));

jest.mock("@/shared/hooks/useDocumentContextMenu", () => () => ({
    contextMenu: null,
    handleContextMenu: jest.fn(),
    closeContextMenu: jest.fn(),
    getContextMenuItems: jest.fn(() => []),
    handleClickOutside: jest.fn(),
}));

// Mock components
jest.mock("@/shared/components/common/PageHeader", () => {
    const PageHeader = ({ children }) => <div>{children}</div>;
    PageHeader.Left = ({ title }) => <div data-testid="page-header-title">{title}</div>;
    return PageHeader;
});
jest.mock("@/shared/components/common/Loading", () => ({ text }) => <div data-testid="loading">{text}</div>);
jest.mock("@/shared/components/common/EmptyState", () => ({ title }) => <div data-testid="empty-state">{title}</div>);
jest.mock("@/shared/components/common/ResourceNotFound", () => () => <div data-testid="resource-not-found" />);
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

const renderWithRouter = (
    ui,
    { initialEntries = ["/app/trash"], store = null } = {},
) => {
    const finalStore = store || createMockStore({
        documents: {
            [APP_VIEWS_MAP.TRASH]: { id: APP_VIEWS_MAP.TRASH, childDocuments: [] }
        },
        isLoading: false,
        selectedId: null,
    });

    const utils = render(
        <Provider store={finalStore}>
            <MemoryRouter initialEntries={initialEntries}>
                <Routes>
                    <Route path="/app/trash" element={ui} />
                    <Route path="/app/trash/:folderId" element={ui} />
                </Routes>
            </MemoryRouter>
        </Provider>,
    );
    return { ...utils, store: finalStore };
};

describe("TrashPage", () => {
    it("renders loading state when initial loading", () => {
        const store = createMockStore({
            documents: {},
            isLoading: true,
        });

        renderWithRouter(<TrashPage />, { store });
        expect(screen.getByTestId("loading")).toHaveTextContent("Loading trash...");
    });

    it("renders ResourceNotFound when folder doesn't exist and not loading", () => {
        const store = createMockStore({
            documents: {},
            isLoading: false,
        });

        renderWithRouter(<TrashPage />, { store });
        expect(screen.getByTestId("resource-not-found")).toBeInTheDocument();
    });

    it("renders EmptyState when trash is empty", () => {
        const store = createMockStore({
            documents: {
                [APP_VIEWS_MAP.TRASH]: { id: APP_VIEWS_MAP.TRASH, childDocuments: [] }
            },
            isLoading: false,
        });

        renderWithRouter(<TrashPage />, { store });
        expect(screen.getByTestId("empty-state")).toHaveTextContent("Trash is empty");
    });

    it("renders only documents that are children of the trash root", () => {
        const store = createMockStore({
            documents: {
                [APP_VIEWS_MAP.TRASH]: {
                    id: APP_VIEWS_MAP.TRASH,
                    childDocuments: ["trash-1", "trash-2"]
                },
                "trash-1": { id: "trash-1", name: "Trashed Folder", docType: "folder" },
                "trash-2": { id: "trash-2", name: "Trashed File", docType: "file" },
                "active-doc": { id: "active-doc", name: "Active Document", docType: "file" }
            },
            isLoading: false,
        });

        renderWithRouter(<TrashPage />, { store });

        // Should render trash-1 and trash-2
        expect(screen.getByTestId("folder-trash-1")).toBeInTheDocument();
        expect(screen.getByTestId("file-trash-2")).toBeInTheDocument();
        expect(screen.getByText("Trashed Folder")).toBeInTheDocument();
        expect(screen.getByText("Trashed File")).toBeInTheDocument();

        // Should NOT render active-doc
        expect(screen.queryByTestId("file-active-doc")).not.toBeInTheDocument();
        expect(screen.queryByText("Active Document")).not.toBeInTheDocument();
    });

    it("renders child documents when inside a trashed subfolder", () => {
        const subfolderId = "subfolder-trash";
        const store = createMockStore({
            documents: {
                [APP_VIEWS_MAP.TRASH]: {
                    id: APP_VIEWS_MAP.TRASH,
                    childDocuments: [subfolderId]
                },
                [subfolderId]: {
                    id: subfolderId,
                    name: "Trashed Subfolder",
                    docType: "folder",
                    childDocuments: ["deep-trash"]
                },
                "deep-trash": { id: "deep-trash", name: "Deeply Trashed File", docType: "file" }
            },
            isLoading: false,
        });

        renderWithRouter(<TrashPage />, {
            initialEntries: [`/app/trash/${subfolderId}`],
            store
        });

        expect(screen.getByTestId("file-deep-trash")).toBeInTheDocument();
        expect(screen.getByText("Deeply Trashed File")).toBeInTheDocument();
    });

    it("dispatches setSelectedId when an item is clicked", () => {
        const { setSelectedId } = require("@/features/documents/store/documents.slice");
        const store = createMockStore({
            documents: {
                [APP_VIEWS_MAP.TRASH]: {
                    id: APP_VIEWS_MAP.TRASH,
                    childDocuments: ["trash-1"]
                },
                "trash-1": { id: "trash-1", name: "Trashed File", docType: "file" }
            },
            isLoading: false,
        });

        renderWithRouter(<TrashPage />, { store });

        fireEvent.click(screen.getByTestId("file-trash-1"));
        expect(setSelectedId).toHaveBeenCalledWith("trash-1");
    });
});
