/* =========================================================
   หยิบฟอร์ม
   Frontend Application
   script.js
   ========================================================= */


/* =========================================================
   1. API CONFIG
   ========================================================= */

/*
  ใส่ URL Web App ของ Apps Script ตรงนี้
  ต้องเป็น URL ที่ลงท้าย /exec?api=1
*/

const API_URL =
  "ใส่_URL_APPS_SCRIPT_ตรงนี้?api=1";


/* =========================================================
   2. APP STATE
   ========================================================= */

let appData = {
  config: {},
  news: [],
  menu: [],
  checklist: {}
};

let currentCategory = "all";
let currentSearch = "";


/* =========================================================
   3. ICONS
   ========================================================= */

const CARD_ICONS = [
  "🍱",
  "🎤",
  "🛒",
  "📦",
  "🩺",
  "🎓",
  "🧾",
  "💼",
  "📚",
  "🏫",
  "🖨️",
  "📋"
];


/* =========================================================
   4. DOM
   ========================================================= */

const elements = {};

document.addEventListener("DOMContentLoaded", function () {

  elements.systemName =
    document.getElementById("systemName");

  elements.systemSubtitle =
    document.getElementById("systemSubtitle");

  elements.organization =
    document.getElementById("organization");

  elements.newsSection =
    document.getElementById("newsSection");

  elements.newsArea =
    document.getElementById("newsArea");

  elements.menuArea =
    document.getElementById("menuArea");

  elements.resultCount =
    document.getElementById("resultCount");

  elements.categoryFilter =
    document.getElementById("categoryFilter");

  elements.searchInput =
    document.getElementById("searchInput");

  elements.clearSearch =
    document.getElementById("clearSearch");

  elements.emptyState =
    document.getElementById("emptyState");

  elements.modal =
    document.getElementById("checklistModal");

  elements.modalTitle =
    document.getElementById("modalTitle");

  elements.modalCategory =
    document.getElementById("modalCategory");

  elements.modalIcon =
    document.getElementById("modalIcon");

  elements.modalClose =
    document.getElementById("modalClose");

  elements.closeButton =
    document.getElementById("closeButton");

  elements.checklistArea =
    document.getElementById("checklistArea");

  elements.folderButton =
    document.getElementById("folderButton");

  elements.toast =
    document.getElementById("toast");


  bindEvents();

  loadData();

});


/* =========================================================
   5. EVENTS
   ========================================================= */

function bindEvents() {

  /* Search */

  elements.searchInput.addEventListener(
    "input",
    function () {

      currentSearch =
        this.value
          .trim()
          .toLowerCase();

      updateClearButton();

      renderFilteredMenu();

    }
  );


  /* Clear Search */

  elements.clearSearch.addEventListener(
    "click",
    function () {

      elements.searchInput.value = "";

      currentSearch = "";

      updateClearButton();

      renderFilteredMenu();

      elements.searchInput.focus();

    }
  );


  /* Close Modal */

  elements.modalClose.addEventListener(
    "click",
    closeModal
  );

  elements.closeButton.addEventListener(
    "click",
    closeModal
  );


  /* Click Backdrop */

  document
    .querySelectorAll("[data-close-modal]")
    .forEach(function (element) {

      element.addEventListener(
        "click",
        closeModal
      );

    });


  /* ESC */

  document.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key === "Escape" &&
        elements.modal.classList.contains("open")
      ) {

        closeModal();

      }

    }
  );

}


/* =========================================================
   6. LOAD API
   ========================================================= */

async function loadData() {

  try {

    const response = await fetch(
      API_URL,
      {
        method: "GET",
        cache: "no-store"
      }
    );


    if (!response.ok) {

      throw new Error(
        "HTTP " + response.status
      );

    }


    const data =
      await response.json();


    if (!data.success) {

      throw new Error(
        data.message ||
        "Backend ไม่สามารถส่งข้อมูลได้"
      );

    }


    appData = {

      config:
        data.config || {},

      news:
        Array.isArray(data.news)
          ? data.news
          : [],

      menu:
        Array.isArray(data.menu)
          ? data.menu
          : [],

      checklist:
        data.checklist || {}

    };


    renderApp();


  } catch (error) {

    console.error(
      "Yibform API Error:",
      error
    );

    showLoadError();

  }

}


/* =========================================================
   7. RENDER APP
   ========================================================= */

function renderApp() {

  renderConfig();

  renderNews();

  renderCategories();

  renderFilteredMenu();

}


/* =========================================================
   8. CONFIG
   ========================================================= */

function renderConfig() {

  const config =
    appData.config || {};


  const systemName =
    config["ชื่อระบบ"] ||
    "หยิบฟอร์ม";


  const subtitle =
    config["คำโปรย"] ||
    "หยิบง่าย โหลดไว ใช้ได้เลย";


  const organization =
    config["หน่วยงาน"] ||
    "";


  elements.systemName.textContent =
    systemName;

  elements.systemSubtitle.textContent =
    subtitle;

  elements.organization.textContent =
    organization;


  document.title =
    systemName;

}


