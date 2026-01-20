"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const defaultName = searchParams.get("name") || "";

  const [name, setName] = useState(defaultName);
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUserRegister = async () => {
    if (!name.trim()) {
      setError("名前を入力してください");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          accountType: "USER",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "登録に失敗しました");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleRecruiterRegister = async () => {
    if (!name.trim() || !companyName.trim()) {
      setError("名前と会社名を入力してください");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          companyName,
          accountType: "RECRUITER",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "登録に失敗しました");
      }

      router.push("/recruiter/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            アカウント登録
          </CardTitle>
          <CardDescription>
            {email ? `${email} で登録します` : "アカウントタイプを選択してください"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="user" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user">求職者</TabsTrigger>
              <TabsTrigger value="recruiter">採用担当者</TabsTrigger>
            </TabsList>
            <TabsContent value="user" className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">お名前</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="山田 太郎"
                />
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button
                onClick={handleUserRegister}
                className="w-full"
                disabled={loading}
              >
                {loading ? "登録中..." : "求職者として登録"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                AIと対話してあなたのエージェントを作成し、
                採用担当者との面接を非同期で行えます
              </p>
            </TabsContent>
            <TabsContent value="recruiter" className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">お名前</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="山田 太郎"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">会社名</label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="株式会社サンプル"
                />
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button
                onClick={handleRecruiterRegister}
                className="w-full"
                disabled={loading}
              >
                {loading ? "登録中..." : "採用担当者として登録"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                求職者のAIエージェントと非同期で面接を行えます
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
