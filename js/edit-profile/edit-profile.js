const API_BASE = "https://backend-production-5853.up.railway.app/api/v1";

document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("로그인이 필요한 서비스입니다.");
        window.location.href = "/login";
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/users/me`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            alert("인증이 만료되었습니다. 다시 로그인해주세요.");
            localStorage.removeItem("token");
            window.location.href = "/login";
            return;
        }

        if (!response.ok) {
            throw new Error("프로필 정보를 불러오는데 실패했습니다.");
        }

        const profile = await response.json();

        // 폼 필드 채우기
        if (profile.name) document.getElementById("name").value = profile.name;
        if (profile.student_id) document.getElementById("studentId").value = profile.student_id;
        if (profile.email) document.getElementById("email").value = profile.email;
        if (profile.bio) document.getElementById("bio").value = profile.bio;
        if (profile.baekjoon_id) document.getElementById("baekjoonId").value = profile.baekjoon_id;

    } catch (error) {
        console.error(error);
        alert("서버와 통신 중 문제가 발생했습니다.");
    }
});

document.getElementById("edit-profile-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    // const newPassword = document.getElementById("new-password").value;
    // const confirmPassword = document.getElementById("confirm-password").value;

    // if (newPassword && newPassword !== confirmPassword) {
    //     alert("새 비밀번호가 일치하지 않습니다.");
    //     return;
    // }

    // 서버로 보낼 수정 페이로드 (API 허용 범위에 따라 다를 수 있음)
    const payload = {
        name: document.getElementById("name").value,
        bio: document.getElementById("bio").value,
        baekjoon_id: document.getElementById("baekjoonId").value
    };

    if (document.getElementById("email").value) {
        payload.email = document.getElementById("email").value;
    }

    // if (newPassword) {
    //     payload.password = newPassword;
    // }

    try {
        const response = await fetch(`${API_BASE}/users/me`, {
            // PATCH 전송 (FastAPI 등에서 보통 권장하는 정보 변경 메소드)
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error("정보 수정에 실패했습니다.");
        }

        alert("성공적으로 정보가 수정되었습니다.");
        window.location.href = "/mypage";

    } catch (error) {
        console.error(error);
        alert("유저 정보 변경 중 오류가 발생했습니다. 백엔드 API를 확인해주세요.");
    }
});
