document.addEventListener("DOMContentLoaded", async () => {
    // Используем browser вместо chrome для Firefox
    const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
    });

    if (
        !tab ||
        !tab.url ||
        tab.url.startsWith("about:") || // Для Firefox служебные страницы начинаются с about:
        tab.url.startsWith("chrome://") ||
        tab.url.startsWith("edge://")
    ) {
        const btn = document.getElementById("disableSiteBtn");
        if (btn) {
            btn.textContent = "Недоступно на этой странице";
            btn.disabled = true;
            btn.style.backgroundColor = "#cccccc";
            btn.style.color = "#666666";
            btn.style.cursor = "not-allowed";
        }
        return;
    }

    const url = new URL(tab.url);
    const currentHost = url.hostname;

    const counterDisplay = document.getElementById("replaceCountDisplay");
    const disableSiteBtn = document.getElementById("disableSiteBtn");
    const switchInput = document.getElementById("switchInput");

    // Запрашиваем настройки из общего хранилища browser
    const data = await browser.storage.local.get([
        "disabledDomains",
        "isGlobalEnabled",
    ]);

    let disabledDomains = data.disabledDomains || [];
    let isGlobalEnabled = data.isGlobalEnabled !== false;

    // Выводим счетчик: сначала запрашиваем локальный у контент-скрипта,
    // если вкладка не отвечает (например, скрипт еще не загрузился) — пишем 0.
    if (counterDisplay) {
        try {
            const response = await browser.tabs.sendMessage(tab.id, {
                type: "GET_COUNT",
            });
            counterDisplay.textContent = response ? response.count : 0;
        } catch (error) {
            // Контент-скрипт еще не инициализирован или страница не поддерживает скрипты
            counterDisplay.textContent = 0;
        }
    }

    if (switchInput) {
        switchInput.checked = isGlobalEnabled;
        switchInput.addEventListener("change", async (e) => {
            await browser.storage.local.set({
                isGlobalEnabled: e.target.checked,
            });
            browser.tabs.reload(tab.id);
        });
    }

    function updateButtonState() {
        if (disabledDomains.includes(currentHost)) {
            disableSiteBtn.textContent = "Включить на этом сайте";
            disableSiteBtn.style.backgroundColor = "#4caf50";
            disableSiteBtn.style.color = "white";
        } else {
            disableSiteBtn.textContent = "Отключить на этом сайте";
            disableSiteBtn.style.backgroundColor = "#ff5252";
            disableSiteBtn.style.color = "white";
        }
    }

    if (disableSiteBtn) {
        updateButtonState();

        disableSiteBtn.addEventListener("click", async () => {
            if (disabledDomains.includes(currentHost)) {
                disabledDomains = disabledDomains.filter(
                    (domain) => domain !== currentHost,
                );
            } else {
                disabledDomains.push(currentHost);
            }

            await browser.storage.local.set({ disabledDomains });
            updateButtonState();

            browser.tabs.reload(tab.id);
        });
    }
});
