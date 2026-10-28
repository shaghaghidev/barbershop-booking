/**
 * ============================================================================
 * 💈 Arses Luxury Barbershop — Online Booking System (سامانه نوبت‌دهی آنلاین آرایشگاه)
 * ✨ Designed & Developed by: Abolfazl Shaghaghi (ابوالفضل شقاقی)
 * 🌐 Website & Portfolio: https://shaghaghidev.ir
 * 🛠 Pure Vanilla JavaScript | Intl.DateTimeFormat Jalali Calendar | localStorage
 * ============================================================================
 */

// ============================================================================
// ۱. داده‌های پایه (خدمات با آیکون و بج اختصاصی، آرایشگران، ساعت‌های کاری)
// ============================================================================

const SERVICES = [
  {
    id: 'haircut-modern',
    name: 'اصلاح مو و فید تخصصی',
    duration: 45,
    price: 350000,
    desc: 'کوتاهی مدرن، فید دقیق دور سر و شستشو',
    icon: '✂️',
    tag: 'پرطرفدار',
  },
  {
    id: 'beard-grooming',
    name: 'اصلاح و خط‌اندازی ریش',
    duration: 30,
    price: 220000,
    desc: 'تنظیم و قرینه‌سازی ریش با تیغ و حوله گرم',
    icon: '🪒',
    tag: 'کلاسیک',
  },
  {
    id: 'hair-styling',
    name: 'شستشو و استایل حرفه‌ای مو',
    duration: 25,
    price: 180000,
    desc: 'شستشوی تقویتی، براشینگ و حالت‌دهی',
    icon: '✨',
    tag: '',
  },
  {
    id: 'facial-care',
    name: 'پاکسازی پوست و ماسک زغال',
    duration: 45,
    price: 450000,
    desc: 'لایه‌برداری، بخور گرم و ماسک شاداب‌کننده',
    icon: '🧖‍♂️',
    tag: 'ویژه',
  },
  {
    id: 'vip-package',
    name: 'پکیج کامل VIP (مو + ریش + فیشیال)',
    duration: 90,
    price: 950000,
    desc: 'سرویس کامل پیرایش داماد و VIP بدون معطلی',
    icon: '👑',
    tag: 'VIP طلایی',
  },
];

const STYLISTS = [
  {
    id: 'any',
    name: 'اولین آرایشگر خالی',
    role: 'سریع‌ترین زمان ممکن (پیشنهادی)',
    badge: '⚡',
  },
  {
    id: 'reza',
    name: 'رضا فرهمند',
    role: 'مستر فید و استایل کلاسیک · ★ ۴.۹',
    badge: 'ر',
  },
  {
    id: 'farhad',
    name: 'فرهاد کاظمی',
    role: 'طراح مو و کوتاهی مدرن · ★ ۴.۸',
    badge: 'ف',
  },
  {
    id: 'amir',
    name: 'امیر شاهی',
    role: 'متخصص ریش و گریم داماد · ★ ۴.۹',
    badge: 'ا',
  },
];

const TIME_SLOTS = [
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
];

const STORAGE_KEY_BOOKINGS = 'arses_vanilla_bookings_v1';
const STORAGE_KEY_THEME = 'arses_vanilla_theme_v1';

