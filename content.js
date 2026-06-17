(async function () {
    const storageData = await browser.storage.local.get([
        "disabledDomains",
        "isGlobalEnabled",
    ]);
    const disabledDomains = storageData.disabledDomains || [];
    const currentHost = window.location.hostname;

    if (
        storageData.isGlobalEnabled === false ||
        disabledDomains.includes(currentHost)
    ) {
        return;
    }

    let isProcessing = false;
    let pageCounter = 0; // Локальный счетчик страницы
    let pendingIncrement = 0; // Буфер для группировки записи в Storage
    let storageTimeout = null;

    const replacements = {
        Киргизия: "Кыргызстан",
        киргизия: "Кыргызстан",
        КИРГИЗИЯ: "КЫРГЫЗСТАН",
        Кирги́зия: "Кыргызстан",
        кирги́зия: "Кыргызстан",
        кыргызия: "Кыргызстан",
        Кыргызия: "Кыргызстан",
        Киргизию: "Кыргызстан",
        киргизию: "Кыргызстан",
        КИРГИЗИЮ: "КЫРГЫЗСТАН",
        Киргизстан: "Кыргызстан",
        киргизстан: "Кыргызстан",
        КИРГИЗСТАН: "КЫРГЫЗСТАН",
        Киргизии: "Кыргызстане",
        киргизии: "Кыргызстане",
        КИРГИЗИИ: "КЫРГЫЗСТАНЕ",
        Киргии: "Кыргызстане",
        Киргизстана: "Кыргызстана",
        киргизстана: "Кыргызстана",
        Киргизстану: "Кыргызстану",
        киргизстану: "Кыргызстану",
        Киргизстане: "Кыргызстане",
        киргизстане: "Кыргызстане",
        Киргизией: "Кыргызстаном",
        киргизией: "Кыргызстаном",
        КИРГИЗИЕЙ: "КЫРГЫЗСТАНОМ",
        Киргизстаном: "Кыргызстаном",
        киргизстаном: "Кыргызстаном",
        киргиз: "кыргыз",
        Киргиз: "Кыргыз",
        КИРГИЗ: "КЫРГЫЗ",
        киргиза: "кыргыза",
        Киргиза: "Кыргыза",
        киргизу: "кыргызу",
        Киргизу: "Кыргизу",
        киргизом: "кыргызом",
        Киргизом: "Кыргизом",
        КИРГИЗОМ: "КЫРГЫЗОМ",
        киргизе: "кыргызе",
        Киргизе: "Кыргизе",
        киргизка: "кыргызка",
        Киргизка: "Кыргызка",
        киргизку: "кыргызку",
        Киргизку: "Кыргызку",
        киргизки: "кыргызки",
        Киргизки: "Кыргызки",
        киргизкой: "кыргызкой",
        Киргизкой: "Кыргызкой",
        киргизы: "кыргызы",
        Киргизы: "Кыргызы",
        КИРГИЗЫ: "КЫРГЫЗЫ",
        киргизов: "кыргызов",
        Киргизов: "Кыргызов",
        КИРГИЗОВ: "КЫРГЫЗОВ",
        киргизам: "кыргызам",
        Киргизам: "Кыргизам",
        киргизами: "кыргызами",
        Киргизами: "Кыргизами",
        киргизах: "кыргызах",
        Киргизах: "Кыргизах",
        киргизский: "кыргызский",
        Киргизский: "Кыргызский",
        КИРГИЗСКИЙ: "КЫРГЫЗСКИЙ",
        киргизского: "кыргызского",
        Киргизского: "Кыргызского",
        КИРГИЗСКОГО: "КЫРГЫЗСКОГО",
        киргизскому: "кыргызскому",
        Киргизскому: "Кыргызскому",
        киргизским: "кыргызским",
        Киргизским: "Кыргызским",
        киргизском: "кыргызском",
        Киргизском: "Кыргызском",
        киргизская: "кыргызская",
        Киргизская: "Кыргызская",
        Кирги́зская: "Кыргызская",
        КИРГИЗСКАЯ: "КЫРГЫЗСКАЯ",
        киргизскую: "кыргызскую",
        Киргизскую: "Кыргызскую",
        киргизской: "кыргызской",
        Киргизской: "Кыргызской",
        Кирги́зской: "Кыргызской",
        киргизское: "кыргызское",
        Киргизское: "Кыргызское",
        киргизские: "кыргызские",
        Киргизские: "Кыргызские",
        КИРГИЗСКИЕ: "КЫРГЫЗСКИЕ",
        киргизских: "кыргызских",
        Киргизских: "Кыргызских",
        КИРГИЗСКИХ: "КЫРГЫЗСКИХ",
        киргизскими: "кыргызскими",
        Киргизскими: "Кыргызскими",
        Kirgizia: "Kyrgyzstan",
        kirgizia: "Kyrgyzstan",
        KIRGIZIA: "KYRGYZSTAN",
        Kirghizia: "Kyrgyzstan",
        kirghizia: "Kyrgyzstan",
        KIRGHIZIA: "KYRGYZSTAN",
        Kirgizstan: "Kyrgyzstan",
        kirgizstan: "Kyrgyzstan",
        KIRGIZSTAN: "KYRGYZSTAN",
        Kirghizstan: "Kyrgyzstan",
        kirghizstan: "Kyrgyzstan",
        KIRGHIZSTAN: "KYRGYZSTAN",
        Kirgiz: "Kyrgyz",
        kirgiz: "kyrgyz",
        KIRGIZ: "KYRGYZ",
        Kirghiz: "Kyrgyz",
        kirghiz: "kyrgyz",
        KIRGHIZ: "KYRGYZ",
    };

    const escapedKeys = Object.keys(replacements)
        .sort((a, b) => b.length - a.length)
        .map((k) => k.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&"));
    const mainRegExp = new RegExp(
        `(?<=\\s|^|[0-9.?:!,;\\-«'"(])(${escapedKeys.join("|")})(?=\\s|$|[0-9.?:!,;\\-»'")])`,
        "gmu",
    );

    // Атомарное и сгруппированное обновление Storage
    function queueStorageUpdate(count) {
        pendingIncrement += count;

        if (storageTimeout) clearTimeout(storageTimeout);

        // Записываем в Storage только если за 500мс не было новых замен
        storageTimeout = setTimeout(async () => {
            const toAdd = pendingIncrement;
            pendingIncrement = 0; // Сбрасываем буфер перед асинхронной операцией

            const data = await browser.storage.local.get("globalCounter");
            const currentGlobal = data.globalCounter || 0;
            await browser.storage.local.set({
                globalCounter: currentGlobal + toAdd,
            });
        }, 500);
    }

    function processTextNode(node) {
        const text = node.nodeValue;
        if (!text || !mainRegExp.test(text)) return 0;
        mainRegExp.lastIndex = 0;
        const fragment = document.createDocumentFragment();
        let lastIndex = 0,
            match,
            count = 0;

        while ((match = mainRegExp.exec(text)) !== null) {
            if (match.index > lastIndex)
                fragment.appendChild(
                    document.createTextNode(
                        text.substring(lastIndex, match.index),
                    ),
                );

            const span = document.createElement("span");
            span.className = "kg-tooltip";
            const del = document.createElement("del");
            del.className = "kg-tooltip-del";
            del.textContent = match[0];

            span.appendChild(del);
            span.appendChild(
                document.createTextNode(` ${replacements[match[0]]}`),
            );
            fragment.appendChild(span);

            lastIndex = mainRegExp.lastIndex;
            count++;
        }
        if (lastIndex < text.length)
            fragment.appendChild(
                document.createTextNode(text.substring(lastIndex)),
            );

        node.replaceWith(fragment);
        return count;
    }

    function walkAndReplace(rootNode) {
        const walker = document.createTreeWalker(
            rootNode,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode(node) {
                    const p = node.parentElement;
                    if (
                        !p ||
                        [
                            "SCRIPT",
                            "STYLE",
                            "TEXTAREA",
                            "NOSCRIPT",
                            "IFRAME",
                            "CODE",
                            "PRE",
                        ].includes(p.tagName) ||
                        p.isContentEditable ||
                        p.closest(".kg-tooltip-box")
                    )
                        return NodeFilter.FILTER_REJECT;
                    return NodeFilter.FILTER_ACCEPT;
                },
            },
        );

        const nodes = [];
        let n;
        while ((n = walker.nextNode())) nodes.push(n);

        let localMatchCount = 0;
        for (let i = 0; i < nodes.length; i++) {
            localMatchCount += processTextNode(nodes[i]);
        }

        if (localMatchCount > 0) {
            pageCounter += localMatchCount; // Обновляем локальный счетчик вкладки

            // Отправляем UI-обновления (выполняются мгновенно в памяти)
            browser.runtime.sendMessage({
                type: "UPDATE_COUNTER",
                count: pageCounter,
            });
            browser.runtime.sendMessage({
                type: "UPDATE_TAB_BADGE",
                count: pageCounter,
            });

            // Буферизируем тяжелую запись на диск
            queueStorageUpdate(localMatchCount);
        }
    }

    // Ответ попапу возвращает актуальный pageCounter текущей вкладки
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === "GET_COUNT") {
            sendResponse({ count: pageCounter });
        }
    });

    function safeProcess(root) {
        if (isProcessing) return;
        isProcessing = true;
        observer.disconnect();
        walkAndReplace(root);
        observer.observe(document.body, { childList: true, subtree: true });
        isProcessing = false;
    }

    const observer = new MutationObserver((mutations) => {
        for (const mut of mutations) {
            for (const node of mut.addedNodes) {
                if (node.nodeType === 1 || node.nodeType === 3) {
                    safeProcess(
                        node.nodeType === 1 ? node : node.parentElement,
                    );
                }
            }
        }
    });

    const run = () => {
        safeProcess(document.body);
    };

    if (document.readyState === "loading")
        document.addEventListener("DOMContentLoaded", run);
    else run();

    // Тултипы (без изменений)
    let tooltipContent = null;
    function getTooltip() {
        /* ... Ваша реализация тултипа ... */ return tooltipContent;
    }
    document.addEventListener("mouseover", (e) => {
        /* ... */
    });
    document.addEventListener("mouseout", (e) => {
        /* ... */
    });
})();
