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

    let pageCounter = 0;
    let pendingIncrement = 0;
    let storageTimeout = null;

    const replacements = {
        Киргизия: "Кыргызстан",
        киргизия: "Кыргызстан",
        КИРГИЗИЯ: "КЫРГЫЗСТАН",
        Кирги́зия: "Кыргызстан",
        мирги́зия: "Кыргызстан",
        кирги́зия: "Кыргызстан",
        кыргызия: "Кыргызстан",
        Кыргызия: "Кыргызстан",
        Киргизию: "Кыргызстан",
        киргизию: "Кыргызстан",
        КИРГИЗИЮ: "КЫРГЫЗСТАН",
        Киргизстан: "Кыргызстан",
        миргизстан: "Кыргызстан",
        киргизстан: "Кыргызстан",
        КИРГИЗСТАН: "КЫРГЫЗСТАН",
        Киргизии: "Кыргызстане",
        киргизии: "Кыргызстане",
        КИРГИЗИИ: "КЫРГЫЗСТАНЕ",
        Киргии: "Кыргызстане",
        Киргизстана: "Кыргызстана",
        миргизстана: "Кыргызстана",
        киргизстана: "Кыргызстана",
        Киргизстану: "Кыргызстану",
        киргизстану: "Кыргызстану",
        Киргизстане: "Кыргызстане",
        киргизстане: "Кыргызстане",
        Киргизией: "Кыргызстаном",
        киргизией: "Кыргызстаном",
        КИРГИЗИЕЙ: "КЫРГЫЗСТАНОМ",
        Kirgizstanam: "Кыргызстаном",
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
        киргизки: "кыргызki",
        Киргизки: "Кыргызки",
        киргизкой: "кыргызкой",
        Киргизкой: "Кыргызкой",
        миргизы: "кыргызы",
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

    const ignoredTags = new Set([
        "SCRIPT",
        "STYLE",
        "TEXTAREA",
        "NOSCRIPT",
        "IFRAME",
        "CODE",
        "PRE",
    ]);

    function shouldSkipNode(node) {
        const p = node.parentElement;
        if (!p) return true;
        if (ignoredTags.has(p.tagName)) return true;
        if (p.isContentEditable) return true;
        if (p.closest(".kg-tooltip-box, .kg-tooltip")) return true;
        return false;
    }

    const escapedKeys = Object.keys(replacements)
        .sort((a, b) => b.length - a.length)
        .map((k) => k.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&"));
    const mainRegExp = new RegExp(
        `(?<=\\s|^|[0-9.?:!,;\\-«'"(])(${escapedKeys.join("|")})(?=\\s|$|[0-9.?:!,;\\-»'")])`,
        "gmu",
    );

    let tooltipContent = null;

    function getTooltip() {
        if (!tooltipContent) {
            tooltipContent = document.createElement("div");
            tooltipContent.className = "kg-tooltip-box";
            tooltipContent.style.position = "absolute";
            tooltipContent.style.zIndex = "2147483647";
            tooltipContent.style.visibility = "hidden";

            tooltipContent.innerHTML = `
                Мы за правильное написание нашей страны.<br><br>
                <span>Мы — Кыргызстан (Кыргызская Республика)</span><br>
                (Статья 1 Конституции КР)
            `;
            document.body.appendChild(tooltipContent);
        }
        return tooltipContent;
    }

    document.addEventListener("mouseover", (e) => {
        const target = e.target.closest(".kg-tooltip");
        if (target) {
            const tooltip = getTooltip();
            const rect = target.getBoundingClientRect();
            tooltip.style.top = `${rect.bottom + window.scrollY + 8}px`;
            tooltip.style.left = `${rect.left + window.scrollX}px`;
            tooltip.style.visibility = "visible";
        }
    });

    document.addEventListener("mouseout", (e) => {
        if (e.target.closest(".kg-tooltip") && tooltipContent) {
            tooltipContent.style.visibility = "hidden";
        }
    });

    function queueStorageUpdate(count) {
        pendingIncrement += count;
        if (storageTimeout) clearTimeout(storageTimeout);

        storageTimeout = setTimeout(async () => {
            const toAdd = pendingIncrement;
            pendingIncrement = 0;

            if (typeof browser.runtime?.sendMessage === "function") {
                browser.runtime.sendMessage({
                    type: "INCREMENT_GLOBAL_COUNTER",
                    count: toAdd,
                });
            } else {
                const data = await browser.storage.local.get("globalCounter");
                const currentGlobal = data.globalCounter || 0;
                await browser.storage.local.set({
                    globalCounter: currentGlobal + toAdd,
                });
            }
        }, 500);
    }

    function processTextNode(node) {
        const text = node.nodeValue;
        if (!text) return 0;

        mainRegExp.lastIndex = 0;
        if (!mainRegExp.test(text)) return 0;

        mainRegExp.lastIndex = 0;
        const fragment = document.createDocumentFragment();
        let lastIndex = 0,
            match,
            count = 0;

        while ((match = mainRegExp.exec(text)) !== null) {
            if (match.index > lastIndex) {
                fragment.appendChild(
                    document.createTextNode(
                        text.substring(lastIndex, match.index),
                    ),
                );
            }

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

        if (lastIndex < text.length) {
            fragment.appendChild(
                document.createTextNode(text.substring(lastIndex)),
            );
        }

        node.replaceWith(fragment);
        return count;
    }

    function walkAndReplace(rootNode) {
        if (rootNode.nodeType === 3) {
            if (shouldSkipNode(rootNode)) return;
            const matchCount = processTextNode(rootNode);
            if (matchCount > 0) {
                updateCounters(matchCount);
            }
            return;
        }

        const walker = document.createTreeWalker(
            rootNode,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode(node) {
                    return shouldSkipNode(node)
                        ? NodeFilter.FILTER_REJECT
                        : NodeFilter.FILTER_ACCEPT;
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
            updateCounters(localMatchCount);
        }
    }

    function updateCounters(count) {
        pageCounter += count;

        browser.runtime.sendMessage({
            type: "UPDATE_COUNTER",
            count: pageCounter,
        });
        browser.runtime.sendMessage({
            type: "UPDATE_TAB_BADGE",
            count: pageCounter,
        });

        queueStorageUpdate(count);
    }

    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === "GET_COUNT") {
            sendResponse({ count: pageCounter });
        }
    });

    const observer = new MutationObserver((mutations) => {
        observer.disconnect();

        for (let i = 0; i < mutations.length; i++) {
            const mut = mutations[i];
            if (mut.addedNodes.length > 0) {
                for (let j = 0; j < mut.addedNodes.length; j++) {
                    const node = mut.addedNodes[j];
                    if (node.nodeType === 1 || node.nodeType === 3) {
                        walkAndReplace(node);
                    }
                }
            }
        }

        observer.observe(document.body, { childList: true, subtree: true });
    });

    const run = () => {
        observer.disconnect();
        walkAndReplace(document.body);
        observer.observe(document.body, { childList: true, subtree: true });
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", run);
    } else {
        run();
    }
})();
