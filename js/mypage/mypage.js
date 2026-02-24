const MypageAPI = {
    async fetchProfile() {
        const token = localStorage.getItem("token");

        if (!token) {
            alert("로그인이 필요한 서비스입니다.");
            window.location.href = "/login";
            return null;
        }

        try {
            const response = await fetch("https://backend-production-5853.up.railway.app/api/v1/users/me", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.status === 401) {
                alert("인증이 만료되었습니다. 다시 로그인해주세요.");
                localStorage.removeItem("token");
                window.location.href = "/login";
                return null;
            }

            if (!response.ok) {
                throw new Error("프로필 정보를 불러오는데 실패했습니다.");
            }
            return await response.json();

            // 개발 및 테스트용 Mock 데이터 반환
            // return {
            //     "name": "이현규",
            //     "bio": "Passionate about AI Robotics & Full-stack Development. Building the future bit by bit.",
            //     "student_id": "20250142",
            //     "tier": 0,
            //     "baekjoon_id": "leegusrb",
            //     "monthly_grass_count": 18,
            //     "total_grass_count": 1242,
            //     "current_streak": 12,
            //     "activity_log": [
            //         { "date": new Date().toISOString().split('T')[0], "count": 5 }
            //     ]
            // };
        } catch (error) {
            console.error(error);
            alert("서버와 통신 중 문제가 발생했습니다.");
            return null;
        }
    }
};

document.addEventListener("DOMContentLoaded", async () => {
    // 1. 프로필 데이터 패치
    const profile = await MypageAPI.fetchProfile();
    if (!profile) return;

    // 2. 프로필 정보 텍스트 바인딩
    document.getElementById("profile-name").textContent = profile.name || "-";
    document.getElementById("profile-bio").textContent = profile.bio || "No biography provided.";
    document.getElementById("profile-studentid").textContent = profile.student_id || "-";

    // 3. 월간 목표 달성률 계산 및 바인딩
    const now = new Date();
    // 현재 월의 총 일수 계산 (예: 10월은 31일)
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const monthlyCount = profile.monthly_grass_count || 0;
    // 최대 100%까지만 제한
    const percent = Math.min(100, Math.round((monthlyCount / daysInMonth) * 100));

    document.getElementById("monthly-fraction").textContent = `${monthlyCount} / ${daysInMonth} days committed`;
    document.getElementById("monthly-percent").textContent = percent;

    // SVG Progress 인디케이터 조작
    const ring = document.getElementById("monthly-progress-ring");
    if (ring) {
        const circumference = 263.89; // SVG circle 둘레 (2 * pi * 42)
        const offset = circumference - (percent / 100) * circumference;
        ring.style.strokeDashoffset = offset;
    }

    // 4. 누적/연속 잔디 요약 정보
    document.getElementById("total-commits").textContent = (profile.total_grass_count || 0).toLocaleString();
    document.getElementById("current-streak").textContent = profile.current_streak || 0;

    // 5. Jandi (Activity Log) 그래프 렌더링
    renderJandi(profile.activity_log || []);
});

function renderJandi(activityLog) {
    const grid = document.getElementById("jandi-grid");
    if (!grid) return;

    // 백엔드에서 받은 실제 잔디 로그를 Date 문자열 기준 Map으로 파싱
    const logMap = new Map();
    activityLog.forEach(log => {
        logMap.set(log.date, log.count);
    });

    const maxDate = new Date(); // 오늘 날짜
    const endDate = new Date(maxDate);

    // 달력 구조: 월,수,금 라벨에 맞추기 위해 1열 1행이 월요일로 시작한다고 가정
    // grid-auto-flow: column 방식으로 위에서 아래로(월~일) 7개씩 채워짐
    const dayOfWeek = endDate.getDay(); // 0: 일요일, 1: 월요일, ...
    const jsDay = dayOfWeek === 0 ? 7 : dayOfWeek;

    // 그리드의 마지막 열을 채우기 위해, 다가오는 일요일까지 날짜 간격 계산
    const daysToNextSunday = 7 - jsDay;
    endDate.setDate(endDate.getDate() + daysToNextSunday);

    // Jandi 그래프는 보통 52주 분량을 표시 (52주 * 7일 = 364일)
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 363);

    // 기존 내용 삭제 후 새로 그리기
    grid.innerHTML = "";

    const currentDate = new Date(startDate);

    // 364일의 칸 생성
    for (let i = 0; i < 364; i++) {
        // 'YYYY-MM-DD' 형식으로 로컬 날짜 문자열 통일
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        let count = 0;

        // 현재 날짜(오늘) 이후는 아직 오지 않은 날이므로 빈 칸(투명하게 하거나 0처리)
        if (currentDate <= maxDate) {
            // 실제 데이터가 있으면 매핑하고, 테스트를 위해 나머지는 랜덤 데이터도 살짝 삽입합니다
            if (logMap.has(dateStr)) {
                count = logMap.get(dateStr);
            } else {
                // TODO: 실제 서비스 시 아래 랜덤 모킹은 삭제!
                count = Math.random() > 0.75 ? Math.floor(Math.random() * 4) + 1 : 0;
            }
        }

        // 카운트에 따른 CSS 레벨링
        let levelClass = 'bg-level-0';
        if (count > 0 && count <= 2) levelClass = 'bg-level-1';
        else if (count >= 3 && count <= 5) levelClass = 'bg-level-2';
        else if (count >= 6 && count <= 8) levelClass = 'bg-level-3';
        else if (count >= 9 && count <= 12) levelClass = 'bg-level-4';
        else if (count > 12) levelClass = 'bg-level-5';

        // 아직 오지 않은 미래의 칸들은 투명 처리 또는 가장 흐린 색 유지
        if (currentDate > maxDate) {
            levelClass = 'bg-transparent';
        }

        const box = document.createElement("div");
        box.className = `size-[15px] ${levelClass} rounded-[3px] transition-transform hover:scale-125 hover:z-10 cursor-pointer`;

        // 툴팁용 타이틀 적용
        if (currentDate <= maxDate) {
            box.title = `${count} contributions on ${dateStr}`;
        }

        grid.appendChild(box);

        // 하루 증가
        currentDate.setDate(currentDate.getDate() + 1);
    }
}