// ============================================================================
// ۲. توابع کمکی ارقام فارسی و تقویم شمسی (Intl.DateTimeFormat)
// ============================================================================

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/** تبدیل اعداد انگلیسی به فارسی */
function toPersianDigits(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

/** تبدیل اعداد فارسی و عربی به انگلیسی برای اعتبارسنجی */
function toEnglishDigits(str) {
  if (!str) return '';
  return String(str)
    .replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}

/** فرمت مبلغ به تومان با ارقام فارسی */
function formatPrice(amount) {
  return `${toPersianDigits(Number(amount).toLocaleString('en-US'))} تومان`;
}

/** فرمت مدت زمان به دقیقه */
function formatDuration(mins) {
  return `${toPersianDigits(mins)} دقیقه`;
}

/** کلید یکتای تاریخ میلادی به صورت YYYY-MM-DD */
function toIsoDateKey(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const persianPartsFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const persianNumericFormatter = new Intl.DateTimeFormat('en-US-u-ca-persian', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
});

function getJalaliInfo(dateObj) {
  const parts = persianPartsFormatter.formatToParts(dateObj);
  let weekday = '';
  let day = '';
  let month = '';
  let year = '';

  parts.forEach((p) => {
    if (p.type === 'weekday') weekday = p.value;
    if (p.type === 'day') day = p.value;
    if (p.type === 'month') month = p.value;
    if (p.type === 'year') year = p.value;
  });

  const numParts = persianNumericFormatter.formatToParts(dateObj);
  let jy = 1405;
  let jm = 1;
  let jd = 1;
  numParts.forEach((p) => {
    if (p.type === 'year') jy = parseInt(p.value, 10);
    if (p.type === 'month') jm = parseInt(p.value, 10);
    if (p.type === 'day') jd = parseInt(p.value, 10);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateObj);
  target.setHours(0, 0, 0, 0);

  const isToday = today.getTime() === target.getTime();
  const isPast = target.getTime() < today.getTime();
  const isFriday = dateObj.getDay() === 5;

  return {
    isoKey: toIsoDateKey(dateObj),
    dateObj: target,
    weekday,
    day,
    month,
    year,
    jy,
    jm,
    jd,
    fullLabel: `${weekday} ${day} ${month}`,
    fullWithYear: `${weekday} ${day} ${month} ${year}`,
    isToday,
    isPast,
    isFriday,
  };
}

/** تولید آرایه ۱۴ روز آینده از امروز */
function getNext14Days() {
  const list = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);

  for (let i = 0; i < 14; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    list.push(getJalaliInfo(d));
  }
  return list;
}

/** تولید روزهای یک ماه شمسی مشخص */
function getDaysOfJalaliMonth(targetJy, targetJm) {
  const days = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const startSearch = new Date(now);
  startSearch.setDate(now.getDate() - 45);

  for (let i = 0; i < 160; i++) {
    const d = new Date(startSearch);
    d.setDate(startSearch.getDate() + i);
    const info = getJalaliInfo(d);
    if (info.jy === targetJy && info.jm === targetJm) {
      days.push(info);
    }
  }
  return days;
}

// ============================================================================
// ۳. وضعیت برنامه (Application State) و مدیریت LocalStorage
// ============================================================================

const next14Days = getNext14Days();
const firstOpenDay = next14Days.find((d) => !d.isFriday) || next14Days[0];

const state = {
  selectedServiceIds: [SERVICES[0].id],
  selectedStylistId: 'any',
  selectedDateInfo: firstOpenDay,
  selectedTimeSlot: '11:00',
  calYear: firstOpenDay.jy,
  calMonth: firstOpenDay.jm,
  isMonthCalOpen: false,
  activeStepHighlight: 1,
  lastCreatedBooking: null,
};

/** خواندن نوبت‌ها از localStorage همراه با ۲ نوبت نمونه اولیه */
function loadBookings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKINGS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading bookings:', e);
  }

  const seedBookings = [
    {
      id: 'seed-101',
      code: '۸۴۹۲۰۱',
      customerName: 'امیرحسین کریمی',
      customerPhone: '09123456789',
      serviceIds: ['haircut-modern'],
      serviceNames: ['اصلاح مو و فید تخصصی'],
      stylistId: 'reza',
      stylistName: 'رضا فرهمند',
      isoDate: firstOpenDay.isoKey,
      dateLabel: firstOpenDay.fullWithYear,
      timeSlot: '10:00',
      totalDuration: 45,
      totalPrice: 350000,
      isUserOwned: false,
    },
    {
      id: 'seed-102',
      code: '۵۱۲۹۴۰',
      customerName: 'سهراب محمدی',
      customerPhone: '09351112233',
      serviceIds: ['vip-package'],
      serviceNames: ['پکیج کامل VIP (مو + ریش + فیشیال)'],
      stylistId: 'farhad',
      stylistName: 'فرهاد کاظمی',
      isoDate: firstOpenDay.isoKey,
      dateLabel: firstOpenDay.fullWithYear,
      timeSlot: '16:00',
      totalDuration: 90,
      totalPrice: 950000,
      isUserOwned: false,
    },
  ];

  saveBookings(seedBookings);
  return seedBookings;
}

