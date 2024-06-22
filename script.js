const BASE_URL = 'https://188.166.221.172/';
const SUB_REF_URL = `${BASE_URL}soi-keo-dortmund-vs-real-madrid-02-06-2024/`;
const GOOGLE_URL = 'https://www.google.com/';
const TRAFFIC_URL = 'https://traffic-user.net/GET_VUATRAFFIC.php';
const MA_URL = 'https://traffic-user.net/GET_MA.php';

const fetchWithRefererAndOrigin = async (url, options) => {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            Referer: REF_URL,
            Origin: REF_URL,
        },
    });
    return response.text();
};

const extractLocalStorageCode = (html) => {
    const match = html.match(/localStorage\.codexn\s*=\s*'([^']+)'/);
    return match ? match[1] : null;
};

const extractSessionStorageCdkCode = (htmlString) => {
    const match = htmlString.match(
        /sessionStorage\.setItem\("ymnclk", (\d+)\)/
    );
    return match ? match[1] : null;
};

const extractCodeFromHtml = (htmlString) => {
    const matchResults = htmlString.match(/\b\d{6}\b/g);
    return matchResults ? matchResults[0] : null;
};

const generateTimestampData = () => {
    const timestamp = Date.now();
    return `${timestamp},${GOOGLE_URL},${REF_URL},IOS900,hidden,null`;
};

const createFormData = (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => formData.append(key, value));
    return formData;
};

const fetchInitialCodeXn = async () => {
    const timestampData = generateTimestampData();
    const response = await fetch(`${TRAFFIC_URL}?data=${timestampData}&clk=`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'NO',
    });
    return extractLocalStorageCode(await response.text());
};

const fetchTimerAndTraffic = async () => {
    const codeXn = await fetchInitialCodeXn();
    const timestampData = generateTimestampData();
    const formData = createFormData({
        url_order: REF_URL,
        ref: GOOGLE_URL,
        TOP_NUT: 100,
        LEFT_NUT: 56,
        NO_NUT: 'NO',
    });
    const response = await fetch(`${TRAFFIC_URL}?token=${timestampData}&clk=`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
    });
    return extractLocalStorageCode(await response.text());
};

const fetchInitialMaCode = async () => {
    const codeXn = await fetchTimerAndTraffic();
    const response = await fetch(
        `${MA_URL}?codexn=${codeXn}&url=${SUB_REF_URL}&loai_traffic=${GOOGLE_URL}&clk=`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }
    );
    return extractSessionStorageCdkCode(await response.text());
};

const fetchSecondCodeXn = async () => {
    const CdkCode = await fetchInitialMaCode();
    const timestampData = generateTimestampData();
    const response = await fetch(
        `${TRAFFIC_URL}?data=${timestampData}&clk=${CdkCode}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'NO',
        }
    );
    return {
        codeXn: extractLocalStorageCode(await response.text()),
        CdkCode,
    };
};

const fetchFinalTrafficData = async () => {
    const { CdkCode } = await fetchSecondCodeXn();
    const timestampData = generateTimestampData();
    const response = await fetch(
        `${TRAFFIC_URL}?token=${timestampData}&clk=${CdkCode}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }
    );
    return {
        codeXn: extractLocalStorageCode(await response.text()),
        CdkCode,
    };
};

const fetchFinalMaCode = async () => {
    const { codeXn, CdkCode } = await fetchFinalTrafficData();
    const response = await fetch(
        `${MA_URL}?codexn=${codeXn}&url=${SUB_REF_URL}&loai_traffic=${REF_URL}&clk=${CdkCode}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }
    );
    return extractCodeFromHtml(await response.text());
};

const handleSubmit = async () => {
    const refUrlInput = document.getElementById('ref-url').value;
    const subRefUrlInput = document.getElementById('sub-ref-url').value;

    if (!refUrlInput) {
        alert('REF_URL is required!');
        return;
    }

    window.REF_URL = refUrlInput;
    window.SUB_REF_URL =
        subRefUrlInput ||
        `${REF_URL}soi-keo-dortmund-vs-real-madrid-02-06-2024/`;

    const code = await fetchFinalMaCode();
    document.getElementById('code-result').innerText = code;
};
