"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";

// 백엔드 통합 전: 가짜 progressing simulation.
// 머지 후엔 실제 stage 이벤트(SSE 또는 polling)에 맞춰 currentIdx 갱신.
const STEPS = [
  { id: "indexing", label: "자소서·이력서 인덱싱", duration: 1800 },
  { id: "company", label: "회사 정보 수집", duration: 2200 },
  { id: "job", label: "직무 분류", duration: 1500 },
];

const READY_DELAY_MS = 1200;

export default function AnalyzingPage() {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = React.useState(0);

  // 단계 진행
  React.useEffect(() => {
    if (currentIdx >= STEPS.length) return;
    const id = setTimeout(() => {
      setCurrentIdx((i) => i + 1);
    }, STEPS[currentIdx].duration);
    return () => clearTimeout(id);
  }, [currentIdx]);

  // 모든 단계 완료 시 면접 화면으로
  React.useEffect(() => {
    if (currentIdx < STEPS.length) return;
    const id = setTimeout(() => router.push("/interview"), READY_DELAY_MS);
    return () => clearTimeout(id);
  }, [currentIdx, router]);

  const allDone = currentIdx >= STEPS.length;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-10 px-4 py-24 sm:py-32">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {allDone ? "면접 준비 완료." : "자료를 분석하고 있어요."}
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {allDone
            ? "잠시 후 첫 질문이 시작됩니다."
            : "회사·직무에 맞춘 질문을 만들기 위해 자료를 정리하는 중입니다."}
        </p>
      </div>

      <ol className="flex flex-col gap-3">
        {STEPS.map((step, i) => {
          const status =
            i < currentIdx ? "done" : i === currentIdx ? "active" : "pending";
          return (
            <motion.li
              key={step.id}
              animate={{ opacity: status === "pending" ? 0.45 : 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-4"
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border transition-colors",
                  status === "done" &&
                    "border-primary bg-primary text-primary-foreground",
                  status === "active" &&
                    "border-accent bg-accent/10 text-accent",
                  status === "pending" &&
                    "border-border bg-muted/40 text-muted-foreground",
                )}
              >
                {status === "done" ? (
                  <Check className="size-4" strokeWidth={3} />
                ) : status === "active" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <span className="font-mono text-xs">{i + 1}</span>
                )}
              </span>
              <p
                className={cn(
                  "text-sm",
                  status === "active" && "font-medium text-foreground",
                  status === "pending" && "text-muted-foreground",
                )}
              >
                {step.label}
              </p>
            </motion.li>
          );
        })}
      </ol>

      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
          >
            <Check className="size-4 text-primary" strokeWidth={3} />
            <span>모든 준비가 끝났습니다.</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
