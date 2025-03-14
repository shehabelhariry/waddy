let viewedCompanies = {};

const parentSelector = ".jobs-search__job-details--container";

const selectors = {
  companyName: ".job-details-jobs-unified-top-card__company-name > a",
  jobTitle: ".job-details-jobs-unified-top-card__job-title",
  mainJobInfo:
    ".job-details-jobs-unified-top-card__primary-description-container",
  jobDescription: ".jobs-description-content__text--stretch",
  image: ".ivm-view-attr__img--centered",
  location: ".t-black--light .tvm__text:nth-of-type(1)",
};

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "EXTRACT_DATA") {
    console.log("Received EXTRACT_DATA message, extracting job details...");
    waitForElementToAppear(parentSelector, extractJobDetails);
  }
});

function waitForElementToAppear(selector, callback) {
  const element = document.querySelector(selector);
  if (element) {
    callback(element);
  } else {
    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        callback(element);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
}

function extractJobDetails(parentElem) {
  const jobTitleElem = parentElem.querySelector(selectors.jobTitle);
  const companyElem = parentElem.querySelector(selectors.companyName);
  const mainJobInfoElem = parentElem.querySelector(selectors.mainJobInfo);
  const jobDescriptionElem = parentElem.querySelector(selectors.jobDescription);
  const companyImageElem = parentElem.querySelector(selectors.image);
  const locationElem = mainJobInfoElem.querySelector(selectors.location);
  const jobURLElem = jobTitleElem.querySelector("a");
  const company = companyElem.innerText.trim();

  if (jobTitleElem && companyElem && mainJobInfoElem && jobDescriptionElem) {
    const jobData = {
      company,
      title: jobTitleElem.innerText.trim(),
      mainInfo: mainJobInfoElem.innerText.trim(),
      description: jobDescriptionElem.innerText.trim(),
      url: window.location.href,
      imageUrl: companyImageElem.getAttribute("src"),
      location: locationElem.innerText.trim(),
      jobUrl: "https://www.linkedin.com" + jobURLElem.getAttribute("href"),
    };

    console.log("Extracted job data:", jobData);
    viewedCompanies = {
      ...viewedCompanies,
      [company]: jobData,
    };

    // Send extracted data back to the popup
    chrome.runtime.sendMessage({
      action: "DATA_EXTRACTED",
      data: { current: jobData, viewedCompanies },
    });
  } else {
    console.log("Some job elements are missing, skipping extraction.");
  }
}
