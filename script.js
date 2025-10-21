document.addEventListener("DOMContentLoaded", () => {
  // !!! 바로 이 부분입니다! 본인의 Apps Script 웹 앱 URL로 변경해주세요.
  const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwp_jjozPHa-guda2O9p9j-dZZF1tE-PiKucbvSBmSUg00uFggH8co2RwtN5fpOyOzTtA/exec';

  const careerForm = document.getElementById('career-form');
  const recordsContainer = document.getElementById('records-container');
  const fitChartCanvas = document.getElementById('fit-chart');
  let records = [];
  let fitChart;

  // 📊 차트 초기화 함수
  function initializeChart() {
    if (fitChart) {
        fitChart.destroy();
    }
    const ctx = fitChartCanvas.getContext('2d');
    fitChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["1점", "2점", "3점", "4점", "5점"],
        datasets: [{
          label: "전공 적성 만족도",
          data: [0, 0, 0, 0, 0],
          backgroundColor: "#F4A261",
          borderRadius: 4,
          barPercentage: 0.6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: { 
            display: true,
            text: '전공 적성 만족도별 응답 수'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { 
              stepSize: 1,
              precision: 0
            }
          },
          x: {
              grid: { display: false }
          }
        },
      },
    });
  }
  
  // ☁️ 서버에서 기록을 불러오는 함수
  async function loadRecords() {
    try {
      const response = await fetch(WEB_APP_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      records = await response.json();
      updateUI();
    } catch (error) {
      console.error("Error loading records:", error);
      recordsContainer.innerHTML = `<p style="text-align:center; color: #D8000C;">기록을 불러오는 데 실패했습니다. Apps Script 웹 앱 URL과 배포 설정을 확인해주세요.</p>`;
    }
  }

  // 📝 폼 제출 이벤트 (서버로 데이터 전송)
  careerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitButton = careerForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = '저장 중...';

    const formData = new FormData(careerForm);
    const record = Object.fromEntries(formData.entries());

    try {
      await fetch(WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors', 
        body: JSON.stringify(record),
      });
      
      setTimeout(() => {
        loadRecords();
        careerForm.reset();
      }, 1500);

    } catch (error) {
      console.error("Error submitting form:", error);
      alert("데이터 저장에 실패했습니다.");
    } finally {
        setTimeout(() => {
            submitButton.disabled = false;
            submitButton.textContent = '기록하기';
        }, 1500);
    }
  });
  
  // ✨ UI 업데이트 (기록 목록 및 차트)
  function updateUI() {
    updateRecordsDisplay();
    updateChart();
  }

  // 💾 기록 목록 표시
  function updateRecordsDisplay() {
    recordsContainer.innerHTML = "";
    if (!records || records.length === 0) {
        recordsContainer.innerHTML = `<p style="text-align:center; color: #555;">아직 기록이 없습니다. 첫 기록을 남겨보세요!</p>`;
        return;
    }

    [...records].reverse().forEach((r) => {
      const card = document.createElement("div");
      card.classList.add("record-card");
      
      const timestamp = r.Timestamp ? new Date(r.Timestamp).toLocaleString('ko-KR') : '날짜 정보 없음';

      card.innerHTML = `
        <p><strong>🎓 재학 여부:</strong> ${r.University === "yes" ? "예" : "아니요"}</p>
        <p><strong>📘 전공:</strong> ${r.Major || "-"}</p>
        <p><strong>🤔 적성 점수:</strong> ${r.Fit}점</p>
        <p><strong>💪 잘하는 일:</strong> ${r.Strength || "-"}</p>
        <p><strong>😟 불안 요인:</strong> ${r.Anxiety || "-"}</p>
        <p><strong>🚀 해결 시도:</strong> ${r.Effort || "-"}</p>
        <p class="date">
            <small>작성일: ${timestamp}</small>
        </p>
      `;
      recordsContainer.appendChild(card);
    });
  }

  // 📈 차트 데이터 갱신
  function updateChart() {
    const counts = [0, 0, 0, 0, 0];
    if(records && records.length > 0){
        records.forEach((r) => {
          const fitScore = parseInt(r.Fit, 10);
          if (fitScore >= 1 && fitScore <= 5) {
            counts[fitScore - 1]++;
          }
        });
    }
    fitChart.data.datasets[0].data = counts;
    fitChart.update();
  }

  // 페이지가 처음 로드될 때 차트를 그리고 기록을 불러옵니다.
  initializeChart();
  loadRecords();
});

