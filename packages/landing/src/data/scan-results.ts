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
    site: 'Craigslist',
    findings: [
      { text: 'No lang attribute on <html>', highlight: true },
      { text: 'Unlabeled form inputs', highlight: true },
      { text: 'No landmark regions', highlight: true },
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
