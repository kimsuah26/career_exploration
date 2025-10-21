document.addEventListener("DOMContentLoaded", () => {
  // ✅ 여기에 본인 Google Apps Script 웹앱 URL을 입력하세요
  const WEB_APP_URL = "https://script.google.com/macros/s/여기에_당신의_URL_붙여넣기/exec";

  const form = document.getElementById("career-form");
  const recordsContainer = document.getElementById("records-container");
  const chartCanvas = document.getElementById("fit-chart");

  let records = [];
  let fitChart;

  // 📊 차트 초기화 함수
  function initChart() {
    fitChart = new Chart(chartCanvas, {
      type: "bar",
      data: {
        labels: ["1점", "2점", "3점", "4점", "5점"],
        datasets: [
          {
            label: "전공 적성 만족도",
            data: [0, 0, 0, 0, 0],
            backgroundColor: "#F4A261",
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
          },
        },
      },
    });
  }

  // 📥 Google Sheet에서 데이터 불러오기
  async function loadRecords() {
    try {
      const response = await fetch(WEB_APP_URL);
      const data = await response.json();
      if (Array.isArray(data)) {
        records = data;
        updateRecords();
        updateChart();
      } else {
        console.warn("서버에서 예상치 못한 데이터 구조를 받았습니다:", data);
      }
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    }
  }

  // 📝 폼 제출 처리
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitButton = form.querySelector("button[type='submit']");
    submitButton.disabled = true;
    submitButton.textContent = "저장 중...";

    const formData = new FormData(form);
    const record = Object.fromEntries(formData.entries());
    record.timestamp = new Date().toLocaleString();

    try {
      await fetch(WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(record),
      });

      alert("기록이 저장되었습니다!");
      form.reset();
      loadRecords();
    } catch (error) {
      console.error("저장 실패:", error);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "기록하기";
    }
  });

  // 💾 기록 리스트 표시
  function updateRecords() {
    recordsContainer.innerHTML = "";
    records.forEach((r) => {
      const card = document.createElement("div");
      card.classList.add("record-card");
      card.innerHTML = `
        <p><strong>재학 여부:</strong> ${r.university === "yes" ? "예" : "아니요"}</p>
        <p><strong>전공:</strong> ${r.major || "-"}</p>
        <p><strong>적성 점수:</strong> ${r.fit || "-"}점</p>
        <p><strong>잘하는 일:</strong> ${r.strength || "-"}</p>
        <p><strong>불안 요인:</strong> ${r.anxiety || "-"}</p>
        <p><strong>해결 시도:</strong> ${r.effort || "-"}</p>
        <p class="date"><small>${r.timestamp || ""}</small></p>
      `;
      recordsContainer.appendChild(card);
    });
  }

  // 📈 차트 갱신
  function updateChart() {
    const counts = [0, 0, 0, 0, 0];
    records.forEach((r) => {
      const index = parseInt(r.fit) - 1;
      if (index >= 0 && index < 5) counts[index]++;
    });
    fitChart.data.datasets[0].data = counts;
    fitChart.update();
  }

  // 🚀 초기 실행
  initChart();
  loadRecords();
});
