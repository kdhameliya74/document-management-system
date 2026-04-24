import React from "react";
import { screen, render, fireEvent } from "@testing-library/react";
import FolderItem from "@/shared/components/dashboard/FolderItem";

jest.mock("lucide-react", () => ({
    Folder: () => <div>FolderIcon</div>
}));

describe("FolderItem", () => {
    const folder = {
        name: "test",
        id: "10001",
        docType: "folder",
        sharedWith: [],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders the folder name", () => {
        const { getByText } = render(<FolderItem folder={folder} />);
        expect(getByText(folder.name)).toBeInTheDocument();
    });

    it("renders the folder icon", () => {
        const { getByText } = render(<FolderItem folder={folder} />);
        expect(getByText("FolderIcon")).toBeInTheDocument();
    });

    it("calls onContextMenu on right click", async () => {
        const onContextMenu = jest.fn();
        const props = {
            folder,
            onContextMenu,
            onNavigate: jest.fn(),
            isSelected: false,
        }
        render(
            <FolderItem data-testid="folder-item" {...props} />,
        );
        const folderItem = screen.getByTestId("folder-item");
        fireEvent.contextMenu(folderItem);
        expect(onContextMenu).toHaveBeenCalledWith(expect.anything(), folder, "folder");
    });
});