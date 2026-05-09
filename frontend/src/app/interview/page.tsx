"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Category = "역량" | "경험" | "문제해결" | "협업" | "적합성";

interface Question {
  id: string;
  text: string;
  category: Category;
  isFollowup: boolean;
}

// 백엔드 통합 전: mock 질문 시퀀스.
// TODO(통합): POST /session/{id}/answer 응답으로 다음 question 또는 action 받기.
//   action: "retry" | "followup" | "next_question" | "can_report" | "force_end"
const MOCK_QUESTIONS: Question[] = [
  {
    id: "1",
    text: "자소서에 적은 프로젝트 중 가장 어려웠던 기술적 결정 하나만 들려주세요.",
    category: "역량",
    isFollowup: false,
  },
  {
    id: "1f",
    text: "왜 다른 대안이 아니라 그 선택이었나요? 결정의 결정적 근거를 좀 더 구체적으로 들려주실 수 있을까요?",
    category: "역량",
    isFollowup: true,
  },
  {
    id: "2",
    text: "협업 중 의견이 갈렸던 경험이 있다면, 어떻게 풀어가셨나요?",
    category: "협업",
    isFollowup: false,
  },
  {
    id: "3",
    text: "최근 프로젝트에서 가장 큰 문제를 발견했을 때, 어떤 순서로 접근했는지 들려주세요.",
    category: "문제해결",
    isFollowup: false,
  },
];

const MIN_ANSWER_LENGTH = 50;
const MIN_BUNDLES_FOR_REPORT = 2;

export default function InterviewPage() {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [answer, setAnswer] = React.useState("");
  const [bundleCount, setBundleCount] = React.useState(0);
  const [submitting, setSubmitting] = React.useState(false);

  const question = MOCK_QUESTIONS[currentIdx];
  const ansLen = answer.trim().length;
  const canSubmit = ansLen >= MIN_ANSWER_LENGTH && !submitting;
  const canReport = bundleCount >= MIN_BUNDLES_FOR_REPORT;
  const isLast = currentIdx === MOCK_QUESTIONS.length - 1;

  const onSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);

    // 평가 처리 시뮬 (백엔드: POST /session/{id}/answer)
    await new Promise((r) => setTimeout(r, 700));

    if (isLast) {
      router.push("/report");
      return;
    }

    // 다음이 메인 질문이면 현재 묶음 종료 → bundleCount++
    const next = MOCK_QUESTIONS[currentIdx + 1];
    if (!next.isFollowup) {
      setBundleCount((b) => b + 1);
    }
    setCurrentIdx((i) => i + 1);
    setAnswer("");
    setSubmitting(false);
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-12 sm:px-6 sm:py-16">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          묶음 {Math.min(bundleCount + 1, MOCK_QUESTIONS.length)} · 질문{" "}
          {currentIdx + 1}
        </p>
        {canReport && !isLast && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/report")}
            className="rounded-full"
          >
            리포트 먼저 보기
          </Button>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{
            width: `${((currentIdx + 1) / MOCK_QUESTIONS.length) * 100}%`,
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-5 rounded-2xl border border-border/60 bg-card p-6 sm:p-8"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
              {question.category}
            </span>
            {question.isFollowup && (
              <span className="rounded-full border border-warning/30 bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning">
                꼬리질문
              </span>
            )}
          </div>
          <p className="text-xl font-medium leading-relaxed sm:text-2xl">
            {question.text}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Answer */}
      <div className="flex flex-col gap-3">
        <Textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="구체적인 사례·수치·역할을 포함해 답변해주세요. STAR(상황·과제·행동·결과) 흐름이면 더 좋습니다."
          rows={6}
          className="min-h-[160px] resize-y"
          disabled={submitting}
        />
        <div className="flex items-center justify-between gap-3">
          <p
            className={
              ansLen >= MIN_ANSWER_LENGTH
                ? "text-xs text-muted-foreground"
                : "text-xs text-muted-foreground"
            }
          >
            {ansLen}자 / 최소 {MIN_ANSWER_LENGTH}자
          </p>
          <Button
            onClick={onSubmit}
            disabled={!canSubmit}
            size="lg"
            className="rounded-full px-6 transition-transform hover:scale-105 disabled:hover:scale-100"
          >
            {submitting ? "평가 중…" : isLast ? "마무리하고 리포트" : "답변 제출"}
            <Send className="ml-1 size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
