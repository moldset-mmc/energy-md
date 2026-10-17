# Daytime electricity prospect registry — 17 October 2026

The task is to prospect legal entities and organisations in Moldova with electricity purchases from 30,000 MDL/month, primarily during daytime. This is a soft priority, not a claim that the threshold has already been established.

The original 80 profiles and 2 downloads are retained. 38 profiles were added: 24 with a reviewed producer site or employer vacancy, 14 identified only in the UPM membership list. The latter are explicitly marked as discovery records. 118 total profiles, 27 sectors, 25 original financial records. Six factory/production-vacancy schedules and ten general company schedules are recorded separately. No metered daytime percentage or verified qualifying monthly bill is asserted.

## ASP extraction

Official company_2026.10.12.xlsx, retrieved 17 October 2026. Sheet Company contains 303,482 data rows. Exclude rows with a liquidation date; select 13-digit IDNO and company/state/municipal/production-cooperative forms. Map activity identifiers through the workbook's unlicensed activity classification table. Select CAEM revision 2 divisions 10–33 or revision 1 divisions 15–37. Revision 1 includes publishing, so these are broad declarations rather than certified factories. Retain only necessary business fields, not managers or founders. Deduplicate on IDNO: 42,531 unique records, zero duplicates. Missing liquidation date does not prove ongoing activity. Registered address is not necessarily a factory address.

`dist/registry.json` uses compact positional rows with an explicit columns list and shared classification dictionary. Its data is loaded only on the directory page. Table pagination displays 30 rows. CSV exports only the filtered set. Source URL and snapshot are retained in the dataset and workbook.

## CNED extraction

Official energie_electrica_sectorul_public_17.06.2026.xlsx. Use sheet 2026, original row numbers, district, locality, organisation name and January–April kWh. Other months are blank. Do not turn missing values into zero, and include published zeros in averages. Average is the arithmetic mean of populated months. No account number or IDNO is present; repeated names remain separate, not aggregated or joined across years. The 2024 sheet has a contradictory thermal-energy title and was not used. Military/security/prison records were omitted from commercial prospect selection. Remaining 12,913 rows; 428 average at least 10,000 kWh/month. This is a volume filter, not a statement that 428 distinct organisations exceed the spending threshold. Name-based sector classification is approximate; municipal accounts may represent street lighting, and colleges may include dormitories.

## Evidence and user experience

Main catalogue and new directory are separate. Default catalogue sorting prioritises factory and production-vacancy schedules, then general schedules. Original 20-profile wave remains available as historical, not as the day-priority recommendation. The new wave displays 16 schedule signals, with six stronger signals first. No showroom hours are represented as production hours. Specific source conflicts (Grafitex Saturday; Garduri hours) are retained in the profile. Own generation is material to daytime grid purchases.

Public bank transactions for private companies are not assumed accessible. Bank secrecy source: BNM banking law, Articles 96–97, https://www.bnm.md/files/LAB.pdf. Public procurement documents, public consumption and company reports are valid research routes; planned contracts are not payments and payments do not establish hourly load.

## Verification

`node verify.cjs` checks rendering, internal links, all company/task prompt combinations, catalogue and directory filters, unique ASP IDs, and every CNED average. `make-workbook.py` produces the extended workbook from the three JSON datasets. Original XLSX/PDF hashes are preserved. Browser QA remains unavailable because the managed preview environment failed with a bwrap proc-mount permission error; no alternate preview infrastructure was used.
