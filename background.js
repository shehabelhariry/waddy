chrome.runtime.onInstalled.addListener(() => {
  console.log("LinkedIn Job Tracker Extension Installed");
});

chrome.runtime.onStartup.addListener(() => {
  console.log("LinkedIn Job Tracker Extension Started");
});
