document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggleBtn');
    const statusIcon = document.getElementById('statusIcon');
  
    function updateUI(isCleaning) {
      toggleBtn.textContent = isCleaning ? 'Stop Cleaning' : 'Start Cleaning';
      statusIcon.textContent = isCleaning ? '🛑' : '🧽';
    }
  
    chrome.storage.local.get(['isCleaning'], function(result) {
      const currentState = !!result.isCleaning;
      updateUI(currentState);
    });
  
    toggleBtn.addEventListener('click', async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
      chrome.storage.local.get(['isCleaning'], function(result) {
        const newState = !result.isCleaning;
        chrome.storage.local.set({ isCleaning: newState });
        updateUI(newState);
  
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (mode) => {
            if (mode) {
              if (!window._cleanBoardHandler) {
                window._cleanBoardHandler = (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                };
                window.addEventListener('keydown', window._cleanBoardHandler, true);
              }
            } else {
              if (window._cleanBoardHandler) {
                window.removeEventListener('keydown', window._cleanBoardHandler, true);
                window._cleanBoardHandler = null;
              }
            }
          },
          args: [newState]
        });
      });
    });
  });