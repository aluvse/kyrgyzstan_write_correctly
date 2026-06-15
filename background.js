browser.runtime.onMessage.addListener((message, sender) => {
    if (message.type === "UPDATE_TAB_BADGE") {
        browser.action.setBadgeText({
            text: message.count.toString(),
            tabId: sender.tab.id,
        });
        browser.action.setBadgeBackgroundColor({ color: "#00c853" });
    }
});
