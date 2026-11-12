# PTCG Canvas — GitHub Pages 배포

너비를 조절하는 카드 도감, 접이식 필터·정렬, 덱 형식 연동 검색, 블랙/라이트 UI, 형식별 적법성 검사와 공식 레시피 내보내기가 포함된 v1.3.0 배포 패키지입니다. 카드 데이터가 함께 들어 있어 배포할 때 별도 데이터 API 키나 카드 수집 작업이 필요 없습니다.

## 기존 저장소 업데이트

먼저 [UPGRADE_FROM_OLD_VERSION.md](UPGRADE_FROM_OLD_VERSION.md)를 따르세요. 새로 추가된 파일만 올리면 구버전 코드·데이터가 남습니다. 기존 `package.json`, `public/`, `scripts/`, `tests/`, `.github/`도 모두 덮어쓰고 `RELEASE_MANIFEST.json`을 함께 커밋해야 합니다.

## 1. 압축 풀기

ZIP 내부 파일을 새 폴더에 풉니다. `package.json`, `public/`, `scripts/`, `tests/`, `.github/`가 같은 단계에 있어야 합니다. 압축파일 자체를 GitHub에 올리면 사이트가 실행되지 않습니다.

## 2. GitHub 저장소 만들기

GitHub에서 새 저장소를 만듭니다. 예: `ptcg-canvas`. 처음에는 README·라이선스·gitignore를 자동 추가하지 않은 빈 저장소로 만들면 아래 명령을 그대로 사용하기 쉽습니다. GitHub Free의 기본 배포 경로는 Public 저장소입니다.

## 3. Git으로 업로드

압축을 푼 폴더에서 터미널을 열고 실행합니다. `YOUR_USERNAME`과 `YOUR_REPOSITORY`는 본인 GitHub 사용자명과 실제 저장소명으로 바꿉니다.

```bash
git init -b main
git add .
git commit -m "Add PTCG Canvas"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

GitHub Desktop을 쓴다면 압축을 푼 폴더로 저장소를 만든 뒤 Commit → Publish repository를 사용해도 됩니다.

GitHub 웹 업로드를 쓸 때는 **폴더 내부 항목 전체**를 업로드하고 `.github/workflows/deploy-pages.yml`이 포함되었는지 확인하세요. `public/data/cards.json`도 필요하므로 빠뜨리지 않습니다.

## 4. Pages 설정

저장소에서 **Settings → Pages → Build and deployment → Source → GitHub Actions**를 선택합니다. 이 패키지에는 이미 워크플로가 들어 있으므로 별도 Jekyll 워크플로를 추가할 필요가 없습니다.

처음 push할 때 Pages 설정 전이라 실행이 실패했다면, 설정을 마친 뒤 다음 단계에서 다시 실행하면 됩니다.

## 5. 배포 실행 및 주소 확인

**Actions → Deploy PTCG Canvas to GitHub Pages → Run workflow → main → Run workflow**를 선택합니다.

버전 일치 검사 → 기능 테스트 → 소스 ZIP 생성 → 정적 빌드 → 자산 검사 → Pages 배포가 차례대로 진행됩니다. 작업이 성공하면 실행 결과 또는 Settings → Pages에 나온 주소로 접속하세요. 이후 `main` 브랜치에 push할 때마다 자동으로 갱신됩니다.

일반 프로젝트 주소 형식:

```text
https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/
```

저장소 이름에 맞춰 코드의 기본 경로를 수정할 필요는 없습니다. 페이지·스크립트·데이터·로컬 이미지가 상대 경로를 사용합니다.

## 로컬에서 먼저 실행

Node.js 24 권장. 외부 npm 의존성이 없어서 `npm install` 없이 실행합니다.

```bash
npm start
```

브라우저에서 `http://localhost:5173`에 접속합니다. `index.html`을 더블클릭하는 방식은 데이터 파일 읽기가 제한되므로 사용하지 않습니다.

## 배포와 같은 검사

```bash
npm run check
python3 scripts/package-source.py
npm run build
node scripts/verify-build.mjs
```

Windows에서 `python3` 명령이 없다면 두 번째 줄을 `py -3 scripts/package-source.py`로 실행하세요. Python은 소스 ZIP 재생성에만 사용합니다. 앱 실행과 카드 검색에는 필요하지 않습니다. GitHub Actions에서는 자동 실행됩니다.

## 기존 덱 옮기기

기존 주소에서 **내보내기 → JSON**으로 저장하고, GitHub Pages 주소에서 **가져오기**로 불러옵니다. 덱은 브라우저의 사이트 주소별 저장 공간을 사용하므로 주소를 옮기면 자동 공유되지 않습니다.

## 문제 해결

| 증상 | 확인할 곳 |
| --- | --- |
| `Mixed or incomplete PTCG Canvas release` | 안내된 파일과 나머지 ZIP 내용을 함께 덮어쓰고 새 커밋을 push. 실패한 옛 실행을 Re-run만 하면 옛 커밋이 실행됨 |
| 로그에 `ptcg-canvas@1.1.1` 또는 `Missing fixture`가 나옴 | 구버전 package.json/core.js/카드 데이터가 남아 있는지 확인. 전체 교체 절차로 업데이트 |
| Actions에 워크플로가 안 보임 | 저장소 루트의 `.github/workflows/deploy-pages.yml` 존재 여부와 `main` 브랜치 확인 |
| Configure GitHub Pages 단계에서 실패 | Settings → Pages의 Source가 GitHub Actions인지 확인 후 재실행 |
| 카드 데이터가 안 나옴 | `public/data/cards.json`과 `cards.json.gz`가 커밋되어 있는지 확인 |
| 일부 카드 이미지만 표시되지 않음 | 첫 화면·예시용 52장을 제외한 카드는 포켓몬코리아 이미지 서버 연결이 필요함 |
| 사이트에서 소스 ZIP 링크가 404 | 워크플로의 Generate downloadable source ZIP 단계 포함 여부 확인 |

## 검증 범위와 출처

이 패키지는 로컬에서 테스트 25개, 소스 ZIP 재생성, 빌드와 배포 파일 검사를 통과했습니다. 실제 GitHub 원격 배포는 위 설정과 push 후 실행됩니다.

데이터 및 이미지 출처·사용 범위는 `README.md`, `DATA_LICENSE.txt`에 정리했습니다. GitHub 설정 및 Actions 구성은 2026-11-10에 아래 공식 문서를 확인했습니다.

- [GitHub Pages 배포 소스 설정](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [GitHub Pages 사용자 지정 워크플로](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [actions/setup-node](https://github.com/actions/setup-node)
