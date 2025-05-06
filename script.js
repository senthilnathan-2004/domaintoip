const websiteInfoForm = document.getElementById('websiteInfoForm');
const urlInput = document.getElementById('urlInput');
const resultsContainer = document.getElementById('resultsContainer');
const ipAddressDiv = document.getElementById('ipAddress');
const reachabilityDiv = document.getElementById('reachability');
const httpStatusDiv = document.getElementById('httpStatus');
const headersListDiv = document.getElementById('headersList');
const clearButton = document.getElementById('clearButton');
const generalErrorDiv = document.getElementById('generalError');

// Make Results section visible on initial load.
resultsContainer.style.display = 'block';

websiteInfoForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const inputUrl = urlInput.value.trim();

    if (inputUrl === '') {
        generalErrorDiv.textContent = "Please enter a valid URL.";
        generalErrorDiv.style.display = "block";
        return;
    } else {
        generalErrorDiv.textContent = "";
        generalErrorDiv.style.display = "none";
    }

    // Reset previous results
    ipAddressDiv.textContent = 'Fetching IP address...';
    reachabilityDiv.textContent = 'Checking reachability...';
    httpStatusDiv.textContent = '';
    headersListDiv.innerHTML = '';

    try {
        const urlObject = new URL(inputUrl);
        const domain = urlObject.hostname;

        // Fetch IP Address
        const dnsResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
        const dnsData = await dnsResponse.json();

        if (dnsData.Answer && dnsData.Answer.length > 0) {
            const ip = dnsData.Answer.find(a => a.type === 1)?.data;
            ipAddressDiv.textContent = `IP Address: ${ip || 'Not found'}`;
        } else {
            ipAddressDiv.textContent = 'IP Address: Not found';
        }

        // Check Website Status and Headers
        try {
            const websiteResponse = await fetch(inputUrl, {
                method: 'HEAD',
                mode: 'cors',
                redirect: 'follow'
            });

            const status = websiteResponse.status;
            httpStatusDiv.textContent = `HTTP Status Code: ${status}`;

            if (status >= 200 && status < 300) {
                reachabilityDiv.innerHTML = `<span class="status-indicator status-success">Online</span>`;
            } else if (status >= 400 && status < 500) {
                reachabilityDiv.innerHTML = `<span class="status-indicator status-warning">Client Error</span>`;
            } else if (status >= 500) {
                reachabilityDiv.innerHTML = `<span class="status-indicator status-error">Server Error</span>`;
            } else {
                reachabilityDiv.innerHTML = `<span class="status-indicator status-warning">Unknown</span>`;
            }

            const headersToShow = ['Content-Type', 'Server', 'Content-Length', 'Date', 'Connection'];
            headersToShow.forEach(headerName => {
                const headerValue = websiteResponse.headers.get(headerName);
                if (headerValue) {
                    const headerItem = document.createElement('p');
                    headerItem.classList.add('result-item');
                    headerItem.innerHTML = `<strong>${headerName}:</strong> ${headerValue}`;
                    headersListDiv.appendChild(headerItem);
                }
            });

            if (headersListDiv.children.length === 0) {
                const noHeaders = document.createElement('p');
                noHeaders.classList.add('result-item');
                noHeaders.textContent = 'No specific headers found.';
                headersListDiv.appendChild(noHeaders);
            }

        } catch (error) {
            console.error("Error fetching website status:", error);
            reachabilityDiv.innerHTML = `<span class="status-indicator status-error">Error</span>`;
            httpStatusDiv.textContent = `Error fetching status.`;
            const errorItem = document.createElement('p');
            errorItem.classList.add('result-item');
            errorItem.textContent = `Error details: ${error.message}`;
            headersListDiv.appendChild(errorItem);
        }

    } catch (error) {
        console.error("Invalid URL:", error);
        ipAddressDiv.textContent = 'Invalid URL.';
        reachabilityDiv.textContent = '';
        httpStatusDiv.textContent = '';
        headersListDiv.innerHTML = `<p class="result-item error">Error: ${error.message}</p>`;
    }
});

clearButton.addEventListener('click', function () {
    urlInput.value = '';
    ipAddressDiv.textContent = '';
    reachabilityDiv.textContent = '';
    httpStatusDiv.textContent = '';
    headersListDiv.innerHTML = '';
    generalErrorDiv.textContent = '';
    generalErrorDiv.style.display = "none";
});