/* =========================================================
   9. NEWS
   ========================================================= */

function renderNews() {

  const news =
    appData.news || [];


  if (news.length === 0) {

    elements.newsSection.style.display =
      "none";

    return;

  }


  elements.newsSection.style.display =
    "";


  elements.newsArea.innerHTML =
    news.map(function (item) {

      return `
        <article class="news-item">

          <div class="news-date">
            ${escapeHTML(item.date)}
          </div>

          <div class="news-content">

            <div class="news-title">
              ${escapeHTML(item.title)}
            </div>

            ${
              item.detail
                ? `
                  <div class="news-detail">
                    ${escapeHTML(item.detail)}
                  </div>
                `
                : ""
            }

          </div>

        </article>
      `;

    }).join("");

}


/* =========================================================
   10. CATEGORIES
   ========================================================= */

function renderCategories() {

  const categories =
    [
      ...new Set(
        appData.menu
          .map(function (item) {

            return String(
              item.category || ""
            ).trim();

          })
          .filter(Boolean)
      )
    ];


  let html = `

    <button
      type="button"
      class="filter-button active"
      data-category="all"
    >
      ทั้งหมด
    </button>

  `;


  categories.forEach(function (category) {

    html += `

      <button
        type="button"
        class="filter-button"
        data-category="${escapeAttribute(category)}"
      >
        ${escapeHTML(category)}
      </button>

    `;

  });


  elements.categoryFilter.innerHTML =
    html;


  elements.categoryFilter
    .querySelectorAll(".filter-button")
    .forEach(function (button) {

      button.addEventListener(
        "click",
        function () {

          currentCategory =
            this.dataset.category;


          elements.categoryFilter
            .querySelectorAll(
              ".filter-button"
            )
            .forEach(function (btn) {

              btn.classList.remove(
                "active"
              );

            });


          this.classList.add(
            "active"
          );


          renderFilteredMenu();

        }
      );

    });

}


/* =========================================================
   11. FILTER MENU
   ========================================================= */

function renderFilteredMenu() {

  let result =
    [...appData.menu];


  /* Category */

  if (
    currentCategory !== "all"
  ) {

    result =
      result.filter(
        function (item) {

          return (
            String(item.category) ===
            String(currentCategory)
          );

        }
      );

  }


  /* Search */

  if (currentSearch) {

    result =
      result.filter(
        function (item) {

          const checklist =
            appData.checklist[
              item.id
            ] || [];


          const documentText =
            checklist
              .map(function (doc) {

                return [
                  doc.document,
                  doc.remark
                ].join(" ");

              })
              .join(" ");


          const searchableText =
            [
              item.title,
              item.category,
              item.keyword,
              documentText
            ]
              .join(" ")
              .toLowerCase();


          return searchableText.includes(
            currentSearch
          );

        }
      );

  }


  renderMenu(result);

}


/* =========================================================
   12. RENDER MENU
   ========================================================= */

function renderMenu(menu) {

  elements.resultCount.textContent =
    menu.length + " รายการ";


  if (menu.length === 0) {

    elements.menuArea.innerHTML = "";

    elements.emptyState.hidden =
      false;

    return;

  }


  elements.emptyState.hidden =
    true;


  elements.menuArea.innerHTML =
    menu.map(
      function (item, index) {

        const icon =
          CARD_ICONS[
            index %
            CARD_ICONS.length
          ];


        return `

          <article
            class="menu-card"
            tabindex="0"
            role="button"
            data-id="${escapeAttribute(item.id)}"
          >

            <div class="card-icon">
              ${icon}
            </div>


            <div class="card-title">
              ${escapeHTML(item.title)}
            </div>


            <div class="card-bottom">

              <span class="card-category">
                ${escapeHTML(item.category)}
              </span>

              <span class="card-arrow">
                →
              </span>

            </div>

          </article>

        `;

      }
    ).join("");


  elements.menuArea
    .querySelectorAll(".menu-card")
    .forEach(function (card) {

      card.addEventListener(
        "click",
        function () {

          openChecklist(
            this.dataset.id
          );

        }
      );


      card.addEventListener(
        "keydown",
        function (event) {

          if (
            event.key === "Enter" ||
            event.key === " "
          ) {

            event.preventDefault();

            openChecklist(
              this.dataset.id
            );

          }

        }
      );

    });

}


/* =========================================================
   13. OPEN CHECKLIST
   ========================================================= */

