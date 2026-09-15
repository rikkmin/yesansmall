const money = new Intl.NumberFormat("ko-KR");
const $ = (id) => document.getElementById(id);

const travelGrades = {
  chair: {
    label: "이사장",
    daily: 25000,
    meal: 25000,
    lodging: { type: "actual" },
    overseasBand: "class1b",
    transport: "실비",
    basis: "여비규정 별표1 및 별표2: 이사장은 국외여비 공무원 여비규정 별표1 제1호나목 기준"
  },
  executive: {
    label: "임원",
    daily: 25000,
    meal: 25000,
    lodging: { type: "actual" },
    overseasBand: "class1d",
    transport: "실비",
    basis: "여비규정 별표1 및 별표2: 임원은 국외여비 공무원 여비규정 별표1 제1호라목 기준"
  },
  staff: {
    label: "직원",
    daily: 25000,
    meal: 25000,
    lodging: { type: "cap", seoul: 100000, metro: 80000, other: 70000 },
    overseasBand: "class2",
    transport: "실비",
    basis: "여비규정 별표1 비고 4, 공무원 여비 업무 처리기준 국내 여비 지급표 제2호"
  }
};

const overseasRates = {
  class1b: {
    label: "제1호나목",
    daily: { a: 50, b: 50, c: 50, d: 50 },
    lodging: { a: 389, b: 289, c: 215, d: 161 },
    meal: { a: 160, b: 117, c: 87, d: 73 }
  },
  class1d: {
    label: "제1호라목",
    daily: { a: 35, b: 35, c: 35, d: 35 },
    lodging: { a: 223, b: 160, c: 130, d: 85 },
    meal: { a: 107, b: 78, c: 58, d: 49 }
  },
  class2: {
    label: "제2호",
    daily: { a: 30, b: 30, c: 30, d: 30 },
    lodging: { a: 176, b: 137, c: 106, d: 81 },
    meal: { a: 81, b: 59, c: 44, d: 37 }
  }
};

const lectureDistanceRates = {
  "1": { label: "없음", type: "multiplier", value: 1 },
  "1.5": { label: "편도 40km~100km", type: "multiplier", value: 1.5 },
  "1.7": { label: "편도 100km 초과", type: "multiplier", value: 1.7 },
  "2": { label: "도서지역", type: "multiplier", value: 2 },
  other_40_60: { label: "40km 이상 60km 미만", type: "fixed", value: 10000 },
  other_60_100: { label: "60km 이상 100km 미만", type: "fixed", value: 15000 },
  other_100_150: { label: "100km 이상 150km 미만", type: "fixed", value: 20000 },
  other_150_200: { label: "150km 이상 200km 미만", type: "fixed", value: 25000 },
  other_200_250: { label: "200km 이상 250km 미만", type: "fixed", value: 35000 },
  other_250_300: { label: "250km 이상 300km 미만", type: "fixed", value: 50000 },
  other_300: { label: "300km 이상", type: "fixed", value: 65000 },
  island_ga: { label: "기타강의 도서·벽지 가 지역", type: "fixed", value: 50000 },
  island_na: { label: "기타강의 도서·벽지 나 지역", type: "fixed", value: 40000 },
  island_da: { label: "기타강의 도서·벽지 다 지역", type: "fixed", value: 30000 },
  island_ra: { label: "기타강의 도서·벽지 라 지역", type: "fixed", value: 20000 }
};

function won(value) {
  return `${money.format(Math.round(value))}원`;
}

function usd(value) {
  return `$${money.format(Math.round(value * 100) / 100)}`;
}

function number(id) {
  return Number($(id).value || 0);
}

function setCards(items) {
  $("cards").innerHTML = items
    .map((item) => `<div class="card ${item.tone || ""}"><span>${item.label}</span><strong>${item.value}</strong></div>`)
    .join("");
}

function setResult(title, total, cards, basis) {
  $("resultTitle").textContent = title;
  $("totalAmount").textContent = won(total);
  setCards(cards);
  $("basisText").textContent = basis;
}

