document.addEventListener("DOMContentLoaded", async () => {
    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
    });

    if (
        !tab ||
        !tab.url ||
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

    const data = await chrome.storage.local.get([
        "globalCounter",
        "disabledDomains",
        "isGlobalEnabled",
    ]);

    const count = data.globalCounter || 0;
    let disabledDomains = data.disabledDomains || [];
    let isGlobalEnabled = data.isGlobalEnabled !== false;

    if (counterDisplay) {
        counterDisplay.textContent = count;
    }

    if (switchInput) {
        switchInput.checked = isGlobalEnabled;
        switchInput.addEventListener("change", async (e) => {
            await chrome.storage.local.set({
                isGlobalEnabled: e.target.checked,
            });
            chrome.tabs.reload(tab.id);
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

            await chrome.storage.local.set({ disabledDomains });
            updateButtonState();

            chrome.tabs.reload(tab.id);
        });
    }
});
