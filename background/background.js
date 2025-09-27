// Background service worker for GEDCOM Family Tree Viewer Chrome Extension

chrome.runtime.onInstalled.addListener((details) => {
    console.log('GEDCOM Family Tree Viewer extension installed');

    if (details.reason === 'install') {
        console.log('Extension installed for the first time');

        chrome.storage.local.set({
            settings: {
                defaultGenerations: 3,
                defaultOrientation: 'vertical',
                theme: 'default'
            }
        });
    } else if (details.reason === 'update') {
        console.log('Extension updated');
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Background received message:', message);

    switch (message.type) {
        case 'PROCESS_GEDCOM':
            handleGedcomProcessing(message.data, sendResponse);
            return true; // Keep message channel open for async response

        case 'GET_SETTINGS':
            chrome.storage.local.get('settings', (result) => {
                sendResponse(result.settings || {});
            });
            return true;

        case 'SET_SETTINGS':
            chrome.storage.local.set({ settings: message.settings }, () => {
                sendResponse({ success: true });
            });
            return true;

        case 'CLEAR_DATA':
            chrome.storage.local.clear(() => {
                sendResponse({ success: true });
            });
            return true;

        default:
            console.warn('Unknown message type:', message.type);
            sendResponse({ error: 'Unknown message type' });
    }
});

function handleGedcomProcessing(data, sendResponse) {
    try {
        console.log('Processing GEDCOM data...');

        // Store the GEDCOM data for the viewer
        chrome.storage.local.set({
            gedcomData: {
                content: data.gedcomContent,
                generations: data.generations,
                orientation: data.orientation,
                processed: false,
                timestamp: Date.now()
            }
        }, () => {
            if (chrome.runtime.lastError) {
                console.error('Storage error:', chrome.runtime.lastError);
                sendResponse({ error: 'Failed to store GEDCOM data' });
                return;
            }

            console.log('GEDCOM data stored successfully');
            sendResponse({ success: true, message: 'GEDCOM data processed and stored' });
        });

    } catch (error) {
        console.error('Error processing GEDCOM:', error);
        sendResponse({ error: 'Failed to process GEDCOM data' });
    }
}

// Listen for tab updates to inject content scripts if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        // Only inject into our viewer pages
        if (tab.url.includes(chrome.runtime.getURL('viewer/'))) {
            console.log('Viewer tab loaded:', tab.url);
        }
    }
});

// Handle extension errors
chrome.runtime.onSuspend.addListener(() => {
    console.log('Extension suspending...');
});

// Cleanup old data periodically (keep data for 24 hours)
chrome.alarms.create('cleanup', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'cleanup') {
        chrome.storage.local.get(['gedcomData'], (result) => {
            if (result.gedcomData && result.gedcomData.timestamp) {
                const dayInMs = 24 * 60 * 60 * 1000;
                if (Date.now() - result.gedcomData.timestamp > dayInMs) {
                    chrome.storage.local.remove('gedcomData');
                    console.log('Cleaned up old GEDCOM data');
                }
            }
        });
    }
});

console.log('GEDCOM Family Tree Viewer background service worker loaded');