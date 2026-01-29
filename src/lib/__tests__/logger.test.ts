import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { logger } from "../logger";

describe("Logger", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("info", () => {
    it("should log info message in JSON format", () => {
      logger.info("Test message");

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const logOutput = consoleLogSpy.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);

      expect(parsed.level).toBe("info");
      expect(parsed.message).toBe("Test message");
      expect(parsed.timestamp).toBeDefined();
    });

    it("should include context in log", () => {
      logger.info("Test message", { userId: "123", action: "login" });

      const logOutput = consoleLogSpy.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);

      expect(parsed.userId).toBe("123");
      expect(parsed.action).toBe("login");
    });
  });

  describe("warn", () => {
    it("should log warn message in JSON format", () => {
      logger.warn("Warning message");

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      const logOutput = consoleWarnSpy.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);

      expect(parsed.level).toBe("warn");
      expect(parsed.message).toBe("Warning message");
    });

    it("should include context in warn log", () => {
      logger.warn("Warning message", { threshold: 100, current: 95 });

      const logOutput = consoleWarnSpy.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);

      expect(parsed.threshold).toBe(100);
      expect(parsed.current).toBe(95);
    });
  });

  describe("error", () => {
    it("should log error message in JSON format", () => {
      logger.error("Error message");

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const logOutput = consoleErrorSpy.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);

      expect(parsed.level).toBe("error");
      expect(parsed.message).toBe("Error message");
    });

    it("should include error object details", () => {
      const error = new Error("Something went wrong");
      logger.error("Error occurred", error);

      const logOutput = consoleErrorSpy.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);

      expect(parsed.error).toBeDefined();
      expect(parsed.error.name).toBe("Error");
      expect(parsed.error.message).toBe("Something went wrong");
      expect(parsed.error.stack).toBeDefined();
    });

    it("should include both error and context", () => {
      const error = new Error("Database error");
      logger.error("Database connection failed", error, {
        database: "postgres",
        host: "localhost",
      });

      const logOutput = consoleErrorSpy.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);

      expect(parsed.error.message).toBe("Database error");
      expect(parsed.database).toBe("postgres");
      expect(parsed.host).toBe("localhost");
    });

    it("should handle error without error object", () => {
      logger.error("Simple error message", undefined, { code: "ERR001" });

      const logOutput = consoleErrorSpy.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);

      expect(parsed.level).toBe("error");
      expect(parsed.message).toBe("Simple error message");
      expect(parsed.code).toBe("ERR001");
      expect(parsed.error).toBeUndefined();
    });
  });

  describe("timestamp", () => {
    it("should include ISO formatted timestamp", () => {
      const before = new Date().toISOString();
      logger.info("Test");
      const after = new Date().toISOString();

      const logOutput = consoleLogSpy.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);

      expect(parsed.timestamp).toBeDefined();
      expect(new Date(parsed.timestamp).getTime()).toBeGreaterThanOrEqual(
        new Date(before).getTime(),
      );
      expect(new Date(parsed.timestamp).getTime()).toBeLessThanOrEqual(
        new Date(after).getTime(),
      );
    });
  });

  describe("JSON Lines format", () => {
    it("should output valid JSON", () => {
      logger.info("Message 1", { key: "value1" });
      logger.warn("Message 2", { key: "value2" });
      logger.error("Message 3", new Error("test"), { key: "value3" });

      // All outputs should be parseable JSON
      expect(() => JSON.parse(consoleLogSpy.mock.calls[0][0])).not.toThrow();
      expect(() => JSON.parse(consoleWarnSpy.mock.calls[0][0])).not.toThrow();
      expect(() => JSON.parse(consoleErrorSpy.mock.calls[0][0])).not.toThrow();
    });

    it("should handle special characters in message", () => {
      logger.info('Message with "quotes" and \\ backslash');

      const logOutput = consoleLogSpy.mock.calls[0][0];
      expect(() => JSON.parse(logOutput)).not.toThrow();
      const parsed = JSON.parse(logOutput);
      expect(parsed.message).toBe('Message with "quotes" and \\ backslash');
    });

    it("should handle Japanese characters", () => {
      logger.info("日本語メッセージ", { detail: "詳細情報" });

      const logOutput = consoleLogSpy.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);
      expect(parsed.message).toBe("日本語メッセージ");
      expect(parsed.detail).toBe("詳細情報");
    });
  });
});
