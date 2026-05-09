"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// 백엔드 통합 전: 정훈님 report_generator 출력 mock.
// TODO(통합): GET /session/{id}/report 응답으로 교체.
//   schema: { overall_score, category_scores, weakness_summary, improvement_suggestions }
const MOCK_REPORT = {
  overall_score: 3.42,
  category_scores: {
    역량: 4.0,
    경험: 2.25,
    문제해결: 3.5,
    협업: 3.0,
  } as Record<string, number>,
  weakness_summary: [
    "구체성 부족",
    "수치 인용 부족",
    "트레이드오프 설명 부족",
    "직무 관련성 약함",
  ],
  improvement_suggestions:
    "지원자님, 모의 면접 결과 '구체성 부족'이 주요 약점으로 드러났습니다. 특히 '트랜잭션 처리량이 5배 증가했다'처럼 구체적인 수치를 제시해야 합니다. 또한 STAR(상황·과제·행동·결과) 구조에 따라 답변을 보강해보세요. 예를 들어 'Kafka 도입 전후의 처리량 비교 수치를 제시하고, 그 차이가 어떻게 발생했는지 설명'하는 방식으로 답변을 구성해보면 좋습니다. 도메인 키워드를 적절히 활용해 전문성을 드러내는 것도 중요합니다.",
};

const CATEGORY_ORDER = ["역량", "경험", "문제해결", "협업", "적합성"];

function scoreLabel(score: number): string {
  if (score >= 4.0) return "우수";
  if (score >= 3.0) return "양호";
  if (score >= 2.0) return "보강 필요";
  return "재학습 권장";
}

export default function ReportPage() {
  const {
    overall_score,
    category_scores,
    weakness_summary,
    improvement_suggestions,
  } = MOCK_REPORT;

  // 정훈님 모듈 그대로: 등장 안 한 카테고리는 제외, CATEGORY_ORDER 순서 보장
  const orderedCategories = CATEGORY_ORDER.filter(
    (c) => c in category_scores,
  ).map((c) => ({ name: c, score: category_scores[c] }));

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-16 px-4 py-16 sm:px-6 sm:py-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-3"
      >
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Step 04 · 종합 리포트
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          면접이 끝났습니다.
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          STAR · 구체성 · 직무 관련성 · 일관성 네 축으로 답변을 진단하고, 자주
          드러난 약점과 개선 방향을 정리했습니다.
        </p>
      </motion.div>

      <OverallScore score={overall_score} />
      <CategoryScores categories={orderedCategories} />
      <WeaknessSummary tags={weakness_summary} />
      <CoachingCard text={improvement_suggestions} />

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-3 border-t border-border/60 pt-12 sm:flex-row"
      >
        <Button
          asChild
          size="lg"
          className="rounded-full px-7 transition-transform hover:scale-105"
        >
          <Link href="/upload">
            새 면접 시작
            <ArrowRight className="ml-1 size-4" />
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="rounded-full px-7"
        >
          <Link href="/">처음으로</Link>
        </Button>
      </motion.div>
    </div>
  );
}

function OverallScore({ score }: { score: number }) {
  const percentage = Math.min(100, (score / 5) * 100);

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center gap-5 rounded-3xl border border-border/60 bg-card p-8 text-center sm:p-12"
    >
      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
        Overall Score
      </p>
      <div className="flex items-baseline gap-1">
        <p className="text-6xl font-bold tracking-tight sm:text-7xl">
          {score.toFixed(2)}
        </p>
        <p className="text-2xl text-muted-foreground sm:text-3xl">/5</p>
      </div>
      <p className="text-sm font-medium text-muted-foreground">
        {scoreLabel(score)}
      </p>
      <div className="h-1.5 w-full max-w-md overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${percentage}%` }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="h-full bg-primary"
        />
      </div>
    </motion.section>
  );
}

function CategoryScores({
  categories,
}: {
  categories: { name: string; score: number }[];
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-1">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Category Scores
        </p>
        <h2 className="text-xl font-semibold tracking-tight">
          카테고리별 평균
        </h2>
      </div>
      <div className="flex flex-col gap-4">
        {categories.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="flex flex-col gap-1.5"
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-medium">{c.name}</p>
              <p className="font-mono text-sm">
                {c.score.toFixed(2)}
                <span className="text-muted-foreground">/5</span>
              </p>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${(c.score / 5) * 100}%` }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.8,
                  delay: 0.2 + i * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="h-full bg-primary"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

function WeaknessSummary({ tags }: { tags: string[] }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Weakness Summary
        </p>
        <h2 className="text-xl font-semibold tracking-tight">
          자주 드러난 약점{" "}
          <span className="text-sm font-normal text-muted-foreground">
            · Top {tags.length}
          </span>
        </h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, i) => (
          <motion.span
            key={tag}
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium",
              i === 0
                ? "border-warning/40 bg-warning/15 text-warning"
                : "border-border/60 bg-muted text-muted-foreground",
            )}
          >
            {tag}
          </motion.span>
        ))}
      </div>
    </motion.section>
  );
}

function CoachingCard({ text }: { text: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Coaching
        </p>
        <h2 className="text-xl font-semibold tracking-tight">
          다음 면접에서 바꿀 행동
        </h2>
      </div>
      <div className="rounded-2xl border-l-2 border-l-accent border-y border-r border-y-border/60 border-r-border/60 bg-card p-6 sm:p-8">
        <p className="whitespace-pre-line text-sm leading-relaxed sm:text-base">
          {text}
        </p>
      </div>
    </motion.section>
  );
}
