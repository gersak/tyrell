/**
 * Shared behavior for the Flask + HTMX + Tyrell demo.
 *
 * Validation needs no code here: the browser checks every Tyrell field before
 * `submit` fires, so `hx-post` on a <form> only sends once all of them pass.
 */

// Submit buttons spin while their form's request is in flight.
function setSubmitLoading(event, loading) {
    const form = event.detail.elt.closest?.('form');
    if (!form) return;
    form.querySelectorAll('ty-button[type="submit"]').forEach((button) => {
        button.loading = loading;
    });
}
document.body.addEventListener('htmx:beforeRequest', (e) => setSubmitLoading(e, true));
document.body.addEventListener('htmx:afterRequest', (e) => setSubmitLoading(e, false));

// 4xx/5xx and network failures: one toast instead of a silent no-op.
document.body.addEventListener('htmx:responseError', (event) => {
    console.error('HTMX response error', event.detail.xhr.status, event.detail.xhr.responseURL);
    showToast('Request failed. Please try again.', 'danger');
});
document.body.addEventListener('htmx:sendError', () => {
    showToast('Network error. Is the server running?', 'danger');
});

// Server-rendered notifications (partials/notification.html) hide themselves
document.body.addEventListener('htmx:afterSwap', (event) => {
    event.detail.target.querySelectorAll?.('.notification-toast').forEach((toast) => {
        setTimeout(() => toast.remove(), 5000);
    });
});

function showToast(message, flavor = 'success', duration = 4000) {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 ty-bg-${flavor}- ty-text-${flavor}++ px-5 py-3 rounded-lg shadow-lg animate-slide-up flex items-center gap-3`;
    toast.innerHTML = `
        <ty-icon name="${flavor === 'danger' ? 'alert-circle' : 'check-circle'}"></ty-icon>
        <span></span>
        <ty-button type="button" size="sm" appearance="ghost" action aria-label="Dismiss">
            <ty-icon name="x"></ty-icon>
        </ty-button>`;
    toast.querySelector('span').textContent = message;
    toast.querySelector('ty-button').addEventListener('click', () => toast.remove());
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
}

window.tyApp = { showToast };
