import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Agent Interview</h1>
          <div className="space-x-4">
            <Link href="/login">
              <Button variant="ghost">ログイン</Button>
            </Link>
            <Link href="/login">
              <Button>無料で始める</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              AIエージェントで
              <br />
              <span className="text-primary">非同期面接</span>を実現
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              求職者はAIと対話してパーソナルエージェントを作成。
              採用担当者はいつでもエージェントと面接できます。
            </p>
            <div className="space-x-4">
              <Link href="/login">
                <Button size="lg" className="px-8">
                  求職者として始める
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="px-8">
                  採用担当者として始める
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h3 className="text-2xl font-bold text-center mb-12">
              Agent Interviewの特徴
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-primary"
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
                </div>
                <h4 className="text-lg font-semibold mb-2">
                  AIとの対話でエージェント作成
                </h4>
                <p className="text-muted-foreground">
                  自然な会話を通じて、あなたの経験やスキルを
                  AIが理解し、パーソナルエージェントを構築します。
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-primary"
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
                </div>
                <h4 className="text-lg font-semibold mb-2">
                  ドキュメントアップロード
                </h4>
                <p className="text-muted-foreground">
                  履歴書やポートフォリオをアップロードすると、
                  AIがその内容を理解し、エージェントに統合します。
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold mb-2">
                  非同期面接
                </h4>
                <p className="text-muted-foreground">
                  採用担当者はいつでもあなたのエージェントと
                  対話でき、時間や場所の制約を解消します。
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h3 className="text-2xl font-bold text-center mb-12">
              利用の流れ
            </h3>
            <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
              <div>
                <h4 className="text-lg font-semibold mb-4 text-primary">
                  求職者の方
                </h4>
                <ol className="space-y-4">
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                      1
                    </span>
                    <div>
                      <p className="font-medium">Googleアカウントで登録</p>
                      <p className="text-sm text-muted-foreground">
                        簡単にアカウントを作成
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                      2
                    </span>
                    <div>
                      <p className="font-medium">AIと対話・ドキュメント投稿</p>
                      <p className="text-sm text-muted-foreground">
                        経験やスキルを伝える
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                      3
                    </span>
                    <div>
                      <p className="font-medium">エージェントを公開</p>
                      <p className="text-sm text-muted-foreground">
                        採用担当者からの面接を待つ
                      </p>
                    </div>
                  </li>
                </ol>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4 text-primary">
                  採用担当者の方
                </h4>
                <ol className="space-y-4">
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                      1
                    </span>
                    <div>
                      <p className="font-medium">Googleアカウントで登録</p>
                      <p className="text-sm text-muted-foreground">
                        会社名を入力して登録
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                      2
                    </span>
                    <div>
                      <p className="font-medium">エージェント一覧を確認</p>
                      <p className="text-sm text-muted-foreground">
                        公開されているエージェントを探す
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                      3
                    </span>
                    <div>
                      <p className="font-medium">エージェントと面接</p>
                      <p className="text-sm text-muted-foreground">
                        いつでも非同期で対話
                      </p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-2xl font-bold mb-4">
              今すぐAgent Interviewを始めましょう
            </h3>
            <p className="mb-8 text-primary-foreground/80">
              無料で登録して、新しい採用体験を
            </p>
            <Link href="/login">
              <Button size="lg" variant="secondary" className="px-8">
                無料で始める
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 Agent Interview. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