function saveBookings(list) {
  try {
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(list));
  } catch (e) {
    console.error('Error saving bookings:', e);
  }
}

/** بررسی پر یا خالی بودن یک ساعت در تاریخ و آرایشگر انتخابی */
function isTimeSlotBooked(isoDate, timeSlot, selectedStylistId) {
  const bookings = loadBookings();
  const realStylistIds = ['reza', 'farhad', 'amir'];

  const totalMins = getSelectedServices().reduce((sum, s) => sum + s.duration, 0);
  const slotIndex = TIME_SLOTS.indexOf(timeSlot);
  const slotsNeeded = totalMins > 60 ? 2 : 1;

  const targetSlots = [];
  for (let i = 0; i < slotsNeeded; i++) {
    const s = TIME_SLOTS[slotIndex + i];
    if (!s) return true;
    targetSlots.push(s);
  }

  if (selectedStylistId !== 'any') {
    return bookings.some(
      (b) =>
        b.isoDate === isoDate &&
        b.stylistId === selectedStylistId &&
        targetSlots.includes(b.timeSlot)
    );
  } else {
    const busyCount = realStylistIds.filter((stId) =>
      bookings.some(
        (b) =>
          b.isoDate === isoDate &&
          b.stylistId === stId &&
          targetSlots.includes(b.timeSlot)
      )
    ).length;

    return busyCount >= realStylistIds.length;
  }
}

function getSelectedServices() {
  return SERVICES.filter((s) => state.selectedServiceIds.includes(s.id));
}

// ============================================================================
// ۴. رندر کردن رابط کاربری (DOM Rendering)
// ============================================================================

function renderAll() {
  renderServices();
  renderStylists();
  renderDateStrip();
  renderMonthCalendar();
  renderTimeSlots();
  renderSummaryAndRecap();
  renderProgressIndicator();
  renderMyBookingsBadge();
}

/** بروزرسانی نوار پیشرفت انیمیشنی */
function renderProgressIndicator() {
  const s1 = document.getElementById('stepIndicator1');
  const s2 = document.getElementById('stepIndicator2');
  const s3 = document.getElementById('stepIndicator3');
  const fill = document.getElementById('animatedProgressFill');

  const step = state.activeStepHighlight;
  if (s1) s1.classList.toggle('active', step >= 1);
  if (s2) s2.classList.toggle('active', step >= 2);
  if (s3) s3.classList.toggle('active', step >= 3);

  if (fill) {
    const percent = step === 1 ? 35 : step === 2 ? 70 : 100;
    fill.style.width = `${percent}%`;
  }
}

/** گام ۱ (بخش اول): رندر لیست خدمات با آیکون و بج اختصاصی */
function renderServices() {
  const grid = document.getElementById('servicesGrid');
  const summaryEl = document.getElementById('selectedServicesSummary');
  if (!grid) return;

  const selectedList = getSelectedServices();
  if (summaryEl) {
    summaryEl.textContent = `${toPersianDigits(selectedList.length)} خدمت انتخاب شده`;
  }

  grid.innerHTML = SERVICES.map((service) => {
    const isSelected = state.selectedServiceIds.includes(service.id);
    return `
      <button
        type="button"
        class="service-card ${isSelected ? 'selected' : ''}"
        data-service-id="${service.id}"
        aria-pressed="${isSelected}"
      >
        <div class="service-card-left">
          <div class="service-icon-badge" aria-hidden="true">${service.icon}</div>
          <div class="service-info">
            <div class="service-title-row">
              <span class="service-name">${service.name}</span>
              ${service.tag ? `<span class="service-tag">${service.tag}</span>` : ''}
            </div>
            <div class="service-meta">${service.desc} · ${formatDuration(service.duration)}</div>
          </div>
        </div>
        <div class="service-right">
          <div class="check-box" aria-hidden="true">${isSelected ? '✓' : ''}</div>
          <div class="service-price">${formatPrice(service.price)}</div>
        </div>
      </button>
    `;
  }).join('');

  grid.querySelectorAll('.service-card').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-service-id');
      const exists = state.selectedServiceIds.includes(id);

      if (exists) {
        if (state.selectedServiceIds.length > 1) {
          state.selectedServiceIds = state.selectedServiceIds.filter((item) => item !== id);
        }
      } else {
        state.selectedServiceIds.push(id);
      }

      state.activeStepHighlight = 1;
      ensureValidTimeSlot();
      renderAll();
    });
  });
}

