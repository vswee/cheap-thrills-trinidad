# Trinidad and Tobago holiday banner

The shared holiday banner reads the date in `America/Port_of_Spain` in the browser, so it stays correct between static site builds and across visitors' device time zones. The `src/lib/trinidad-holidays.ts` calendar holds annual fixed dates and calculates Easter-relative observances and Carnival dates. The banner checks again once a minute so a page left open over Trinidad midnight updates without a rebuild.

Fixed-date entries include New Year's Day, Spiritual Baptist Liberation Day, Indian Arrival Day, Labour Day, Emancipation Day, Independence Day, Republic Day, Christmas Day, and Boxing Day. Easter-relative entries include Good Friday, Easter Monday, Corpus Christi, and Carnival Monday and Tuesday.

Add dates that require an annual government announcement (for example Eid-ul-Fitr and Divali) in the holiday rule's `dates` map, keyed by year, after checking the official date. Use this same map for official observed-date substitutions; for example Boxing Day is observed on 28 December in Trinidad and Tobago in 2026. Do not infer lunar dates or substitute dates from another country's calendar.

Reference sources:

- [National Archives of Trinidad and Tobago: public-holiday dates and annual announcements](https://www.natt.gov.tt/node/155)
- [Government of Trinidad and Tobago: 2026 interim holiday calendar](https://foreign.gov.tt/documents/1696/HC_Lon_2026_Holidays_INTERIM_Rev1.pdf)
- [Government Printer: 2026 Eid-ul-Fitr legal notice](https://www.printery.gov.tt/e-gazette/2026/Legal%20Notices/Legal_Notice_No._25_of_2026.pdf)
- [National Library and Information System Authority: Carnival dates](https://www.nalis.gov.tt/resources/tt-content-guide/carnival/)
