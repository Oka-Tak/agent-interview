"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AgentInfo {
  id: string;
  user: {
    id: string;
    name: string;
  };
  fragments: {
    type: string;
    content: string;
    skills: string[];
  }[];
}

interface Note {
  id: string;
  content: string;
  createdAt: string;
}

interface Evaluation {
  id: string;
  overallRating: number;
  technicalRating: number;
  communicationRating: number;
  cultureRating: number;
  matchScore: number | null;
  comment: string | null;
}

export default function InterviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [agentInfo, setAgentInfo] = useState<AgentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [evalForm, setEvalForm] = useState({
    overallRating: 3,
    technicalRating: 3,
    communicationRating: 3,
    cultureRating: 3,
    comment: "",
  });
  const [isSavingEval, setIsSavingEval] = useState(false);

  const fetchAgentInfo = useCallback(async () => {
    try {
      const response = await fetch(`/api/agents/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setAgentInfo(data.agent);
      }
    } catch (error) {
      console.error("Failed to fetch agent info:", error);
    }
  }, [resolvedParams.id]);

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/interview/${resolvedParams.id}/messages`
      );
      if (response.ok) {
        const data = await response.json();
        setMessages(
          data.messages.map((m: { id: string; senderType: string; content: string }) => ({
            id: m.id,
            role: m.senderType === "RECRUITER" ? "user" : "assistant",
            content: m.content,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setIsFetching(false);
    }
  }, [resolvedParams.id]);

  const fetchNotes = useCallback(async () => {
    try {
      const response = await fetch(`/api/interview/${resolvedParams.id}/notes`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes);
      }
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    }
  }, [resolvedParams.id]);

  const fetchEvaluation = useCallback(async () => {
    try {
      const response = await fetch(`/api/interview/${resolvedParams.id}/evaluation`);
      if (response.ok) {
        const data = await response.json();
        if (data.evaluation) {
          setEvaluation(data.evaluation);
          setEvalForm({
            overallRating: data.evaluation.overallRating,
            technicalRating: data.evaluation.technicalRating,
            communicationRating: data.evaluation.communicationRating,
            cultureRating: data.evaluation.cultureRating,
            comment: data.evaluation.comment || "",
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch evaluation:", error);
    }
  }, [resolvedParams.id]);

  useEffect(() => {
    fetchAgentInfo();
    fetchMessages();
    fetchNotes();
    fetchEvaluation();
  }, [fetchAgentInfo, fetchMessages, fetchNotes, fetchEvaluation]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/interview/${resolvedParams.id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "申し訳ありません。エラーが発生しました。もう一度お試しください。",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setIsAddingNote(true);
    try {
      const response = await fetch(`/api/interview/${resolvedParams.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNote }),
      });
      if (response.ok) {
        setNewNote("");
        fetchNotes();
      }
    } catch (error) {
      console.error("Failed to add note:", error);
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleSaveEvaluation = async () => {
    setIsSavingEval(true);
    try {
      const response = await fetch(`/api/interview/${resolvedParams.id}/evaluation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(evalForm),
      });
      if (response.ok) {
        const data = await response.json();
        setEvaluation(data.evaluation);
        alert("評価を保存しました");
      }
    } catch (error) {
      console.error("Failed to save evaluation:", error);
    } finally {
      setIsSavingEval(false);
    }
  };

  const RatingInput = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
  }) => (
    <div className="space-y-1">
      <div className="flex justify-between">
        <span className="text-sm">{label}</span>
        <span className="text-sm font-medium">{value}/5</span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`w-8 h-8 rounded ${
              n <= value ? "bg-primary text-white" : "bg-gray-200"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );

  if (isFetching) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  if (!agentInfo) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          エージェントが見つかりません
        </p>
        <Link href="/recruiter/agents">
          <Button>エージェント一覧に戻る</Button>
        </Link>
      </div>
    );
  }

  const allSkills = new Set(
    agentInfo.fragments.flatMap((f) => f.skills)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/recruiter/agents">
          <Button variant="ghost" size="sm">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            戻る
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-white">
              {agentInfo.user.name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold">{agentInfo.user.name}</h1>
            <p className="text-sm text-muted-foreground">AIエージェントとの面接</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-16rem)]">
        <div className="lg:col-span-3">
          <Card className="h-full flex flex-col">
            <CardContent className="flex-1 p-0 overflow-hidden">
              <ChatWindow
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                userName={session?.user?.companyName || undefined}
                placeholder={`${agentInfo.user.name}さんのエージェントに質問...`}
              />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4 overflow-y-auto">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">候補者情報</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium">スキル</p>
                <div className="flex flex-wrap gap-1">
                  {allSkills.size > 0 ? (
                    Array.from(allSkills).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">情報なし</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">メモ・評価</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="notes">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="notes">メモ</TabsTrigger>
                  <TabsTrigger value="evaluation">評価</TabsTrigger>
                </TabsList>
                <TabsContent value="notes" className="space-y-3 mt-3">
                  <div className="space-y-2">
                    <Textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="メモを入力..."
                      className="min-h-[80px]"
                    />
                    <Button
                      size="sm"
                      onClick={handleAddNote}
                      disabled={!newNote.trim() || isAddingNote}
                    >
                      {isAddingNote ? "追加中..." : "メモを追加"}
                    </Button>
                  </div>
                  {notes.length > 0 && (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {notes.map((note) => (
                        <div key={note.id} className="p-2 bg-gray-50 rounded text-sm">
                          <p>{note.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(note.createdAt).toLocaleString("ja-JP")}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="evaluation" className="space-y-4 mt-3">
                  <RatingInput
                    label="総合評価"
                    value={evalForm.overallRating}
                    onChange={(v) => setEvalForm({ ...evalForm, overallRating: v })}
                  />
                  <RatingInput
                    label="技術力"
                    value={evalForm.technicalRating}
                    onChange={(v) => setEvalForm({ ...evalForm, technicalRating: v })}
                  />
                  <RatingInput
                    label="コミュニケーション"
                    value={evalForm.communicationRating}
                    onChange={(v) => setEvalForm({ ...evalForm, communicationRating: v })}
                  />
                  <RatingInput
                    label="カルチャーフィット"
                    value={evalForm.cultureRating}
                    onChange={(v) => setEvalForm({ ...evalForm, cultureRating: v })}
                  />
                  <div className="space-y-1">
                    <span className="text-sm">コメント</span>
                    <Textarea
                      value={evalForm.comment}
                      onChange={(e) => setEvalForm({ ...evalForm, comment: e.target.value })}
                      placeholder="評価コメント..."
                      className="min-h-[60px]"
                    />
                  </div>
                  <Button
                    onClick={handleSaveEvaluation}
                    disabled={isSavingEval}
                    className="w-full"
                  >
                    {isSavingEval ? "保存中..." : "評価を保存"}
                  </Button>
                  {evaluation?.matchScore && (
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <p className="text-sm font-medium">AIマッチ度スコア</p>
                      <p className="text-2xl font-bold text-primary">
                        {evaluation.matchScore}%
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
