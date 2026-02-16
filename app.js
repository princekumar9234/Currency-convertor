const BASE_URL = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies";

// Selectors
const dropdowns = document.querySelectorAll(".select-container select");
const fromCurr = document.querySelector("#from-currency");
const toCurr = document.querySelector("#to-currency");
const btn = document.querySelector("#get-rate-btn");
const msg = document.querySelector("#exchange-message");
const amountInput = document.querySelector("#amount-input");
const swapBtn = document.querySelector("#swap-btn");
const card = document.querySelector("#card");

// ----------------------------
// 3D Tilt Effect Logic
// ----------------------------
document.addEventListener("mousemove", (e) => {
    if (window.innerWidth < 1024) return; // Disable tilt on mobile/tablets
    
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    
    // Calculate rotation based on cursor position
    const moveX = (clientX - innerWidth / 2) / (innerWidth / 2);
    const moveY = (clientY - innerHeight / 2) / (innerHeight / 2);
    
    const rotateX = moveY * 10; // Max 10 degrees
    const rotateY = -moveX * 10;
    
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
});

// Reset tilt when mouse leaves
document.addEventListener("mouseleave", () => {
    card.style.transform = `rotateX(0deg) rotateY(0deg)`;
});

// ----------------------------
// Populate dropdowns
// ----------------------------
for (let select of dropdowns) {
  for (let code in countryList) {
    const option = document.createElement("option");
    option.value = code;
    option.innerText = code;
    
    if (select.name === "from" && code === "USD") {
      option.selected = "selected";
    } else if (select.name === "to" && code === "INR") {
      option.selected = "selected";
    }
    
    select.append(option);
  }
}

// ----------------------------
// Flag update function
// ----------------------------
function updateFlag(selectEl) {
  const currencyCode = selectEl.value;
  const countryCode = countryList[currencyCode];
  const img = selectEl.parentElement.querySelector("img");

  if (img && countryCode) {
    img.src = `https://flagsapi.com/${countryCode}/flat/64.png`;
  }
}

// Flag change on currency change
dropdowns.forEach((select) => {
  select.addEventListener("change", (e) => {
    updateFlag(e.target);
  });
});

// ----------------------------
// Exchange rate function
// ----------------------------
async function updateExchangeRate() {
  let amountVal = amountInput.value;
  if (amountVal === "" || amountVal <= 0) {
    amountVal = 1;
    amountInput.value = "1";
  }

  const from = fromCurr.value.toLowerCase();
  const to = toCurr.value.toLowerCase();

  // Visual feedback
  btn.innerText = "Processing...";
  btn.classList.add("loading");
  msg.innerText = "Fetching real-time rates...";

  try {
    const response = await fetch(`${BASE_URL}/${from}.json`);
    if (!response.ok) throw new Error("API Network Error");

    const data = await response.json();
    const rate = data[from][to];

    if (typeof rate !== "number") {
      msg.innerText = "Currency data unavailable";
      return;
    }

    const finalAmount = (amountVal * rate).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    msg.innerText = `${amountVal} ${fromCurr.value} = ${finalAmount} ${toCurr.value}`;
  } catch (error) {
    console.error(error);
    msg.innerText = "API Error: Try again later";
  } finally {
    btn.innerText = "Get Exchange Rate";
    btn.classList.remove("loading");
  }
}

// ----------------------------
// Events
// ----------------------------

// Button click
btn.addEventListener("click", (e) => {
  e.preventDefault();
  updateExchangeRate();
});

// Swap currencies with animation
swapBtn.addEventListener("click", () => {
    // Add temporary rotation animation
    swapBtn.style.transform = "rotate(360deg) scale(1.2)";
    setTimeout(() => {
        swapBtn.style.transform = "";
    }, 400);

    const tempValue = fromCurr.value;
    fromCurr.value = toCurr.value;
    toCurr.value = tempValue;
    
    updateFlag(fromCurr);
    updateFlag(toCurr);
    updateExchangeRate();
});

// Auto calculate on load
window.addEventListener("load", () => {
  updateExchangeRate();
});

// Also update rate on enter
amountInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        updateExchangeRate();
    }
});
