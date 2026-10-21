"use strict";
document.documentElement.classList.add("js");

// Every page visit starts with its heading and image, including history returns.
if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
window.addEventListener("pageshow", () => {
  window.scrollTo({top: 0, left: 0, behavior: "instant"});
});

// Shared navigation also works on all four section pages.
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#main-navigation");
function closeMenu() {
  menuButton.setAttribute("aria-expanded", "false");
  navigation.classList.remove("is-open");
}
menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  navigation.classList.toggle("is-open", !isOpen);
});
navigation.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
document.querySelector(".header-membership").addEventListener("click", closeMenu);
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    if (menuButton.getAttribute("aria-expanded") === "true") {
      closeMenu();
      menuButton.focus();
    }
  }
});
document.addEventListener("click", event => {
  if (!event.target.closest(".site-header")) closeMenu();
});
window.matchMedia("(min-width: 961px)").addEventListener("change", closeMenu);

// Concert facts are maintained in the concert section of index.html, once.
if (document.querySelector("#featured-event")) {
const eventName = document.querySelector("#event-name").textContent.replace(/\s+/g, " ").trim();
const eventDate = new Date(document.querySelector("#event-date").dateTime);
const eventTime = document.querySelector("#event-time").textContent;
const eventLocation = document.querySelector("#event-location").textContent;
const shortDate = new Intl.DateTimeFormat("de-DE", {day:"2-digit", month:"short", timeZone:"Europe/Berlin"}).format(eventDate).replaceAll(".", "").toUpperCase();
const eventCopies = {name:eventName, shortDate, time:eventTime};
document.querySelectorAll("[data-event-copy]").forEach(element => {
  element.textContent = eventCopies[element.dataset.eventCopy];
});

const calendarButton = document.querySelector("#save-calendar");
calendarButton.hidden = false;
function escapeCalendar(value) {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
}
function utcCalendarDate(date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}
function foldCalendarLine(line) {
  const encoder = new TextEncoder();
  let result = "", bytes = 0;
  for (const character of line) {
    const length = encoder.encode(character).length;
    if (bytes + length > 75) {
      result += "\r\n ";
      bytes = 1;
    }
    result += character;
    bytes += length;
  }
  return result;
}
calendarButton.addEventListener("click", () => {
  const calendar = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Musikverein Bad Fuessing//Website01//DE", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "BEGIN:VEVENT",
    "UID:jahreskonzert-2026@musikverein-badfuessing.de",
    `DTSTAMP:${utcCalendarDate(new Date())}`,
    `DTSTART:${utcCalendarDate(eventDate)}`,
    `SUMMARY:${escapeCalendar("JUBO Bad Füssing – " + eventName)}`,
    `LOCATION:${escapeCalendar(eventLocation)}`,
    `DESCRIPTION:${escapeCalendar("Jahreskonzert 2026 des Musikvereins Bad Füssing. Eintritt frei – Spenden erbeten. Platzkarten ab 2. November bei den VR-Banken in Bad Füssing, Sonnenstraße 4 und Thermalbadstraße 20.")}`,
    "END:VEVENT", "END:VCALENDAR", ""
  ].map(foldCalendarLine).join("\r\n");
  const file = URL.createObjectURL(new Blob([calendar], {type:"text/calendar;charset=utf-8"}));
  const download = document.createElement("a");
  download.href = file;
  download.download = "JUBO-Jahreskonzert-2026.ics";
  document.body.append(download);
  download.click();
  download.remove();
  window.setTimeout(() => URL.revokeObjectURL(file), 30000);
  document.querySelector("#calendar-status").textContent = "Die Kalenderdatei wurde zum Download bereitgestellt.";
});
}

const photoDialog = document.querySelector("#photo-dialog");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxCaption = document.querySelector("#lightbox-caption");
if (photoDialog && typeof photoDialog.showModal === "function") {
  document.querySelectorAll("[data-lightbox]").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      lightboxImage.src = link.getAttribute("href");
      lightboxImage.alt = link.querySelector("img").alt;
      lightboxCaption.textContent = link.dataset.caption;
      photoDialog.showModal();
    });
  });
  document.querySelector(".lightbox-close").addEventListener("click", () => photoDialog.close());
  photoDialog.addEventListener("click", event => {
    const bounds = photoDialog.getBoundingClientRect();
    if (event.target === photoDialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) photoDialog.close();
  });
}

if ("IntersectionObserver" in window) {
  const sections = ["verein", "mitspielen", "termine", "unterstuetzen", "kontakt"].map(id => document.getElementById(id)).filter(Boolean);
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navigation.querySelectorAll('a[href^="#"]').forEach(link => link.classList.toggle("is-active", link.getAttribute("href") === "#" + entry.target.id));
      }
    });
  }, {rootMargin:"-18% 0px -58% 0px", threshold:0});
  sections.forEach(section => sectionObserver.observe(section));
}
