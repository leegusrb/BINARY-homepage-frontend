const API_BASE = "https://backend-production-5853.up.railway.app/api/v1";

document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const body = new URLSearchParams({
        username: document.getElementById("identity").value,
        password: document.getElementById("password").value
    });

    const res = await fetch(`${API_BASE}/users/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: body.toString()
    });

    if (!res.ok) {
        alert("로그인 실패");
        return;
    }

    const data = await res.json();
    console.log("로그인 응답:", data);

    // FastAPI의 OAuth2 기반 응답은 보통 access_token 키로 토큰을 반환합니다.
    localStorage.setItem("token", data.access_token);

    alert("로그인 성공!");
    window.location.href = "/";

});

