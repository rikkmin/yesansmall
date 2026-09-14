# 예산 계산기

여비, 사례비, 업무추진비를 간단히 계산하는 정적 웹페이지입니다.

## 파일 구성

- `index.html`: 계산기 화면
- `styles.css`: 화면 스타일
- `app.js`: 여비, 사례비, 업무추진비 계산 로직
- `sources/rules.json`: 계산 기준 데이터
- `sources/*.md`: 계산 기준을 확인한 규정 마크다운 자료

## 로컬 실행

```powershell
python -m http.server 8788
```

브라우저에서 `http://127.0.0.1:8788/`을 엽니다.
