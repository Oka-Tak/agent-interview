"use client";

import Link from "next/link";
import { type MouseEvent, useCallback, useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Interest {
  id: string;
  status: "EXPRESSED" | "CONTACT_REQUESTED" | "CONTACT_DISCLOSED" | "DECLINED";
  message: string | null;
  createdAt: string;
  updatedAt: string;
  recruiter: {
    id: string;
    companyName: string;
  };
  lastMessage: {
    content: string;
    senderType: "USER" | "RECRUITER";
    createdAt: string;
  } | null;
  messageCount: number;
}

interface DirectMessage {
  id: string;
  content: string;
  senderType: "USER" | "RECRUITER";
  createdAt: string;
  recruiter: { companyName: string } | null;
  user: { name: string } | null;
}

type FilterStatus =
  | "ALL"
  | "EXPRESSED"
  | "CONTACT_REQUESTED"
  | "CONTACT_DISCLOSED"
  | "DECLINED";

const statusStyles: Record<string, { label: string; className: string }> = {
  EXPRESSED: {
    label: "興味表明",
    className: "bg-primary/10 text-primary",
  },
  CONTACT_REQUESTED: {
    label: "リクエスト中",
    className: "bg-amber-500/10 text-amber-600",
  },
  CONTACT_DISCLOSED: {
    label: "開示済み",
    className: "bg-emerald-500/10 text-emerald-600",
  },
  DECLINED: {
    label: "辞退",
    className: "bg-muted text-muted-foreground",
  },
};

const filterOptions: { value: FilterStatus; label: string }[] = [
  { value: "ALL", label: "すべて" },
  { value: "EXPRESSED", label: "新着" },
  { value: "CONTACT_REQUESTED", label: "リクエスト中" },
  { value: "CONTACT_DISCLOSED", label: "開示済み" },
  { value: "DECLINED", label: "辞退" },
];

export default function InboxPage() {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [agentStatus, setAgentStatus] = useState<"PUBLIC" | "PRIVATE" | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [selectedInterest, setSelectedInterest] = useState<Interest | null>(
    null,
  );
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [messageContent, setMessageContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [accessPreference, setAccessPreference] = useState<
    Record<string, "NONE" | "ALLOW" | "DENY">
  >({});
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [actionErrors, setActionErrors] = useState<Record<string, string>>({});
  const [declineTarget, setDeclineTarget] = useState<Interest | null>(null);
  const [declineError, setDeclineError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [inboxRes, agentRes] = await Promise.all([
        fetch("/api/applicant/inbox"),
        fetch("/api/agents/me"),
      ]);

      if (inboxRes.ok) {
        const data = await inboxRes.json();
        setInterests(data.interests);
      }
      if (agentRes.ok) {
        const data = await agentRes.json();
        setAgentStatus(data.agent?.status ?? null);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshInterests = useCallback(async () => {
    try {
      const response = await fetch("/api/applicant/inbox");
      if (response.ok) {
        const data = await response.json();
        setInterests(data.interests);
      }
    } catch (error) {
      console.error("Failed to refresh interests:", error);
    }
  }, []);

  const fetchMessages = useCallback(async (interestId: string) => {
    try {
      const response = await fetch(
        `/api/applicant/inbox/${interestId}/messages`,
      );
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (selectedInterest) {
      fetchMessages(selectedInterest.id);
    }
  }, [selectedInterest, fetchMessages]);

  const handleSendMessage = async () => {
    if (!selectedInterest || !messageContent.trim()) return;

    setIsSending(true);
    setMessageError(null);
    try {
      const response = await fetch(
        `/api/applicant/inbox/${selectedInterest.id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: messageContent }),
        },
      );

      if (response.ok) {
        setMessageContent("");
        fetchMessages(selectedInterest.id);
        refreshInterests();
      } else {
        const data = await response.json();
        setMessageError(data.error || "エラーが発生しました");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessageError("エラーが発生しました");
    } finally {
      setIsSending(false);
    }
  };

  const openMessageDialog = (interest: Interest) => {
    setSelectedInterest(interest);
    setMessages([]);
    setMessageContent("");
    setMessageError(null);
  };

  const handleApproveDisclosure = async (interestId: string) => {
    const preference =
      accessPreference[interestId] === "ALLOW" ? "ALLOW" : "NONE";

    setIsUpdating(interestId);
    setActionErrors((prev) => ({ ...prev, [interestId]: "" }));
    try {
      const response = await fetch(
        `/api/applicant/inbox/${interestId}/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ preference }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        setActionErrors((prev) => ({
          ...prev,
          [interestId]: data.error || "エラーが発生しました",
        }));
        return;
      }

      await refreshInterests();
    } catch (error) {
      console.error("Failed to approve disclosure:", error);
      setActionErrors((prev) => ({
        ...prev,
        [interestId]: "エラーが発生しました",
      }));
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDeclineDisclosure = async (interestId: string) => {
    const preference =
      accessPreference[interestId] === "DENY" ? "DENY" : "NONE";

    setDeclineError(null);
    setIsUpdating(interestId);
    try {
      const response = await fetch(
        `/api/applicant/inbox/${interestId}/decline`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ preference }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        setDeclineError(data.error || "エラーが発生しました");
        return;
      }

      await refreshInterests();
      setDeclineTarget(null);
    } catch (error) {
      console.error("Failed to decline disclosure:", error);
      setDeclineError("エラーが発生しました");
    } finally {
      setIsUpdating(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="size-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const newCount = interests.filter((i) => i.status === "EXPRESSED").length;
  const disclosedCount = interests.filter(
    (i) => i.status === "CONTACT_DISCLOSED",
  ).length;

  const filteredInterests =
    filterStatus === "ALL"
      ? interests
      : interests.filter((i) => i.status === filterStatus);

  return (
    <div className="space-y-8">
      {/* ヘッダー + インライン統計 */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">受信箱</h1>
          <p className="text-sm text-muted-foreground mt-1">
            企業からの関心を確認
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-center p-2 rounded-lg bg-secondary/50">
            <p className="text-base font-bold tabular-nums text-foreground">
              {newCount}
            </p>
            <p className="text-[10px] text-muted-foreground">新着</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-secondary/50">
            <p className="text-base font-bold tabular-nums text-foreground">
              {interests.length}
            </p>
            <p className="text-[10px] text-muted-foreground">全体</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-secondary/50">
            <p className="text-base font-bold tabular-nums text-foreground">
              {disclosedCount}
            </p>
            <p className="text-[10px] text-muted-foreground">開示済み</p>
          </div>
        </div>
      </div>

      {/* ステータスフィルタ */}
      <div className="flex items-center gap-0 border-b">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFilterStatus(option.value)}
            className={cn(
              "px-3 pb-2.5 text-sm transition-colors -mb-px",
              filterStatus === option.value
                ? "text-foreground font-medium border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground border-b-2 border-transparent",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* コンテンツ */}
      {interests.length === 0 ? (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="h-[2px] bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="size-10 rounded-lg bg-secondary flex items-center justify-center">
              <svg
                className="size-5 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              まだ企業からの興味表明はありません
            </p>
            {agentStatus === "PUBLIC" ? (
              <p className="text-xs text-muted-foreground text-center">
                エージェントは公開中です — 企業からの反応をお待ちください
              </p>
            ) : (
              <>
                <p className="text-xs text-muted-foreground text-center">
                  エージェントを公開すると、企業から興味表明を受け取れます
                </p>
                <Link href="/agent">
                  <Button variant="outline" size="sm">
                    エージェントを公開する
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      ) : filteredInterests.length === 0 ? (
        <div className="rounded-xl border bg-card">
          <div className="flex flex-col items-center justify-center py-16 space-y-2">
            <p className="text-sm text-muted-foreground">
              該当するアイテムがありません
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b">
            <p className="text-[10px] tracking-widest text-muted-foreground uppercase">
              インタレスト
            </p>
            <p className="text-xs text-muted-foreground tabular-nums">
              {filteredInterests.length} 件
            </p>
          </div>
          {filteredInterests.map((interest, index) => (
            <div
              key={interest.id}
              className={cn(
                "px-5 py-4 hover:bg-secondary/30 transition-colors",
                index < filteredInterests.length - 1 && "border-b",
              )}
            >
              <div className="flex items-start gap-3">
                <Avatar className="size-9 shrink-0 mt-0.5">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                    {interest.recruiter.companyName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold truncate">
                      {interest.recruiter.companyName}
                    </h3>
                    <span
                      className={cn(
                        "text-[10px] font-medium px-2 py-0.5 rounded-md shrink-0",
                        statusStyles[interest.status]?.className,
                      )}
                    >
                      {statusStyles[interest.status]?.label || interest.status}
                    </span>
                  </div>
                  {interest.lastMessage ? (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {interest.lastMessage.senderType === "USER"
                        ? "あなた"
                        : interest.recruiter.companyName}
                      : {interest.lastMessage.content}
                    </p>
                  ) : interest.message ? (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {interest.message}
                    </p>
                  ) : null}
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground tabular-nums">
                    <span>
                      {new Date(interest.createdAt).toLocaleDateString("ja-JP")}
                    </span>
                    {interest.messageCount > 0 && (
                      <span>{interest.messageCount} 件</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                  {interest.status === "CONTACT_DISCLOSED" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => openMessageDialog(interest)}
                    >
                      メッセージ
                    </Button>
                  )}
                  {interest.status === "CONTACT_REQUESTED" && (
                    <>
                      <Select
                        value={accessPreference[interest.id] || "NONE"}
                        onValueChange={(value) =>
                          setAccessPreference((prev) => ({
                            ...prev,
                            [interest.id]: value as "NONE" | "ALLOW" | "DENY",
                          }))
                        }
                      >
                        <SelectTrigger className="h-8 text-xs w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NONE">今回のみ</SelectItem>
                          <SelectItem value="ALLOW">自動許可</SelectItem>
                          <SelectItem value="DENY">自動拒否</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => handleApproveDisclosure(interest.id)}
                          disabled={isUpdating === interest.id}
                        >
                          開示する
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs"
                          onClick={() => {
                            setDeclineTarget(interest);
                            setDeclineError(null);
                          }}
                          disabled={isUpdating === interest.id}
                        >
                          辞退
                        </Button>
                      </div>
                    </>
                  )}
                  {interest.status === "EXPRESSED" && (
                    <span className="text-[10px] text-muted-foreground">
                      リクエスト待ち
                    </span>
                  )}
                  {interest.status === "DECLINED" && (
                    <span className="text-[10px] text-muted-foreground">
                      辞退済み
                    </span>
                  )}
                </div>
              </div>
              {actionErrors[interest.id] && (
                <p className="text-xs text-destructive mt-2 ml-12" role="alert">
                  {actionErrors[interest.id]}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* メッセージDialog */}
      <Dialog
        open={!!selectedInterest}
        onOpenChange={() => setSelectedInterest(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedInterest?.recruiter.companyName}とのメッセージ
            </DialogTitle>
            <DialogDescription>
              企業とメッセージのやり取りができます
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-80 border rounded-lg p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-2">
                <div className="size-8 rounded-lg bg-secondary flex items-center justify-center">
                  <svg
                    className="size-4 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-muted-foreground">
                  まだメッセージはありません
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.senderType === "USER"
                        ? "justify-end"
                        : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-4 py-2",
                        message.senderType === "USER"
                          ? "bg-primary text-white"
                          : "bg-secondary",
                      )}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={cn(
                          "text-xs mt-1 tabular-nums",
                          message.senderType === "USER"
                            ? "text-white/70"
                            : "text-muted-foreground",
                        )}
                      >
                        {new Date(message.createdAt).toLocaleString("ja-JP")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {selectedInterest?.status === "CONTACT_DISCLOSED" && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Textarea
                  placeholder="メッセージを入力..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  className="flex-1"
                  rows={2}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isSending || !messageContent.trim()}
                >
                  送信
                </Button>
              </div>
              {messageError && (
                <p className="text-xs text-destructive" role="alert">
                  {messageError}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 辞退確認AlertDialog */}
      <AlertDialog
        open={!!declineTarget}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setDeclineTarget(null);
            setDeclineError(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>連絡先開示を辞退しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              辞退すると、この企業からの連絡先リクエストは拒否されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event: MouseEvent<HTMLButtonElement>) => {
                event.preventDefault();
                if (declineTarget) {
                  handleDeclineDisclosure(declineTarget.id);
                }
              }}
              disabled={isUpdating === declineTarget?.id}
            >
              辞退する
            </AlertDialogAction>
          </AlertDialogFooter>
          {declineError && (
            <p className="text-xs text-destructive" role="alert">
              {declineError}
            </p>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