/** گام ۱ (بخش دوم): رندر لیست آرایشگران */
function renderStylists() {
  const grid = document.getElementById('stylistsGrid');
  if (!grid) return;

  grid.innerHTML = STYLISTS.map((stylist) => {
    const isSelected = state.selectedStylistId === stylist.id;
    return `
      <button
        type="button"
        class="stylist-card ${isSelected ? 'selected' : ''}"
        data-stylist-id="${stylist.id}"
        aria-pressed="${isSelected}"
      >
        <div class="stylist-main">
          <div class="stylist-avatar" aria-hidden="true">${stylist.badge}</div>
          <div>
            <div class="stylist-name">${stylist.name}</div>
            <div class="stylist-role">${stylist.role}</div>
          </div>
        </div>
        <div class="check-box" aria-hidden="true">${isSelected ? '✓' : ''}</div>
      </button>
    `;
  }).join('');

  grid.querySelectorAll('.stylist-card').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-stylist-id');
      state.selectedStylistId = id;
      state.activeStepHighlight = 2;
      ensureValidTimeSlot();
      renderAll();
    });
  });
}

/** گام ۲ (بخش اول): رندر نوار ۱۴ روز آینده شمسی */
function renderDateStrip() {
  const strip = document.getElementById('dateStrip');
  const labelEl = document.getElementById('selectedDateLabel');
  if (!strip) return;

  if (labelEl && state.selectedDateInfo) {
    labelEl.textContent = `تاریخ انتخابی: ${state.selectedDateInfo.fullWithYear}`;
  }

  const isCustomDateIn14 = next14Days.some(
    (d) => d.isoKey === state.selectedDateInfo.isoKey
  );
  const displayDays = isCustomDateIn14
    ? next14Days
    : [state.selectedDateInfo, ...next14Days];

  strip.innerHTML = displayDays
    .map((dayInfo) => {
      const isSelected = dayInfo.isoKey === state.selectedDateInfo.isoKey;
      const isClosed = dayInfo.isFriday;

      return `
        <button
          type="button"
          class="date-pill ${isSelected ? 'selected' : ''}"
          data-iso="${dayInfo.isoKey}"
          ${isClosed ? 'disabled' : ''}
        >
          <span class="date-weekday">${dayInfo.weekday}</span>
          <span class="date-daynum">${dayInfo.day}</span>
          <span class="date-month">${dayInfo.month}</span>
          ${
            isClosed
              ? '<span class="date-closed-tag">تعطیل</span>'
              : dayInfo.isToday
              ? '<span class="date-today-tag">امروز</span>'
              : ''
          }
        </button>
      `;
    })
    .join('');

  strip.querySelectorAll('.date-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      const iso = btn.getAttribute('data-iso');
      const found = displayDays.find((d) => d.isoKey === iso);
      if (found && !found.isFriday) {
        state.selectedDateInfo = found;
        state.calYear = found.jy;
        state.calMonth = found.jm;
        state.activeStepHighlight = 2;
        ensureValidTimeSlot();
        renderAll();
      }
    });
  });
}

/** گام ۲ (بخش تقویم ماهانه شمسی) */
function renderMonthCalendar() {
  const box = document.getElementById('monthCalendarBox');
  const titleEl = document.getElementById('calMonthTitle');
  const gridEl = document.getElementById('calDaysGrid');
  if (!box || !gridEl || !titleEl) return;

  box.classList.toggle('hidden', !state.isMonthCalOpen);
  if (!state.isMonthCalOpen) return;

  const monthDays = getDaysOfJalaliMonth(state.calYear, state.calMonth);
  if (monthDays.length === 0) return;

  titleEl.textContent = `${monthDays[0].month} ${monthDays[0].year}`;

  const firstJsDay = monthDays[0].dateObj.getDay();
  const offset = (firstJsDay + 1) % 7;

  let html = '';
  for (let i = 0; i < offset; i++) {
    html += `<div class="cal-day-empty"></div>`;
  }

  monthDays.forEach((info) => {
    const isSelected = info.isoKey === state.selectedDateInfo.isoKey;
    const isDisabled = info.isPast || info.isFriday;

    html += `
      <button
        type="button"
        class="cal-day-btn ${isSelected ? 'selected' : ''}"
        data-cal-iso="${info.isoKey}"
        ${isDisabled ? 'disabled' : ''}
      >
        <span>${info.day}</span>
      </button>
    `;
  });

  gridEl.innerHTML = html;

  gridEl.querySelectorAll('.cal-day-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const iso = btn.getAttribute('data-cal-iso');
      const chosen = monthDays.find((d) => d.isoKey === iso);
      if (chosen && !chosen.isPast && !chosen.isFriday) {
        state.selectedDateInfo = chosen;
        state.isMonthCalOpen = false;
        state.activeStepHighlight = 2;
        ensureValidTimeSlot();
        renderAll();
      }
    });
  });
}

