export const scanResults = [
  {
    site: 'Hacker News',
    findings: [
      { text: '275 violations', highlight: true },
      { text: '268 color-contrast issues (3.54:1 vs required 4.5:1)', highlight: true },
      { text: 'Only 3 of 227 interactive elements reachable via keyboard', keyboard: true },
    ],
  },
  {
    site: 'Reddit',
    findings: [
      { text: 'Missing <title> and lang attribute', highlight: true },
      { text: 'Images without alt text', highlight: true },
      { text: 'No skip link, no main landmark', keyboard: true },
    ],
  },
  {
    site: 'GitHub',
    findings: [
      { text: '72 tab-order issues', keyboard: true },
      { text: '104 focus-indicator issues', keyboard: true },
      { text: '15 widget keyboard interaction failures', keyboard: true },
    ],
  },
] as const;
