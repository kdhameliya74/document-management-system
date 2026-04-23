import React from "react";
import { render, fireEvent } from "@testing-library/react";
import FileItem from "@/shared/components/dashboard/FileItem";

jest.mock("@/shared/components/common/FileIcon", () => () => <div>FileIcon</div>);
jest.mock("@/shared/components/common/ContextMenu", () => () => (
  <div data-testid="context-menu">Context Menu</div>
));

jest.mock("@/shared/utils/utils.js", () => ({
  __esModule: true,
  getBaseName: jest.fn((name) => name),
  getFileExtension: jest.fn((name) => name.split(".").pop()),
}));

jest.mock("@/shared/utils/fileIcons.js", () => ({
  getFileIcon: jest.fn(() => ({ className: "" })),
}));

import { getBaseName, getFileExtension } from "@/shared/utils/utils.js";

describe("FileItem", () => {
  const file = {
    name: "test.txt",
    size: 1024,
    type: "text/plain",
    lastModified: "2022-01-01",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the file name", () => {
    const displayName = getBaseName(file.name);
    const { getByText } = render(<FileItem file={file} />);
    expect(getByText(displayName)).toHaveTextContent(file.name);
  });

  it("renders the file icon", () => {
    const { getByText } = render(<FileItem file={file} />);
    expect(getByText("FileIcon")).toBeInTheDocument();
  });

  it("renders the file extension", () => {
    const extension = getFileExtension(file.name);
    const { getByText } = render(<FileItem file={file} />);
    expect(getByText(extension)).toBeInTheDocument();
  });

  it("calls onContextMenu on right click", async () => {
    const onContextMenu = jest.fn();
    const { getByTestId } = render(
      <FileItem data-testid="file-item" file={file} onContextMenu={onContextMenu} />,
    );

    const fileItem = getByTestId("file-item");
    fireEvent.contextMenu(fileItem);
    expect(onContextMenu).toHaveBeenCalledWith(expect.anything(), file, "file");
  });
});
