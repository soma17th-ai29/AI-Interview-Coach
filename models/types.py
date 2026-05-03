from dataclasses import dataclass, field
from typing import Literal

Category = Literal["CS", "프로젝트", "문제해결", "인성", "적합성"]

# 본인들 모듈에 맞는 dataClass 생성하고(데이터 타입 확인 목적), 오케스트레이션은 세션 관리 및 통합 할때 활용해야함