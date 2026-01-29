import { describe, expect, it } from "vitest";
import {
  AppError,
  ConflictError,
  ForbiddenError,
  InsufficientPointsError,
  InternalError,
  NoSubscriptionError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../errors";

describe("Error Classes", () => {
  describe("ValidationError", () => {
    it("should have correct status code and code", () => {
      const error = new ValidationError();
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.message).toBe("入力内容に問題があります");
      expect(error.isOperational).toBe(true);
    });

    it("should accept custom message and details", () => {
      const error = new ValidationError("カスタムメッセージ", {
        field: "email",
        reason: "invalid format",
      });
      expect(error.message).toBe("カスタムメッセージ");
      expect(error.details).toEqual({
        field: "email",
        reason: "invalid format",
      });
    });

    it("should be instance of AppError and Error", () => {
      const error = new ValidationError();
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("UnauthorizedError", () => {
    it("should have correct status code and code", () => {
      const error = new UnauthorizedError();
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe("UNAUTHORIZED");
      expect(error.message).toBe("認証が必要です");
    });
  });

  describe("ForbiddenError", () => {
    it("should have correct status code and code", () => {
      const error = new ForbiddenError();
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe("FORBIDDEN");
      expect(error.message).toBe("アクセス権限がありません");
    });

    it("should accept custom message", () => {
      const error = new ForbiddenError("採用担当者権限が必要です");
      expect(error.message).toBe("採用担当者権限が必要です");
    });
  });

  describe("NotFoundError", () => {
    it("should have correct status code and code", () => {
      const error = new NotFoundError();
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe("NOT_FOUND");
      expect(error.message).toBe("リソースが見つかりません");
    });

    it("should accept custom message", () => {
      const error = new NotFoundError("ユーザーが見つかりません");
      expect(error.message).toBe("ユーザーが見つかりません");
    });
  });

  describe("ConflictError", () => {
    it("should have correct status code and code", () => {
      const error = new ConflictError();
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe("CONFLICT");
      expect(error.message).toBe("リソースの状態が矛盾しています");
    });

    it("should accept custom message", () => {
      const error = new ConflictError("既に登録されています");
      expect(error.message).toBe("既に登録されています");
    });
  });

  describe("InsufficientPointsError", () => {
    it("should have correct status code and code", () => {
      const error = new InsufficientPointsError(10, 5);
      expect(error.statusCode).toBe(402);
      expect(error.code).toBe("INSUFFICIENT_POINTS");
      expect(error.message).toBe(
        "ポイントが不足しています。必要: 10pt, 残高: 5pt",
      );
    });

    it("should store required and available values", () => {
      const error = new InsufficientPointsError(20, 15);
      expect(error.required).toBe(20);
      expect(error.available).toBe(15);
      expect(error.details).toEqual({
        required: 20,
        available: 15,
      });
    });
  });

  describe("NoSubscriptionError", () => {
    it("should have correct status code and code", () => {
      const error = new NoSubscriptionError();
      expect(error.statusCode).toBe(402);
      expect(error.code).toBe("NO_SUBSCRIPTION");
      expect(error.message).toBe(
        "サブスクリプションがありません。プランを選択してください。",
      );
    });

    it("should accept custom message", () => {
      const error = new NoSubscriptionError("カスタムメッセージ");
      expect(error.message).toBe("カスタムメッセージ");
    });
  });

  describe("InternalError", () => {
    it("should have correct status code and code", () => {
      const error = new InternalError();
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe("INTERNAL_ERROR");
      expect(error.message).toBe("システムエラーが発生しました");
    });

    it("should accept custom message and details", () => {
      const error = new InternalError("データベース接続エラー", {
        service: "database",
      });
      expect(error.message).toBe("データベース接続エラー");
      expect(error.details).toEqual({ service: "database" });
    });
  });

  describe("Error name", () => {
    it("should have correct constructor name", () => {
      expect(new ValidationError().name).toBe("ValidationError");
      expect(new UnauthorizedError().name).toBe("UnauthorizedError");
      expect(new ForbiddenError().name).toBe("ForbiddenError");
      expect(new NotFoundError().name).toBe("NotFoundError");
      expect(new ConflictError().name).toBe("ConflictError");
      expect(new InsufficientPointsError(10, 5).name).toBe(
        "InsufficientPointsError",
      );
      expect(new NoSubscriptionError().name).toBe("NoSubscriptionError");
      expect(new InternalError().name).toBe("InternalError");
    });
  });

  describe("Stack trace", () => {
    it("should have stack trace", () => {
      const error = new ValidationError();
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain("ValidationError");
    });
  });
});
