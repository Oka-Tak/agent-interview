"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ApplicantDashboard() {
  const { data: session } = useSession();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          こんにちは、{session?.user?.name}さん
        </h1>
        <p className="text-muted-foreground mt-2">
          AIエージェントを作成して、採用担当者との面接を始めましょう
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              AIとチャット
            </CardTitle>
            <CardDescription>
              AIと対話して、あなたの経験やスキルを伝えましょう
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/chat">
              <Button className="w-full">チャットを始める</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              ドキュメント
            </CardTitle>
            <CardDescription>
              履歴書やポートフォリオをアップロードしましょう
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/documents">
              <Button variant="outline" className="w-full">
                ドキュメント管理
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              エージェント
            </CardTitle>
            <CardDescription>
              あなたのエージェントを確認・公開しましょう
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/agent">
              <Button variant="outline" className="w-full">
                エージェント設定
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>エージェント作成の進捗</CardTitle>
          <CardDescription>
            すべてのステップを完了すると、エージェントを公開できます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold">1</span>
                </div>
                <div>
                  <p className="font-medium">AIとの対話</p>
                  <p className="text-sm text-muted-foreground">
                    経験やスキルについて対話する
                  </p>
                </div>
              </div>
              <Badge variant="outline">未完了</Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold">2</span>
                </div>
                <div>
                  <p className="font-medium">ドキュメントアップロード</p>
                  <p className="text-sm text-muted-foreground">
                    履歴書やポートフォリオを追加
                  </p>
                </div>
              </div>
              <Badge variant="outline">未完了</Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold">3</span>
                </div>
                <div>
                  <p className="font-medium">エージェント公開</p>
                  <p className="text-sm text-muted-foreground">
                    採用担当者に公開する
                  </p>
                </div>
              </div>
              <Badge variant="outline">未完了</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
