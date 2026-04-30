// DashboardPage.test.jsx
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import DashboardPage from "@/features/dashboard/components/DashboardPage";
import { setCurrentFolder, clearUISelection } from "@/features/documents/store/documents.slice";
import { APP_VIEWS_MAP } from "@/shared/utils/constants";
import ROUTES from "@/shared/utils/routes";

// ─── Mock All Child Components ───────────────────────────────────────────────
jest.mock("@/shared/components/layout/Sidebar", () => () => <div data-testid="sidebar" />);
jest.mock("@/shared/components/layout/Header", () => () => <div data-testid="header" />);
jest.mock("@/shared/components/dashboard/FolderView", () => () => <div data-testid="folder-view" />);
jest.mock("@/shared/components/dashboard/RightSidebar", () => () => <div data-testid="right-sidebar" />);
jest.mock("@/features/documents/components/TrashPage", () => () => <div data-testid="trash-page" />);
jest.mock("@/features/documents/components/SharePage", () => () => <div data-testid="share-page" />);
jest.mock("@/features/auth/components/UserProfilePage", () => () => <div data-testid="user-profile-page" />);
jest.mock("@/shared/components/PageNotFound", () => () => <div data-testid="page-not-found" />);
jest.mock("@/shared/components/modals/ModalManager", () => () => <div data-testid="modal-manager" />);

jest.mock("@/features/documents/store/documents.slice", () => ({
    setCurrentFolder: jest.fn((payload) => ({ type: "documents/setCurrentFolder", payload })),
    clearUISelection: jest.fn(() => ({ type: "documents/clearUISelection" })),
}));

const makeStore = (stateOverrides = {}) =>
    configureStore({
        reducer: {
            documentSystem: (
                state = {
                    showDetails: false,
                    activeModal: null,
                    selectedId: null,
                    ...stateOverrides,
                },
                action
            ) => state,
        },
    });


const renderDashboard = (initialPath = "/app", stateOverrides = {}) => {
    const store = makeStore(stateOverrides);
    jest.spyOn(store, "dispatch");

    const utils = render(
        <Provider store={store}>
            <MemoryRouter initialEntries={[initialPath]}>
                <DashboardPage />
            </MemoryRouter>
        </Provider>
    );

    return { ...utils, store };
};


describe("DashboardPage", () => {

    beforeEach(() => jest.clearAllMocks());

    describe("Layout rendering", () => {
        it("renders all structural components", () => {
            renderDashboard();

            expect(screen.getByTestId("sidebar")).toBeInTheDocument();
            expect(screen.getByTestId("header")).toBeInTheDocument();
            expect(screen.getByTestId("right-sidebar")).toBeInTheDocument();
            expect(screen.getByTestId("modal-manager")).toBeInTheDocument();
        });
    });

    
    describe("Routing", () => {
        it("redirects '/' to FOLDERS route", () => {
            renderDashboard("/app");

            // After redirect, FolderView should be visible
            expect(screen.getByTestId("folder-view")).toBeInTheDocument();
        });

        it("renders FolderView on the folders route", () => {
            renderDashboard(ROUTES.APP.FOLDERS);

            expect(screen.getByTestId("folder-view")).toBeInTheDocument();
        });

        it("renders TrashPage on the trash route", () => {
            renderDashboard(ROUTES.APP.TRASH);

            expect(screen.getByTestId("trash-page")).toBeInTheDocument();
        });

        it("renders SharePage on the shared route", () => {
            renderDashboard(ROUTES.APP.SHARED);

            expect(screen.getByTestId("share-page")).toBeInTheDocument();
        });

        it("renders UserProfilePage on the profile route", () => {
            renderDashboard(ROUTES.APP.PROFILE);

            expect(screen.getByTestId("user-profile-page")).toBeInTheDocument();
        });

        it("renders PageNotFound for an unknown route", () => {
            renderDashboard("/app/definitely-not-a-route");

            expect(screen.getByTestId("page-not-found")).toBeInTheDocument();
        });
    });

    
    describe("useEffect: setCurrentFolder", () => {
        it("dispatches setCurrentFolder with mapped value when path has a valid type segment", () => {
            const { store } = renderDashboard(ROUTES.APP.FOLDERS);
            const type = ROUTES.APP.FOLDERS.substring(1).split("/")[1]; // e.g. "folders"

            expect(setCurrentFolder).toHaveBeenCalledWith(
                APP_VIEWS_MAP[type.toUpperCase()]
            );
            expect(store.dispatch).toHaveBeenCalledWith(
                expect.objectContaining({ type: "documents/setCurrentFolder" })
            );
        });

        it("dispatches setCurrentFolder with TRASH mapped value on trash route", () => {
            renderDashboard(ROUTES.APP.TRASH);
            const type = ROUTES.APP.TRASH.substring(1).split("/")[1]; // e.g. "trash"

            expect(setCurrentFolder).toHaveBeenCalledWith(
                APP_VIEWS_MAP[type.toUpperCase()]
            );
        });

        it("does NOT dispatch setCurrentFolder when the type segment is absent", () => {
            renderDashboard("/app");

            // type would be "" or undefined — guard `if (type)` prevents dispatch
            expect(setCurrentFolder).not.toHaveBeenCalled();
        });
    });

   
    describe("handleOutsideClick", () => {
        const clickScrollArea = () =>
            // The scrollable inner div wrapping the Routes
            fireEvent.click(document.querySelector(".overflow-y-auto"));

        it("does NOT dispatch clearUISelection when a modal is active", () => {
            const { store } = renderDashboard(ROUTES.APP.FOLDERS, {
                activeModal: "RENAME_MODAL",
                showDetails: true,
                selectedId: "doc-1",
            });

            clickScrollArea();

            expect(clearUISelection).not.toHaveBeenCalled();
            expect(store.dispatch).not.toHaveBeenCalledWith(
                expect.objectContaining({ type: "documents/clearUISelection" })
            );
        });

        it("dispatches clearUISelection when showDetails is true and no modal is active", () => {
            const { store } = renderDashboard(ROUTES.APP.FOLDERS, {
                activeModal: null,
                showDetails: true,
                selectedId: null,
            });

            clickScrollArea();

            expect(clearUISelection).toHaveBeenCalledTimes(1);
            expect(store.dispatch).toHaveBeenCalledWith(
                expect.objectContaining({ type: "documents/clearUISelection" })
            );
        });

        it("dispatches clearUISelection when selectedId is set and no modal is active", () => {
            const { store } = renderDashboard(ROUTES.APP.FOLDERS, {
                activeModal: null,
                showDetails: false,
                selectedId: "doc-42",
            });

            clickScrollArea();

            expect(clearUISelection).toHaveBeenCalledTimes(1);
        });

        it("does NOT dispatch clearUISelection when both showDetails and selectedId are falsy", () => {
            const { store } = renderDashboard(ROUTES.APP.FOLDERS, {
                activeModal: null,
                showDetails: false,
                selectedId: null,
            });

            clickScrollArea();

            expect(clearUISelection).not.toHaveBeenCalled();
        });
    });
});