function calculateTravel() {
  const type = $("travelType").value;
  const grade = travelGrades[$("travelGrade").value];
  const days = Math.max(1, number("travelDays"));
  const nights = Math.max(0, number("travelNights"));
  const hours = number("travelHours");
  const actualLodging = number("lodgingActual");
  const deductedMeals = Math.max(0, number("deductedMeals"));
  const provided = $("providedTransport").checked;
  const capIncrease = $("lodgingCapIncrease").checked;

  if (type === "local") {
    const amount = provided ? 10000 : hours >= 4 ? 20000 : 10000;
    setResult("여비 계산", amount, [
      { label: "근무지내 지급액", value: won(amount) },
      { label: "시간 기준", value: hours >= 4 ? "4시간 이상" : "4시간 미만" },
      { label: "교통편 제공", value: provided ? "예" : "아니오", tone: provided ? "warn" : "" }
    ], "여비규정 제14조의1: 근무지 내 국내출장은 4시간 이상 최대 20,000원, 4시간 미만 최대 10,000원. 재단 교통편 제공 시 10,000원 지급.");
    return;
  }

  if (type === "regular") {
    const amount = provided ? 10000 : hours >= 4 ? 20000 : 10000;
    setResult("여비 계산", amount, [
      { label: "상시출장비", value: won(amount) },
      { label: "시간 기준", value: hours >= 4 ? "4시간 이상" : "4시간 미만 또는 차량이용" },
      { label: "정산", value: "월단위 후지급" }
    ], "상시출장지침 별표1: 4시간 이상은 예산 범위 내 15,000원 또는 20,000원, 4시간 미만 또는 재단차량 이용은 10,000원. 1일 합산액은 근무지내 국내출장비 상한 적용.");
    return;
  }

  if (type === "overseas") {
    const region = $("overseasRegion").value;
    const exchangeRate = number("exchangeRate");
    const rate = overseasRates[grade.overseasBand];
    const dailyUsd = rate.daily[region] * days;
    const mealBaseUsd = rate.meal[region] * days;
    const mealDeductionUsd = Math.min(mealBaseUsd, (rate.meal[region] / 3) * deductedMeals);
    const mealUsd = Math.max(0, mealBaseUsd - mealDeductionUsd);
    const lodgingCapUnitUsd = rate.lodging[region] * (capIncrease ? 1.5 : 1);
    const lodgingCapUsd = lodgingCapUnitUsd * nights;
    const lodgingUsd = nights > 0 ? Math.min(actualLodging, lodgingCapUsd) : 0;
    const totalUsd = dailyUsd + mealUsd + lodgingUsd;
    const total = totalUsd * exchangeRate;

    setResult("여비 계산", total, [
      { label: "달러 산출액", value: usd(totalUsd) },
      { label: "일비", value: `${usd(dailyUsd)} (${usd(rate.daily[region])} × ${days}일)` },
      { label: "식비", value: `${usd(mealUsd)} (차감 ${deductedMeals}식)` },
      { label: "숙박 반영액", value: nights > 0 ? `${usd(lodgingUsd)} / 상한 ${usd(lodgingCapUsd)}` : "해당 없음" },
      { label: "숙박 상한", value: capIncrease ? "1.5배 증액 적용 · 이사장 승인 필요" : `${usd(rate.lodging[region])} / 1박` , tone: capIncrease ? "warn" : "" },
      { label: "환율", value: `${money.format(exchangeRate)}원 / USD` },
      { label: "국외 등급", value: `${rate.label}, ${$("overseasRegion").selectedOptions[0].textContent}` }
    ], `${grade.basis}. 국외 여비 지급표의 일비·숙박비·식비는 미 달러화 기준이며, 식비 차감은 1식당 해당 1일 식비의 1/3로 계산했습니다. 숙박비 상한 증액 적용 시 국외는 1.5배 상한으로 계산하며 이사장 승인이 필요합니다.`);
    return;
  }

  const mealBase = grade.meal * days;
  const mealDeduction = Math.min(mealBase, (grade.meal / 3) * deductedMeals);
  const mealAmount = Math.max(0, mealBase - mealDeduction);
  const dailyMeal = (grade.daily * days) + mealAmount;
  const domesticCapMultiplier = capIncrease ? 1.3 : 1;
  const lodgingUnitCap = grade.lodging.type === "actual" ? null : grade.lodging.other * domesticCapMultiplier;
  const lodgingMax = grade.lodging.type === "actual" ? actualLodging : Math.min(actualLodging, lodgingUnitCap * nights);
  const lodgingLabel = grade.lodging.type === "actual"
    ? "실비"
    : `상한: 서울 ${won(grade.lodging.seoul * domesticCapMultiplier)} / 광역시 ${won(grade.lodging.metro * domesticCapMultiplier)} / 기타 ${won(grade.lodging.other * domesticCapMultiplier)}`;
  const total = dailyMeal + lodgingMax;

  const cards = [
    { label: "일비", value: won(grade.daily * days) },
    { label: "식비", value: `${won(mealAmount)} (차감 ${deductedMeals}식)` },
    { label: "숙박 반영액", value: nights > 0 ? won(lodgingMax) : "해당 없음" },
    { label: "숙박 기준", value: lodgingLabel },
    { label: "운임", value: grade.transport }
  ];
  if (capIncrease && grade.lodging.type !== "actual") {
    cards.push({ label: "숙박 상한 증액", value: "1.3배 적용 · 이사장 승인 필요", tone: "warn" });
  }
  setResult("여비 계산", total, cards, `${grade.basis}. 운임과 숙박비는 증빙 및 정산 기준 확인 필요. 식비 차감은 1식당 해당 1일 식비의 1/3로 계산했습니다. 숙박비 상한 증액 적용 시 국내는 1.3배 상한으로 계산하며 이사장 승인이 필요합니다.`);
}