/** گام ۲ (بخش دوم): رندر دکمه‌های ساعت حضور */
function renderTimeSlots() {
  const grid = document.getElementById('timeSlotsGrid');
  if (!grid) return;

  const isoDate = state.selectedDateInfo.isoKey;

  grid.innerHTML = TIME_SLOTS.map((slot) => {
    const booked = isTimeSlotBooked(isoDate, slot, state.selectedStylistId);
    const isSelected = !booked && state.selectedTimeSlot === slot;

    return `
      <button
        type="button"
        class="time-slot-btn ${isSelected ? 'selected' : ''}"
        data-slot="${slot}"
        ${booked ? 'disabled' : ''}
      >
        <span class="slot-time">${toPersianDigits(slot)}</span>
        <span class="slot-status">
          ${booked ? 'رزرو شده' : isSelected ? 'انتخاب شما ✓' : 'آزاد'}
        </span>
      </button>
    `;
  }).join('');

  grid.querySelectorAll('.time-slot-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const slot = btn.getAttribute('data-slot');
      state.selectedTimeSlot = slot;
      state.activeStepHighlight = 3;
      renderAll();
    });
  });
}

/** اطمینان از اینکه ساعت انتخابی فعلی پر نباشد */
function ensureValidTimeSlot() {
  const isoDate = state.selectedDateInfo.isoKey;
  if (
    !state.selectedTimeSlot ||
    isTimeSlotBooked(isoDate, state.selectedTimeSlot, state.selectedStylistId)
  ) {
    const firstFree = TIME_SLOTS.find(
      (slot) => !isTimeSlotBooked(isoDate, slot, state.selectedStylistId)
    );
    state.selectedTimeSlot = firstFree || '';
  }
}

/** گام ۳ و نوار پایین: رندر خلاصه نوبت و جمع هزینه */
function renderSummaryAndRecap() {
  const selectedServices = getSelectedServices();
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const stylistObj =
    STYLISTS.find((s) => s.id === state.selectedStylistId) || STYLISTS[0];

  const recapBox = document.getElementById('liveBookingRecap');
  if (recapBox) {
    recapBox.innerHTML = `
      <div class="recap-details">
        <div>
          <strong>خدمات:</strong> ${selectedServices.map((s) => s.name).join('، ')}
          (${formatDuration(totalDuration)})
        </div>
        <div>
          <strong>زمان:</strong> ${state.selectedDateInfo.fullWithYear} · ساعت
          <strong>${state.selectedTimeSlot ? toPersianDigits(state.selectedTimeSlot) : '—'}</strong>
          · <strong>آرایشگر:</strong> ${stylistObj.name}
        </div>
      </div>
      <div class="recap-price">${formatPrice(totalPrice)}</div>
    `;
  }

  const submitPriceTag = document.getElementById('submitBtnPriceTag');
  if (submitPriceTag) {
    submitPriceTag.textContent = formatPrice(totalPrice);
  }

  const stickyMeta = document.getElementById('stickyMetaText');
  const stickyPrice = document.getElementById('stickyPriceText');
  if (stickyMeta) {
    stickyMeta.textContent = `${toPersianDigits(selectedServices.length)} خدمت · ${formatDuration(
      totalDuration
    )} · ساعت ${toPersianDigits(state.selectedTimeSlot || '—')}`;
  }
  if (stickyPrice) {
    stickyPrice.textContent = formatPrice(totalPrice);
  }
}

