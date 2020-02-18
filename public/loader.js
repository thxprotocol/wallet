window.THX = {
    claim: function() {
        const pool = '0xE7FA4ca3257F852a96de1543fb8B9f802C7be933';
        const rule = '0';
        const src = 'https://localhost:8080/claim/' + pool + '/' + rule;

        if (src) {
            const iframe = document.createElement('iframe');
            iframe.frameBorder = 0;
            iframe.src = src;
            iframe.style.cssText = 'display: block; position: fixed; width: 100%; height: 100%; top: 0; left: 0;';

            document.body.appendChild(iframe);
        } else {
            console.error(`No element with id 'thx-claim-container' found`);
        }
    }
}