function lectureBase(kind, hours) {
  const rounded = Math.ceil(hours * 2) / 2;
  if (kind === "other") return rounded * 100000;
  if (kind === "meeting") return 100000 + (hours >= 2 ? 50000 : 0);
  const first = kind === "special" ? 300000 : 200000;
  const extraHour = kind === "special" ? 200000 : 150000;
  if (rounded <= 1) return first;
  return first + Math.ceil((rounded - 1) * 2) * (extraHour / 2);
}

function calculateHonorarium() {
  const type = $("honorariumType").value;
  const hours = number("honorariumHours");
  const distance = lectureDistanceRates[$("distanceRate").value];
  const extraTripCount = Math.min(2, Math.max(1, number("extraTripCount")));
  const units = number("writingUnits");

  if (type === "writingA" || type === "writingB") {
    const unitPrice = type === "writingA" ? 15000 : 10000;
    const total = unitPrice * units;
    setResult("사례비 계산", total, [
      { label: "단가", value: `${won(unitPrice)} / 200자` },
      { label: "수량", value: `${units}단위` },
      { label: "구분", value: type === "writingA" ? "일반원고 A" : "일반원고 B" }
    ], "사례금 등에 대한 지급 규정 별표4 원고료 기준.");
    return;
  }

  const base = lectureBase(type, hours);
  const fixedAddition = type === "other" && distance.type === "fixed" ? distance.value * extraTripCount : 0;
  const multiplier = distance.type === "multiplier" ? distance.value : 1;
  const total = type === "meeting" ? base : type === "other" ? base + fixedAddition : base * multiplier;
  const label = {
    general: "일반 강의료",
    special: "특별 강의료",
    other: "기타 강의료",
    meeting: "회의참가비"
  }[type];

  setResult("사례비 계산", total, [
    { label: "구분", value: label },
    { label: "기본 산출", value: won(base) },
    {
      label: type === "other" ? "원거리 추가" : "원거리 배율",
      value: type === "meeting" ? "미적용" : type === "other" ? `${won(fixedAddition)} (${distance.label}, ${extraTripCount}회)` : `${multiplier}배`
    }
  ], type === "other"
    ? "사례금 등에 대한 지급 규정 별표3: 기타강의 원거리 강의 기준. 편도 이동거리별 추가 사례비는 1일 최대 2회 지급하며, 도서·벽지 지역 학교 출강은 지역등급별 1일당 추가 사례비를 적용합니다."
    : "사례금 등에 대한 지급 규정 별표3 및 사례비지급기준.xlsx 계산식 기준.");
}

function calculateBusiness() {
  const amount = number("businessAmount");
  const people = Math.max(1, number("businessPeople"));
  const perPerson = amount / people;
  const approver = amount >= 1000000 ? "이사장" : amount >= 700000 ? "본부장·원장" : amount >= 500000 ? "실·국장" : "팀장·지사장";
  const overPerPerson = perPerson > 50000;

  setResult("업무추진비 계산", amount, [
    { label: "1인당 금액", value: won(perPerson), tone: overPerPerson ? "danger" : "" },
    { label: "최종 결재", value: approver },
    { label: "1인당 한도", value: overPerPerson ? "초과" : "범위 내", tone: overPerPerson ? "danger" : "" }
  ], "예산집행지침 업무추진비: 식비와 음료비는 1인당 1회 50,000원 한도. 500,000원 이상 주된 상대방 소속·성명 기재, 1,000,000원 이상 이사장 결재, 700,000원 이상 본부장·원장 결재, 500,000원 이상 실·국장 결재, 500,000원 미만 팀장·지사장 결재.");
}

function calculate() {
  const active = document.querySelector(".panel.active").dataset.calculator;
  if (active === "travel") calculateTravel();
  if (active === "honorarium") calculateHonorarium();
  if (active === "business") calculateBusiness();
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".panel").forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    $(tab.dataset.panel).classList.add("active");
    calculate();
  });
});

document.querySelectorAll("input, select").forEach((field) => field.addEventListener("input", calculate));
document.querySelectorAll("select").forEach((field) => field.addEventListener("change", calculate));

calculate();


