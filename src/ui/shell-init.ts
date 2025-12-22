import { initShell } from './shell';

const isAppPage = window.location.pathname.includes('/apps/');

initShell({ pageType: isAppPage ? 'app' : 'home' });
