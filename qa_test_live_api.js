const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

(async () => {
    try {
        console.log("Requesting: https://new.bluedreamsresort.com/api/admin/ads/campaigns?platform=google&status=all");
        // We might get 401 Unauthorized if we don't have a session cookie.
        // Let's see what happens.
        const res = await fetch("https://new.bluedreamsresort.com/api/admin/ads/campaigns?platform=google&status=all", {
            headers: {
                // Let's pretend to be an admin by sending a fake session or bypassing if it's open
            }
        });

        console.log("Status:", res.status);
        const text = await res.text();
        console.log("Body length:", text.length);
        console.log("Body preview:", text.substring(0, 500));
    } catch (e) {
        console.error("Error:", e.message);
    }
})();
