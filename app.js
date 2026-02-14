let buses = [];
let history = JSON.parse(localStorage.getItem("history") || "[]");
let allStops = [];

// --- Language Data ---
let currentLang = localStorage.getItem("lang") || "en";
const langData = {
  en: {
    title: "🚍 Dhaka Bus Route Finder",
    history: "History",
    start: "Start location",
    end: "Destination",
    search: "Search",
    noResult: "No buses found for this route.",
    service: "Service",
    time: "Time",
    route: "Full Route:",
    langBtn: "বাংলা"
  },
  bn: {
    title: "🚍 ঢাকা বাস রুট খুঁজুন",
    history: "ইতিহাস",
    start: "শুরুর স্থান",
    end: "গন্তব্য",
    search: "অনুসন্ধান",
    noResult: "এই রুটে কোনো বাস পাওয়া যায়নি।",
    service: "সেবা",
    time: "সময়",
    route: "সম্পূর্ণ রুট:",
    langBtn: "English"
  }
};

// --- Stop translations (expand as needed) ---
const stopTranslations = {
  "Gabtoli": "গাবতলী",
  "Technical": "টেকনিক্যাল",
  "Ansar Camp": "আনসার ক্যাম্প",
  "Mirpur 1": "মিরপুর ১",
  "Sony Cinema Hall": "সনি সিনেমা হল",
  "Mirpur 2": "মিরপুর ২",
  "Mirpur 10": "মিরপুর ১০",
  "Mirpur 11": "মিরপুর ১১",
  "Purobi": "পুরবী",
  "Kalshi": "কালশী",
  "ECB Square": "ইসিবি স্কয়ার",
  "MES": "এমইএস",
  "Shewra": "শেওড়া",
  "Kuril Bishwa Road": "কুরিল বিশ্বরোড",
  "Jamuna Future Park": "যমুনা ফিউচার পার্ক",
  "Bashundhara": "বসুন্ধরা",
  "Nadda": "নাড্ডা",
  "Notun Bazar": "নতুন বাজার",
  "Bashtola": "বাসতলা",
  "Shahjadpur": "শাহজাদপুর",
  "Uttar Badda": "উত্তর বাড্ডা",
  "Badda": "বাড্ডা",
  "Madhya Badda": "মধ্য বাড্ডা",
  "Merul": "মেরুল",
  "Rampura Bridge": "রামপুরা ব্রিজ",
  "Banasree": "বনশ্রী",
  "Demra Staff Quarter": "ডেমরা স্টাফ কোয়ার্টার"
  // add more mappings if you need
};

// --- Service translations ---
const serviceTranslations = {
  "Semi-Sitting Service(Check System)": "সেমি-সিটিং সার্ভিস (চেক সিস্টেম)",
  "Sitting Service(Check System)": "সিটিং সার্ভিস (চেক সিস্টেম)",
  "Semi-Sitting Service": "সেমি-সিটিং সার্ভিস",
  "Regular Service": "নিয়মিত সার্ভিস",
  "Sitting Service(Ticket System)": "সিটিং সার্ভিস (টিকিট সিস্টেম)",
  "Half-Sitting Service": "হাফ-সিটিং সার্ভিস"
};

// --- Helpers ---
function translateStop(stop) {
  if (!stop) return "";
  return currentLang === "bn" ? (stopTranslations[stop] || stop) : stop;
}
function translateService(service) {
  return currentLang === "bn" ? (serviceTranslations[service] || service || "নিয়মিত সার্ভিস") : (service || "Regular Service");
}

// --- Language functions ---
function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang);
  const mainTitle = document.getElementById("mainTitle");
  if (mainTitle) mainTitle.innerText = langData[lang].title;
  const histH2 = document.querySelector("aside h2");
  if (histH2) histH2.innerText = langData[lang].history;
  const start = document.getElementById("start");
  const end = document.getElementById("end");
  if (start) start.placeholder = langData[lang].start;
  if (end) end.placeholder = langData[lang].end;
  const searchBtn = document.getElementById("searchBtn");
  if (searchBtn) searchBtn.innerText = langData[lang].search;
  const langToggle = document.getElementById("langToggle");
  if (langToggle) langToggle.innerText = langData[lang].langBtn;
  const detailsTitle = document.querySelector("#details h3");
  if (detailsTitle) detailsTitle.innerText = langData[lang].route;
  // re-render results/history to reflect language
  renderHistory();
  // if results exist, re-render them by re-running last search? simple approach: clear results
  const resultsDiv = document.getElementById("results");
  if (resultsDiv) {
    // preserve inputs and refresh preview cards if needed
    const s = (start && start.value) || "";
    const e = (end && end.value) || "";
    if (s && e) searchBuses();
  }
}