function openChecklist(id) {

  const item =
    appData.menu.find(
      function (menuItem) {

        return (
          String(menuItem.id) ===
          String(id)
        );

      }
    );


  if (!item) {

    showToast(
      "ไม่พบข้อมูลงานนี้"
    );

    return;

  }


  const checklist =
    appData.checklist[id] || [];


  const itemIndex =
    appData.menu.findIndex(
      function (menuItem) {

        return (
          String(menuItem.id) ===
          String(id)
        );

      }
    );


  const icon =
    CARD_ICONS[
      Math.max(
        itemIndex,
        0
      ) %
      CARD_ICONS.length
    ];


  elements.modalIcon.textContent =
    icon;


  elements.modalCategory.textContent =
    item.category || "";


  elements.modalTitle.textContent =
    item.title || "รายการเอกสาร";


  renderChecklist(checklist);


  /* Folder */

  if (item.folderLink) {

    elements.folderButton.href =
      item.folderLink;

    elements.folderButton.style.display =
      "";

  } else {

    elements.folderButton.removeAttribute(
      "href"
    );

    elements.folderButton.style.display =
      "none";

  }


  /* Open */

  elements.modal.classList.add(
    "open"
  );


  elements.modal.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.classList.add(
    "modal-open"
  );

}


/* =========================================================
   14. RENDER CHECKLIST
   ========================================================= */

function renderChecklist(checklist) {

  if (
    !Array.isArray(checklist) ||
    checklist.length === 0
  ) {

    elements.checklistArea.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">
          📭
        </div>

        <h3>
          ยังไม่มีรายการเอกสาร
        </h3>

        <p>
          สามารถเปิดโฟลเดอร์แบบฟอร์มด้านล่างได้
        </p>

      </div>

    `;

    return;

  }


  elements.checklistArea.innerHTML =
    checklist.map(
      function (item, index) {

        const number =
          item.order ||
          index + 1;


        const required =
          item.required === true;


        return `

          <div class="checklist-item">

            <div class="checklist-number">
              ${escapeHTML(number)}
            </div>


            <div class="checklist-content">

              <div class="checklist-name">
                ${escapeHTML(item.document)}
              </div>


              <div class="checklist-meta">

                ${
                  required
                    ? `
                      <span class="required-badge">
                        ✓ จำเป็น
                      </span>
                    `
                    : `
                      <span class="optional-badge">
                        ไม่บังคับ
                      </span>
                    `
                }

              </div>


              ${
                item.remark
                  ? `
                    <div class="checklist-remark">
                      ${escapeHTML(item.remark)}
                    </div>
                  `
                  : ""
              }

            </div>

          </div>

        `;

      }
    ).join("");

}


/* =========================================================
   15. CLOSE MODAL
   ========================================================= */

function closeModal() {

  elements.modal.classList.remove(
    "open"
  );


  elements.modal.setAttribute(
    "aria-hidden",
    "true"
  );


  document.body.classList.remove(
    "modal-open"
  );

}


/* =========================================================
   16. CLEAR SEARCH BUTTON
   ========================================================= */

function updateClearButton() {

  if (
    elements.searchInput.value
      .trim()
  ) {

    elements.clearSearch.classList.add(
      "visible"
    );

  } else {

    elements.clearSearch.classList.remove(
      "visible"
    );

  }

}


/* =========================================================
   17. LOAD ERROR
   ========================================================= */

function showLoadError() {

  elements.newsSection.style.display =
    "none";


  elements.resultCount.textContent =
    "โหลดข้อมูลไม่สำเร็จ";


  elements.menuArea.innerHTML = `

    <div
      style="
        grid-column: 1 / -1;
        padding: 55px 20px;
        text-align: center;
      "
    >

      <div
        style="
          font-size: 42px;
          margin-bottom: 12px;
        "
      >
        🛠️
      </div>

      <h3
        style="
          margin: 0;
          font-size: 18px;
        "
      >
        เชื่อมต่อข้อมูลไม่สำเร็จ
      </h3>

      <p
        style="
          margin: 8px 0 0;
          color: #6e7a74;
          font-size: 14px;
        "
      >
        กรุณาลองเปิดหน้าเว็บใหม่อีกครั้ง
      </p>

    </div>

  `;


  showToast(
    "ไม่สามารถเชื่อมต่อระบบข้อมูลได้"
  );

}


/* =========================================================
   18. TOAST
   ========================================================= */

let toastTimer = null;


function showToast(message) {

  if (!elements.toast) {
    return;
  }


  elements.toast.textContent =
    message;


  elements.toast.classList.add(
    "show"
  );


  clearTimeout(
    toastTimer
  );


  toastTimer =
    setTimeout(
      function () {

        elements.toast.classList.remove(
          "show"
        );

      },
      3000
    );

}


/* =========================================================
   19. SECURITY HELPERS
   ========================================================= */

function escapeHTML(value) {

  return String(
    value ?? ""
  )

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}


function escapeAttribute(value) {

  return escapeHTML(
    value
  );

}


/* =========================================================
   End
   ========================================================= */
