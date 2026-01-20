import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateChatResponse(
  systemPrompt: string,
  messages: { role: "user" | "assistant"; content: string }[]
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "system", content: systemPrompt }, ...messages],
    temperature: 0.7,
    max_tokens: 1000,
  });

  return response.choices[0]?.message?.content || "";
}

export async function extractFragments(
  conversationHistory: string
): Promise<{
  fragments: {
    type: string;
    content: string;
    skills: string[];
    keywords: string[];
  }[];
}> {
  const systemPrompt = `あなたは求職者との会話から重要な経験や能力を抽出するアシスタントです。
会話から以下のカテゴリに分類できる「記憶のかけら（Fragment）」を抽出してください：

- ACHIEVEMENT: 達成したこと、成果
- ACTION: 実行したアクション、行動
- CHALLENGE: 直面した課題、困難
- LEARNING: 学んだこと、気づき
- VALUE: 大切にしている価値観
- EMOTION: 感じた感情、モチベーション
- FACT: 事実情報（学歴、職歴など）
- SKILL_USAGE: スキルの使用例

各Fragmentには関連するスキルとキーワードも抽出してください。
JSON形式で返してください。`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: conversationHistory },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content || "{}";
  return JSON.parse(content);
}

export async function generateAgentSystemPrompt(
  fragments: { type: string; content: string }[],
  userName: string
): Promise<string> {
  const fragmentsSummary = fragments
    .map((f) => `[${f.type}]: ${f.content}`)
    .join("\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `以下の情報を元に、${userName}さんを代理して採用担当者と対話するAIエージェントのシステムプロンプトを生成してください。
エージェントは${userName}さんの経験や能力を適切に伝え、質問に答えられるようにしてください。`,
      },
      { role: "user", content: fragmentsSummary },
    ],
    temperature: 0.5,
  });

  return response.choices[0]?.message?.content || "";
}
