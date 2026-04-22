import React from "react";
import { render, screen } from "@testing-library/react";
import PageNotFound from "@/shared/components/PageNotFound";
import { BrowserRouter } from "react-router-dom";

// Mock framer-motion to avoid issues with animations in Jest
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

describe("PageNotFound Component", () => {
  it("renders the 404 message and title", () => {
    render(
      <BrowserRouter>
        <PageNotFound />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Lost in Space\?/i)).toBeInTheDocument();
    expect(screen.getAllByText(/404/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Return to Mission Control/i)).toBeInTheDocument();
  });
});