/** جشن کانفتی طلایی هنگام صدور رسید VIP */
function triggerConfettiCelebration() {
  const container = document.getElementById('confettiContainer');
  if (!container) return;
  container.innerHTML = '';

  const colors = ['#F59E0B', '#FBBF24', '#D97706', '#FEF3C7', '#10B981'];
  for (let i = 0; i < 36; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = colors[i % colors.length];
    piece.style.animationDelay = `${Math.random() * 0.45}s`;
    piece.style.animationDuration = `${2.1 + Math.random() * 1.1}s`;
    container.appendChild(piece);
  }

  setTimeout(() => {
    container.innerHTML = '';
  }, 3600);
}

/** رندر کارت طلایی VIP رسید نوبت همراه با واترمارک shaghaghidev.ir */
function renderTicketView(booking) {
  const card = document.getElementById('printableTicketCard');
  if (!card || !booking) return;

  card.innerHTML = `
    <div class="ticket-top">
      <div>
        <span class="vip-badge-crown">👑 VIP GOLDEN TICKET</span>
        <div class="ticket-salon-title">پیرایش لوکس آرسس</div>
        <div class="ticket-salon-sub">تهران، زعفرانیه، خیابان آصف، پلاک ۲۴</div>
      </div>
      <div class="ticket-code-box">
        <span class="ticket-code-label">کد رهگیری اختصاصی</span>
        <span class="ticket-code-value">BRB-${booking.code}</span>
      </div>
    </div>

    <div class="ticket-perforation-line" aria-hidden="true"></div>

    <div class="ticket-rows">
      <div class="ticket-row">
        <span class="ticket-row-label">نام مراجعه‌کننده:</span>
        <span class="ticket-row-val">${booking.customerName}</span>
      </div>
      <div class="ticket-row">
        <span class="ticket-row-label">شماره موبایل:</span>
        <span class="ticket-row-val" dir="ltr">${toPersianDigits(booking.customerPhone)}</span>
      </div>
      <div class="ticket-row">
        <span class="ticket-row-label">تاریخ مراجعه (شمسی):</span>
        <span class="ticket-row-val">${booking.dateLabel}</span>
      </div>
      <div class="ticket-row">
        <span class="ticket-row-label">ساعت حضور:</span>
        <span class="ticket-row-val">${toPersianDigits(booking.timeSlot)}</span>
      </div>
      <div class="ticket-row">
        <span class="ticket-row-label">استایلیست و آرایشگر:</span>
        <span class="ticket-row-val">${booking.stylistName}</span>
      </div>
      <div class="ticket-row">
        <span class="ticket-row-label">خدمات رزرو شده:</span>
        <span class="ticket-row-val">${booking.serviceNames.join('، ')}</span>
      </div>
      <div class="ticket-row">
        <span class="ticket-row-label">مدت زمان تقریبی:</span>
        <span class="ticket-row-val">${formatDuration(booking.totalDuration)}</span>
      </div>
    </div>

    <div class="ticket-total-row">
      <span>مبلغ قابل پرداخت در سالن:</span>
      <span class="ticket-total-val">${formatPrice(booking.totalPrice)}</span>
    </div>

    <div class="ticket-watermark">
      <span>رسید رسمی سامانه نوبت‌دهی آنلاین</span>
      <span dir="ltr">
        Powered by <a href="https://shaghaghidev.ir" target="_blank" rel="noopener noreferrer">shaghaghidev.ir</a>
      </span>
    </div>
  `;
}

