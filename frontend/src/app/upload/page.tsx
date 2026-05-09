"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileDropzone } from "@/components/upload/file-dropzone";

const MIN_JD_LENGTH = 50;

export default function UploadPage() {
  const router = useRouter();
  const [coverLetter, setCoverLetter] = React.useState<File | null>(null);
  const [resume, setResume] = React.useState<File | null>(null);
  const [jobDescription, setJobDescription] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const jdLen = jobDescription.trim().length;
  const canSubmit = !!coverLetter && !!resume && jdLen >= MIN_JD_LENGTH;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    // TODO: 백엔드 머지 후 POST /session/start 로 교체.
    // 지금은 다음 화면(분석 중)으로 이동만.
    router.push("/analyzing");
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-12 px-4 py-16 sm:px-6 sm:py-20">
      {/* Title */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Step 01 · 자료 올리기
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          모의 면접에 쓸 자료를 올려주세요.
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          자소서·이력서 PDF와 채용공고 텍스트를 올리면 회사·직무에 맞춘 질문을
          만들어 드립니다.
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-8">
        {/* PDFs */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FileDropzone
            label="자소서 PDF"
            description="작성하신 자기소개서. 답변에 인용됩니다."
            file={coverLetter}
            onChange={setCoverLetter}
          />
          <FileDropzone
            label="이력서 PDF"
            description="프로젝트·역할·수치가 있을수록 좋습니다."
            file={resume}
            onChange={setResume}
          />
        </div>

        {/* JD */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="jd">채용공고 텍스트</Label>
          <p className="text-xs text-muted-foreground">
            전체 본문을 복사해 붙여넣어 주세요. 직무·자격요건·우대사항이 있으면
            더 정확합니다.
          </p>
          <Textarea
            id="jd"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="회사명: ...&#10;직무: ...&#10;자격요건: ..."
            rows={8}
            className="min-h-[180px] resize-y"
          />
          <p
            className={`text-xs ${
              jdLen >= MIN_JD_LENGTH
                ? "text-muted-foreground"
                : "text-muted-foreground"
            }`}
          >
            {jdLen}자 / 최소 {MIN_JD_LENGTH}자
          </p>
        </div>

        {/* Company */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="company">
            회사명{" "}
            <span className="text-xs font-normal text-muted-foreground">
              (선택)
            </span>
          </Label>
          <p className="text-xs text-muted-foreground">
            입력하면 회사 인재상·기술 스택·최근 동향을 검색해 컨텍스트로
            활용합니다.
          </p>
          <Input
            id="company"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="예: 카카오"
          />
        </div>

        {/* Submit */}
        <div className="flex flex-col items-start gap-3">
          <Button
            type="submit"
            size="lg"
            disabled={!canSubmit || submitting}
            className="rounded-full px-7 transition-transform hover:scale-105 disabled:hover:scale-100"
          >
            {submitting ? "분석 시작 중..." : "분석 시작하기"}
            <ArrowRight className="ml-1 size-4" />
          </Button>
          {!canSubmit && (
            <p className="text-xs text-muted-foreground">
              자소서 PDF · 이력서 PDF · 채용공고 텍스트({MIN_JD_LENGTH}자
              이상)는 필수입니다.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