// --- Data load ---
function loadBuses() {
  fetch("buses.json")
    .then(res => {
      if (!res.ok) throw new Error("Failed to load buses.json: " + res.status);
      return res.json();
    })
    .then(data => {
      if (!Array.isArray(data)) throw new Error("buses.json must be an array");
      buses = data;
      populateStops();
      renderHistory();
      console.log("Loaded buses:", buses.length);
    })
    .catch(err => {
      console.error(err);
      // fallback demo
      buses = [{
        english: "Demo Bus",
        bangle: "ডেমো বাস",
        service_type: "Regular Service",
        routes: ["Gabtoli","Technical","Mirpur 1","Farmgate"]
      }];
      populateStops();
      renderHistory();
    });
}

// --- populateStops + custom autocomplete ---
function populateStops() {
  allStops = [...new Set(buses.flatMap(bus => Array.isArray(bus.routes) ? bus.routes : []))].sort((a,b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  );

  const datalist = document.getElementById("stops");
  if (datalist) {
    datalist.innerHTML = "";
    allStops.forEach(stop => {
      const option = document.createElement("option");
      option.value = stop;
      datalist.appendChild(option);
    });
  }

  // attach custom startsWith autocomplete to inputs
  createAutocomplete(document.getElementById("start"), allStops);
  createAutocomplete(document.getElementById("end"), allStops);

  console.log("Autocomplete populated with", allStops.length, "stops");
}

/* Custom autocomplete (startsWith matching, keyboard nav, click)
   Creates a floating suggestion box under input (works even if datalist is ignored).
*/
function createAutocomplete(inputEl, items = []) {
  if (!inputEl) return;

  // ensure wrapper is positioned
  const wrapper = inputEl.parentElement || document.body;
  if (wrapper && getComputedStyle(wrapper).position === "static") {
    wrapper.style.position = "relative";
  }

  // remove old box if present
  const existing = wrapper.querySelector(".__autocomplete_box");
  if (existing) existing.remove();

  const box = document.createElement("div");
  box.className = "__autocomplete_box absolute left-0 right-0 mt-1 z-50 bg-gray-800 border border-gray-700 rounded-lg max-h-60 overflow-auto shadow-lg";
  box.style.display = "none";
  wrapper.appendChild(box);

  let focusedIndex = -1;
  let currentMatches = [];

  function render(matches) {
    box.innerHTML = "";
    if (!matches.length) {
      box.style.display = "none";
      return;
    }
    matches.forEach((m, i) => {
      const item = document.createElement("div");
      item.className = "px-3 py-2 hover:bg-gray-700 cursor-pointer truncate text-sm";
      item.textContent = m;
      item.dataset.index = i;
      item.addEventListener("mousedown", (e) => {
        e.preventDefault(); // keep input focused
        selectMatch(i);
      });
      box.appendChild(item);
    });
    focusedIndex = -1;
    highlight();
    box.style.display = "block";
  }

  function highlight() {
    const children = box.children;
    for (let i = 0; i < children.length; i++) {
      children[i].classList.toggle("bg-gray-700", i === focusedIndex);
    }
  }

  function selectMatch(index) {
    if (index >= 0 && index < currentMatches.length) {
      inputEl.value = currentMatches[index];
      closeBox();
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  function closeBox() {
    box.style.display = "none";
    focusedIndex = -1;
  }

  inputEl.addEventListener("input", () => {
    const q = inputEl.value.trim().toLowerCase();
    if (!q) { closeBox(); return; }
    currentMatches = items.filter(s => s && s.toLowerCase().startsWith(q)).slice(0, 30);
    render(currentMatches);
  });

  inputEl.addEventListener("keydown", (ev) => {
    if (box.style.display === "none") return;
    if (ev.key === "ArrowDown") {
      ev.preventDefault();
      focusedIndex = Math.min(focusedIndex + 1, currentMatches.length - 1);
      highlight();
      scrollIntoView();
    } else if (ev.key === "ArrowUp") {
      ev.preventDefault();
      focusedIndex = Math.max(focusedIndex - 1, 0);
      highlight();
      scrollIntoView();
    } else if (ev.key === "Enter") {
      if (focusedIndex >= 0) {
        ev.preventDefault();
        selectMatch(focusedIndex);
      }
    } else if (ev.key === "Escape") {
      closeBox();
    }
  });

  function scrollIntoView() {
    const el = box.children[focusedIndex];
    if (el) el.scrollIntoView({ block: "nearest" });
  }

  document.addEventListener("click", (e) => {
    if (!wrapper.contains(e.target)) closeBox();
  });

  inputEl._closeAutocomplete = closeBox;
}

// --- Search logic ---
function searchBuses() {
  const start = (document.getElementById("start") || {}).value || "";
  const end = (document.getElementById("end") || {}).value || "";
  const resultsDiv = document.getElementById("results");
  if (!resultsDiv) return;
  resultsDiv.innerHTML = "";

  if (!start.trim() || !end.trim()) {
    resultsDiv.innerHTML = `<p class='text-gray-400 text-center'>${langData[currentLang].noResult}</p>`;
    return;
  }

  // 🔍 Filter buses that include both stops
  const matches = buses.filter(bus =>
    Array.isArray(bus.routes) &&
    bus.routes.includes(start) &&
    bus.routes.includes(end)
  );

  if (!matches.length) {
    resultsDiv.innerHTML = `<p class='text-gray-400 text-center'>${langData[currentLang].noResult}</p>`;
    return;
  }

  // 🎨 Render each bus card
  matches.forEach(bus => {
    const card = document.createElement("div");
    card.className = "bus-card bg-gray-900 p-4 rounded-lg shadow-md mb-4 cursor-pointer";

    // 🖼 Add image
    const cardImg = document.createElement("img");
    cardImg.className = "w-full h-40 object-cover rounded-md mb-2";
    cardImg.src = getImagePath(bus);
    cardImg.onerror = () => {
      cardImg.src = "assets/buses/default.jpg";
    };
    card.appendChild(cardImg);

    // 📝 Add name
    const name = document.createElement("h3");
    name.className = "text-lg font-bold text-white";
    name.innerText = currentLang === "en" ? bus.english : bus.bangle;
    card.appendChild(name);

    // 🛠 Add service type
    const svc = document.createElement("p");
    svc.className = "text-sm text-gray-400";
    svc.innerText = `${langData[currentLang].service}: ${translateService(bus.service_type)}`;
    card.appendChild(svc);

    // ⏰ Add time (show N/A if missing)
    const timeEl = document.createElement("p");
    timeEl.className = "text-sm text-gray-400";
    timeEl.innerText = `${langData[currentLang].time}: ${bus.time ? bus.time : "N/A"}`;
    card.appendChild(timeEl);

    // 📦 Add click handler to open modal
    card.onclick = () => showDetails(bus);

    resultsDiv.appendChild(card);
  });
}

// --- History functions ---
function addToHistory(start, end) {
  if (history.length === 0 || history[history.length - 1].start !== start || history[history.length - 1].end !== end) {
    history.push({ start, end });
    if (history.length > 20) history.shift();
    localStorage.setItem("history", JSON.stringify(history));
    renderHistory();
  }
}

function renderHistory() {
  const historyList = document.getElementById("historyList");
  if (!historyList) return;
  historyList.innerHTML = "";
  history.slice().reverse().forEach(item => {
    const li = document.createElement("li");
    li.className = "flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-700 cursor-pointer transition";
    const startText = translateStop(item.start);
    const endText = translateStop(item.end);
    li.innerHTML = `<span class="text-teal-400">🕘</span><span class="flex-1 truncate">${startText} → ${endText}</span>`;
    li.addEventListener("click", () => {
      const sIn = document.getElementById("start");
      const eIn = document.getElementById("end");
      if (sIn) sIn.value = item.start;
      if (eIn) eIn.value = item.end;
      searchBuses();
    });
    historyList.appendChild(li);
  });
}

// --- Modal ---
function showDetails(bus) {
  console.log("Opening modal for:", bus.english, bus.image);

  const img   = document.getElementById("busImage");
  const name  = document.getElementById("busName");
  const bang  = document.getElementById("busBangla");
  const svc   = document.getElementById("busService");
  const t     = document.getElementById("busTime");
  const route = document.getElementById("busRoute");

  if (img) {
    img.src = getImagePath(bus); // ✅ use helper dynamically
    img.onerror = () => {
      img.src = "assets/buses/default.jpg"; // fallback
    };
  }

  if (name) {
    name.innerText = currentLang === "en"
      ? (bus.english || "")
      : (bus.bangle || bus.english || "অজানা");
  }

  if (bang) {
    bang.innerText = currentLang === "en" ? (bus.bangle || "") : "";
  }

  if (svc) {
    svc.innerText = `${langData[currentLang].service}: ${translateService(bus.service_type)}`;
  }

  if (t) {
  t.innerText = `${langData[currentLang].time}: ${bus.time ? bus.time : "N/A"}`;
}

  if (route) {
    route.innerHTML = Array.isArray(bus.routes)
      ? bus.routes.map(s => `<li>${translateStop(s)}</li>`).join("")
      : "";
  }

  const details = document.getElementById("details");
  if (details) details.classList.remove("hidden");
}

function closeDetails() {
  const details = document.getElementById("details");
  if (details) details.classList.add("hidden");
}

// --- Helper ---
function getImagePath(bus) {
  if (bus.image) {
    // Full Firebase URL
    if (bus.image.startsWith("http")) {
      return bus.image;
    }
    // Local filename (Bengali or English)
    return `assets/buses/${encodeURIComponent(bus.image)}`;
  }

  if (bus.filename) {
    return `assets/buses/${encodeURIComponent(bus.filename)}`;
  }

  return "assets/buses/default.jpg"; // fallback
}

// --- Init wiring ---
document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById("searchBtn");
  if (searchBtn) searchBtn.addEventListener("click", searchBuses);
  const langToggle = document.getElementById("langToggle");
  if (langToggle) langToggle.addEventListener("click", () => setLanguage(currentLang === "en" ? "bn" : "en"));
  setLanguage(currentLang);
  loadBuses();
});

document.getElementById("clearHistoryBtn").addEventListener("click", () => {
  // Clear from localStorage
  localStorage.removeItem("busHistory");

  // Clear from DOM
  const historyList = document.getElementById("historyList");
  historyList.innerHTML = "";
});
