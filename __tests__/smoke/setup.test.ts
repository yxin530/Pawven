describe("Project Setup", () => {
  it("should have TypeScript configured", () => {
    expect(true).toBe(true);
  });

  it("should have fast-check available", () => {
    const fc = require("fast-check");
    expect(fc).toBeDefined();
    expect(fc.assert).toBeDefined();
  });

  it("should have zustand available", () => {
    const zustand = require("zustand");
    expect(zustand).toBeDefined();
  });
});
