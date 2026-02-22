const pw = document.getElementById("password");
const pw2 = document.getElementById("confirm-password");
const msg = document.getElementById("pw-msg");
const form = document.querySelector("form");

if (pw && pw2 && msg) {

  function resetBorder() {
    [pw, pw2].forEach(el => {
      el.classList.remove(
        "border-sprout","focus:ring-sprout","focus:border-sprout",
        "border-red-500","focus:ring-red-500","focus:border-red-500"
      );
      el.classList.add("border-border-light","focus:ring-sprout","focus:border-sprout");
    });
  }

  function setState(ok) {
    [pw, pw2].forEach(el => {
      el.classList.remove(
        "border-sprout","focus:ring-sprout","focus:border-sprout",
        "border-red-500","focus:ring-red-500","focus:border-red-500"
      );
    });

    if (ok) {
      [pw, pw2].forEach(el =>
        el.classList.add("border-sprout","focus:ring-sprout","focus:border-sprout")
      );
      msg.className = "text-sprout text-xs px-1";
      msg.textContent = "Passwords match.";
    } else {
      [pw, pw2].forEach(el =>
        el.classList.add("border-red-500","focus:ring-red-500","focus:border-red-500")
      );
      msg.className = "text-red-500 text-xs px-1";
      msg.textContent = "Passwords do not match.";
    }
  }

  function check() {
    const a = pw.value;
    const b = pw2.value;

    if (!a && !b) {
      msg.classList.add("hidden");
      resetBorder();
      return false;
    }

    msg.classList.remove("hidden");

    if (a === b) {
      setState(true);
      return true;
    } else {
      setState(false);
      return false;
    }
  }

  pw.addEventListener("input", check);
  pw2.addEventListener("input", check);

form.addEventListener("submit", async function(e){
  e.preventDefault();

  if (!check()) return;

  const name = document.getElementById("full-name").value.trim();
  const student_id = document.getElementById("student-id").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = pw.value;

  if (!name || !student_id || !email) {
    alert("모든 항목을 입력해주세요.");
    return;
  }

  try {
    const response = await fetch("https://backend-production-5853.up.railway.app/api/v1/users/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        student_id,
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "회원가입 실패");
      return;
    }

    localStorage.setItem("pendingEmail", email);
    window.location.href = "/login";

  } catch (error) {
    console.error(error);
    alert("서버 연결 실패");
  }
});
}