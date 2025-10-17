document.addEventListener("DOMContentLoaded", () => {
     const WEB_APP_URL = '    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwh1nHv-utUNPuHUA30YXfziK4hV0ILnL63YN8qrgLwS2LvfJhrfAfotwUvhF1fZrO7yw/exec';

    const recordForm = document.getElementById('record-form');
    const recordsContainer = document.getElementById('records-container');
    const dateInput = document.getElementById('date');
    const exportButton = document.getElementById('export-excel');
    const moodChartCanvas = document.getElementById('mood-chart');
    const recordForm = document.getElementById('record-form');
    const recordsContainer = document.getElementById('records-container');
    const dateInput = document.getElementById('date');
    const exportButton = document.getElementById('export-excel');
    const moodChartCanvas = document.getElementById('mood-chart');
  let records = [];

  // 📊 차트 초기화
  let fitChart = new Chart(chartCanvas, {
    type: "bar",
    data: {
      labels: ["1점", "2점", "3점", "4점", "5점"],
      datasets: [
        {
          label: "전공 적성 만족도",
          data: [0, 0, 0, 0, 0],
          backgroundColor: ["#F4A261", "#F4A261", "#F4A261", "#F4A261", "#F4A261"],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } },
      },
    },
  });

  // 📝 폼 제출 이벤트
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const record = Object.fromEntries(formData.entries());
    record.timestamp = new Date().toLocaleString();

    records.push(record);
    updateRecords();
    updateChart();

    form.reset();
    alert("기록이 저장되었습니다!");
  });

  // 💾 기록 표시
  function updateRecords() {
    recordsContainer.innerHTML = "";
    records.forEach((r) => {
      const card = document.createElement("div");
      card.classList.add("record-card");
      card.innerHTML = `
        <p><strong>재학 여부:</strong> ${r.university === "yes" ? "예" : "아니요"}</p>
        <p><strong>전공:</strong> ${r.major}</p>
        <p><strong>적성 점수:</strong> ${r.fit}점</p>
        <p><strong>잘하는 일:</strong> ${r.strength || "-"}</p>
        <p><strong>불안 요인:</strong> ${r.anxiety || "-"}</p>
        <p><strong>해결 시도:</strong> ${r.effort || "-"}</p>
        <p class="date"><small>${r.timestamp}</small></p>
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
});