/** رندر بخش «نوبت‌های من» و امکان لغو فوری با یک کلیک */
function renderMyBookingsList() {
  const container = document.getElementById('myBookingsList');
  if (!container) return;

  const allBookings = loadBookings();

  if (allBookings.length === 0) {
    container.innerHTML = `
      <div class="empty-bookings-box">
        <p>هنوز هیچ نوبت فعالی ثبت نشده است.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = allBookings
    .map(
      (b) => `
      <div class="booking-item-card">
        <div class="booking-item-top">
          <div class="booking-item-date">
            ${b.dateLabel} — ساعت ${toPersianDigits(b.timeSlot)}
          </div>
          <span class="booking-item-code">کد پیگیری: BRB-${b.code}</span>
        </div>

        <div class="booking-item-details">
          <span><strong>مراجعه‌کننده:</strong> ${b.customerName} (${toPersianDigits(
            b.customerPhone
          )})</span>
          <span><strong>آرایشگر:</strong> ${b.stylistName}</span>
          <span><strong>خدمات:</strong> ${b.serviceNames.join('، ')}</span>
          <span><strong>مبلغ:</strong> ${formatPrice(b.totalPrice)}</span>
        </div>

        <div class="booking-item-actions">
          <button
            type="button"
            class="btn-outline-sm view-ticket-btn"
            data-booking-id="${b.id}"
          >
            🎫 مشاهده کارت VIP
          </button>
          <button
            type="button"
            class="btn-cancel-booking"
            data-cancel-id="${b.id}"
          >
            لغو نوبت
          </button>
        </div>
      </div>
    `
    )
    .join('');

  container.querySelectorAll('.view-ticket-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-booking-id');
      const found = loadBookings().find((b) => b.id === id);
      if (found) {
        state.lastCreatedBooking = found;
        renderTicketView(found);
        switchActiveView('ticket');
      }
    });
  });

  container.querySelectorAll('.btn-cancel-booking').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-cancel-id');
      const updated = loadBookings().filter((b) => b.id !== id);
      saveBookings(updated);
      ensureValidTimeSlot();
      renderAll();
      renderMyBookingsList();
    });
  });
}

function renderMyBookingsBadge() {
  const badge = document.getElementById('myBookingsCountBadge');
  if (!badge) return;
  const count = loadBookings().length;
  badge.textContent = toPersianDigits(count);
}

// ============================================================================
// ۵. جابجایی بین نماها (Views) و رویدادهای فرم
// ============================================================================

function switchActiveView(viewName) {
  const bookingView = document.getElementById('bookingView');
  const ticketView = document.getElementById('ticketView');
  const myBookingsView = document.getElementById('myBookingsView');
  const stickyBar = document.getElementById('stickyBottomBar');
  const tabBookingBtn = document.getElementById('tabBookingBtn');
  const tabMyBookingsBtn = document.getElementById('tabMyBookingsBtn');

  bookingView.classList.toggle('hidden', viewName !== 'booking');
  ticketView.classList.toggle('hidden', viewName !== 'ticket');
  myBookingsView.classList.toggle('hidden', viewName !== 'my-bookings');

  if (stickyBar) {
    stickyBar.classList.toggle('hidden', viewName !== 'booking');
  }

  if (tabBookingBtn && tabMyBookingsBtn) {
    tabBookingBtn.classList.toggle('active', viewName === 'booking' || viewName === 'ticket');
    tabMyBookingsBtn.classList.toggle('active', viewName === 'my-bookings');
  }

  if (viewName === 'my-bookings') {
    renderMyBookingsList();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initEvents() {
  document.getElementById('tabBookingBtn')?.addEventListener('click', () => {
    switchActiveView('booking');
  });

  document.getElementById('tabMyBookingsBtn')?.addEventListener('click', () => {
    switchActiveView('my-bookings');
  });

  document.getElementById('brandHomeBtn')?.addEventListener('click', () => {
    switchActiveView('booking');
  });

  document.getElementById('backToBookingBtn')?.addEventListener('click', () => {
    switchActiveView('booking');
  });

  // تقویم ماهانه شمسی
  document.getElementById('toggleMonthCalBtn')?.addEventListener('click', () => {
    state.isMonthCalOpen = !state.isMonthCalOpen;
    renderMonthCalendar();
  });

  document.getElementById('calPrevMonthBtn')?.addEventListener('click', () => {
    if (state.calMonth === 1) {
      state.calMonth = 12;
      state.calYear -= 1;
    } else {
      state.calMonth -= 1;
    }
    renderMonthCalendar();
  });

  document.getElementById('calNextMonthBtn')?.addEventListener('click', () => {
    if (state.calMonth === 12) {
      state.calMonth = 1;
      state.calYear += 1;
    } else {
      state.calMonth += 1;
    }
    renderMonthCalendar();
  });

  // ثبت نهایی نوبت در ۵ ثانیه
  const form = document.getElementById('confirmBookingForm');
  const nameInput = document.getElementById('customerNameInput');
  const phoneInput = document.getElementById('customerPhoneInput');
  const errorEl = document.getElementById('formErrorMsg');

  phoneInput?.addEventListener('focus', () => {
    state.activeStepHighlight = 3;
    renderProgressIndicator();
  });

  nameInput?.addEventListener('focus', () => {
    state.activeStepHighlight = 3;
    renderProgressIndicator();
  });

  phoneInput?.addEventListener('input', (e) => {
    const raw = toEnglishDigits(e.target.value).replace(/[^\d]/g, '');
    e.target.value = toPersianDigits(raw);
    errorEl?.classList.add('hidden');
  });

  nameInput?.addEventListener('input', () => {
    errorEl?.classList.add('hidden');
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();

    const customerName = (nameInput?.value || '').trim();
    const cleanPhone = toEnglishDigits(phoneInput?.value || '').trim();

    if (customerName.length < 2) {
      showError('لطفاً نام و نام خانوادگی خود را وارد کنید.');
      nameInput?.focus();
      return;
    }

    if (!/^09\d{9}$/.test(cleanPhone)) {
      showError('شماره موبایل معتبر ۱۱ رقمی وارد کنید (مثال: ۰۹۱۲۳۴۵۶۷۸۹).');
      phoneInput?.focus();
      return;
    }

    if (!state.selectedTimeSlot) {
      showError('لطفاً یک ساعت خالی از گام دوم انتخاب کنید.');
      return;
    }

    let finalStylistId = state.selectedStylistId;
    if (finalStylistId === 'any') {
      const realIds = ['reza', 'farhad', 'amir'];
      finalStylistId =
        realIds.find(
          (id) => !isTimeSlotBooked(state.selectedDateInfo.isoKey, state.selectedTimeSlot, id)
        ) || 'reza';
    }

    const stylistObj = STYLISTS.find((s) => s.id === finalStylistId) || STYLISTS[1];
    const selectedServices = getSelectedServices();
    const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
    const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
    const randomCode = toPersianDigits(Math.floor(100000 + Math.random() * 900000));

    const newBooking = {
      id: `bk-${Date.now()}`,
      code: randomCode,
      customerName,
      customerPhone: cleanPhone,
      serviceIds: selectedServices.map((s) => s.id),
      serviceNames: selectedServices.map((s) => s.name),
      stylistId: finalStylistId,
      stylistName: stylistObj.name,
      isoDate: state.selectedDateInfo.isoKey,
      dateLabel: state.selectedDateInfo.fullWithYear,
      timeSlot: state.selectedTimeSlot,
      totalDuration,
      totalPrice,
      isUserOwned: true,
    };

    const all = loadBookings();
    all.unshift(newBooking);
    saveBookings(all);

    state.lastCreatedBooking = newBooking;
    nameInput.value = '';
    phoneInput.value = '';

    ensureValidTimeSlot();
    renderAll();
    renderTicketView(newBooking);
    switchActiveView('ticket');
    triggerConfettiCelebration();
  });

  function showError(msg) {
    if (!errorEl) return;
    errorEl.textContent = msg;
    errorEl.classList.remove('hidden');
  }

  // دکمه‌های صفحه رسید
  document.getElementById('printTicketBtn')?.addEventListener('click', () => {
    window.print();
  });

  document.getElementById('goToMyBookingsBtn')?.addEventListener('click', () => {
    switchActiveView('my-bookings');
  });

  document.getElementById('bookAnotherBtn')?.addEventListener('click', () => {
    switchActiveView('booking');
  });

  // دکمه تغییر تم روشن / تیره (پیش‌فرض روی تم لوکس تیره، با قابلیت تغییر به تم کرم روشن)
  const themeBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeToggleIcon');
  const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
  if (savedTheme === 'light') {
    document.body.classList.remove('dark-theme');
    if (themeIcon) themeIcon.textContent = '🌙';
  } else {
    document.body.classList.add('dark-theme');
    if (themeIcon) themeIcon.textContent = '☀️';
  }

  themeBtn?.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-theme');
    if (themeIcon) themeIcon.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem(STORAGE_KEY_THEME, isDark ? 'dark' : 'light');
  });
}

// راه‌اندازی اولیه
document.addEventListener('DOMContentLoaded', () => {
  ensureValidTimeSlot();
  initEvents();
  renderAll();
});