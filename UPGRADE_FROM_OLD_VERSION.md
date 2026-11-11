# 배포 오류 복구 — v1.2.2 전체 교체

## 이 오류의 원인

로그가 `ptcg-canvas@1.1.1`로 시작하는데 `formats-recipe.test.mjs`가 실행되고 12개 통과 / 8개 실패한다면 구버전 코드·데이터와 새 테스트가 섞인 상태입니다. 그 조합으로 동일 오류를 재현했습니다.

- `Missing fixture: 하이퍼볼`, `애프룡`: 카드가 없는 것이 아니라 구버전 카드 데이터에 새 테스트가 요구하는 시리즈 필드가 없습니다.
- `collectionNumber.includes` 오류: 구버전 데이터에 레시피용 컬렉션 번호가 없습니다.
- `undefined` / `expanded`, 장수·동명 카드 검사 실패: 구버전 `public/core.js`에는 새 형식 검사와 JSON 복원 처리가 없습니다.

테스트 삭제나 건너뛰기로 해결하지 마세요. v1.2.2 ZIP은 기존 기능, 보정된 데이터, 공식 양식, 21단계 튜토리얼이 함께 들어 있는 전체 패키지입니다.

## 기존 저장소에 반영하기

1. 받은 ZIP을 **새 빈 폴더**에 풉니다. ZIP 안의 `package.json`이 `1.2.2`인지 확인합니다.
2. 압축을 푼 폴더의 **내용 전체**를 기존 `PTCG_Deck_Maker` 저장소 폴더에 복사합니다. 같은 이름이 있으면 **모든 파일 바꾸기/덮어쓰기**를 선택합니다. 새 파일만 추가하면 안 됩니다.
3. `.github` 폴더까지 포함했는지 확인합니다. `package.json`, `public/`, `scripts/`, `tests/`, `.github/`, `BUILD_INFO.json`, `RELEASE_MANIFEST.json`은 모두 저장소 루트에 있어야 합니다. ZIP 또는 상위 폴더 자체를 올리는 방식은 사용하지 않습니다.
4. **변경 파일 전체를 커밋하고 main에 push**합니다. GitHub Desktop이라면 모든 변경 파일을 체크한 뒤 Commit → Push origin을 누릅니다. `.git` 폴더나 관계없는 파일은 지울 필요가 없습니다.
5. GitHub Actions에서 **방금 push한 새 커밋의 실행**을 확인합니다. 예전 실패 실행의 `Re-run jobs`는 예전 커밋을 다시 실행하므로 수정 내용이 반영되지 않습니다.

터미널을 사용한다면, 전체 파일을 덮어쓴 후 기존 저장소 폴더에서:

```bash
git status --short
git add .
git commit -m "Fix mixed PTCG release files with v1.2.2"
git push origin main
```

웹에서 업로드한다면 기존 파일과 같은 경로에 전체 내용을 올리고 커밋하세요. 특히 기존 `package.json`, `public/core.js`, `public/data/cards.json`과 `cards.json.gz`가 실제로 교체됐는지 확인하세요.

## 정상 실행 확인

새 워크플로의 첫 검사는 다음을 표시합니다.

```text
Verified PTCG Canvas v1.2.2: 27 matching release files.
```

그 다음 기능 테스트 22개가 통과하고 소스 ZIP 생성 → 빌드 → 배포 파일 검사 → Pages 배포가 진행됩니다. 패키지 내부에서 확인한 결과와 사용자 GitHub 저장소의 실제 원격 실행 성공은 별개이므로 최종 Actions 상태도 확인하세요.

로컬에서도 Node.js 22 이상에서 다음과 같이 확인할 수 있습니다.

```bash
npm run check
python3 scripts/package-source.py
npm run build
npm run verify:build
```

Windows에서 `python3`가 없다면 해당 줄만 `py -3 scripts/package-source.py`로 실행합니다. npm 의존성 설치는 필요 없습니다.

`Mixed or incomplete PTCG Canvas release`가 뜨면 아래에 표시된 파일이 아직 다른 버전이거나 누락·수정된 것입니다. ZIP의 파일을 다시 함께 덮어쓰고 커밋하세요. 체크섬 파일만 재생성해서 이 오류를 숨기면 구버전 기능은 고쳐지지 않습니다.
