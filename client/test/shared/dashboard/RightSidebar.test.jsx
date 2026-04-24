import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RightSidebar from "@/shared/components/dashboard/RightSidebar";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import documentSystemReducer from "@/features/documents/store/documents.slice";
import * as documentActions from "@/features/documents/store/documents.slice";
import { useDownloadDocument } from "@/shared/hooks/useDownloadDocument";

jest.mock("@/shared/hooks/useDownloadDocument");
jest.mock("react-hot-toast");

jest.mock("@/shared/components/common/ActivityLog", () => () => <div data-testid="activity-log">Activity Log</div>);
jest.mock("@/shared/components/common/UserTag", () => ({ collaborator }) => <div>{collaborator?.name || collaborator?.fullName}</div>);
jest.mock("@/shared/components/common/FileIcon", () => () => <div>FileIcon</div>);

jest.mock("lucide-react", () => {
    const original = jest.requireActual("lucide-react");
    return {
        ...original,
        X: () => <div data-testid="icon-x">X</div>,
        Info: () => <div data-testid="icon-info">Info</div>,
        Clock: () => <div data-testid="icon-clock">Clock</div>,
    };
});

const mockUser = { id: "user1", firstName: "Test", fullName: "Test User" };

const setupStore = (initialState = {}) => {
    return configureStore({
        reducer: {
            documentSystem: documentSystemReducer,
            auth: (state = { user: mockUser }) => state,
        },
        preloadedState: {
            documentSystem: {
                documents: {},
                currentFolderId: null,
                selectedId: null,
                showDetails: true,
                isSummarizing: false,
                ...initialState,
            },
        },
    });
};

const renderWithProvider = (state = {}) => {
    const store = setupStore(state);
    const originalDispatch = store.dispatch;
    store.dispatch = jest.fn(originalDispatch);
    return {
        store, ...render(
            <Provider store={store}>
                <RightSidebar />
            </Provider>
        )
    };
};

describe("RightSidebar", () => {
    const mockFile = {
        id: "file1",
        name: "document.pdf",
        docType: "file",
        mimeType: "application/pdf",
        extension: "PDF",
        size: 2048,
        createdAt: "2023-01-01T00:00:00Z",
        owner: "user1",
        description: "Old summary",
        tags: ["tag1"],
    };

    const mockFolder = {
        id: "folder1",
        name: "My Folder",
        docType: "folder",
        owner: "user1",
        createdAt: "2023-01-01T00:00:00Z",
    };

    const mockDownloadFile = jest.fn();
    const mockDownloadFolder = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        useDownloadDocument.mockReturnValue({
            downloadFile: mockDownloadFile,
            downloadFolder: mockDownloadFolder,
        });

        // Mock individual actions from the slice
        jest.spyOn(documentActions, 'summarizeDocument').mockImplementation(() => (dispatch) => {
            return Promise.resolve({ unwrap: () => Promise.resolve() });
        });
        jest.spyOn(documentActions, 'setShowDetails').mockImplementation((val) => ({ type: 'documentSystem/setShowDetails', payload: val }));
        jest.spyOn(documentActions, 'setActiveModal').mockImplementation((val) => ({ type: 'documentSystem/setActiveModal', payload: val }));
        jest.spyOn(documentActions, 'setModalProps').mockImplementation((val) => ({ type: 'documentSystem/setModalProps', payload: val }));
        jest.spyOn(documentActions, 'clearUISelection').mockImplementation(() => ({ type: 'documentSystem/clearUISelection' }));
    });

    it("does not render when showDetails is false", () => {
        renderWithProvider({ showDetails: false, selectedId: "file1", documents: { file1: mockFile } });
        expect(screen.queryByText(/document.pdf/i)).not.toBeInTheDocument();
    });

    it("renders file details correctly", () => {
        renderWithProvider({ selectedId: "file1", documents: { file1: mockFile } });
        expect(screen.getAllByText("document.pdf")[0]).toBeInTheDocument();
        expect(screen.getByText("2.00 KB")).toBeInTheDocument();
        expect(screen.getByText("PDF")).toBeInTheDocument();
        expect(screen.getByText("Old summary")).toBeInTheDocument();
        expect(screen.getByText("#tag1")).toBeInTheDocument();
    });

    it("switches to activity tab", () => {
        renderWithProvider({ selectedId: "file1", documents: { file1: mockFile } });
        const activityTab = screen.getByRole("button", { name: /activity logs/i });
        fireEvent.click(activityTab);
        expect(screen.getByTestId("activity-log")).toBeInTheDocument();
    });

    it("calls handleClose when close button is clicked", () => {
        const { store } = renderWithProvider({ selectedId: "file1", documents: { file1: mockFile } });

        // The close button is the one with the X icon in the header
        const closeButton = screen.getByTestId("icon-x").parentElement;
        fireEvent.click(closeButton);

        expect(documentActions.setShowDetails).toHaveBeenCalledWith(false);
        expect(documentActions.clearUISelection).toHaveBeenCalled();
    });

    it("calls summarizeDocument when summarize button is clicked", async () => {
        const { store } = renderWithProvider({ selectedId: "file1", documents: { file1: mockFile }, isSummarizing: false });

        const summarizeButton = screen.getByText(/re-summarize/i);
        fireEvent.click(summarizeButton);

        expect(documentActions.summarizeDocument).toHaveBeenCalledWith("file1");
    });

    it("calls downloadFile for files", () => {
        renderWithProvider({ selectedId: "file1", documents: { file1: mockFile } });
        const downloadButton = screen.getByTitle("Download");
        fireEvent.click(downloadButton);
        expect(mockDownloadFile).toHaveBeenCalledWith({ docId: "file1", force: true });
    });

    it("calls downloadFolder for folders", () => {
        renderWithProvider({ selectedId: "folder1", documents: { folder1: mockFolder } });
        const downloadButton = screen.getByTitle("Download");
        fireEvent.click(downloadButton);
        expect(mockDownloadFolder).toHaveBeenCalledWith({ docId: "folder1", name: "My Folder" });
    });
});
