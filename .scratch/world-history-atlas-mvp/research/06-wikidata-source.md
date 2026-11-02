# 06 — Wikidata as the fact source (France pilot)

Researched 2026-11-02. Primary sources: Wikibase DataModel, RDF Dump Format, WDQS User Manual, Wikidata:Data access, live queries against `query.wikidata.org` and `wbgetclaims` (results below are a snapshot; Wikidata changes daily).

## Verdict

Yes, as the **base source for ids, labels, Wikipedia links and dates** of rulers, cities, events and *some* polities. **No, not as the sole source**: polity coverage is patchy (esp. pre-Roman Gaul), there is no polity geometry, and ruler succession is incomplete. Plan for a curated layer (a seed list of QIDs plus local overrides) on top of extracted Wikidata.

## 1. Coverage and quality (sampled)

| Probe | Result |
|---|---|
| `P39 = King of France (Q18384454)` | 24 holders, all with `P580` start + `P1365` predecessor qualifiers. Plus 6 under "King of France and Navarre" (Q3439798). The office is split, so the list needs a union of several QIDs. |
| `P39 = king of Franks (Q22923081)` | 78 holders, only **30** with a `P580` start date. Merovingian/Carolingian reigns are thin. |
| Kingdom of France (Q70972) | `P571` 987, `P576` 1791-09-04, `P36` Paris + Versailles (no time qualifiers), `P1365`/`P1366` predecessors/successors, `P1906` head-of-state office. **No `P35`/`P6`.** Rulers come from `P39` on people, not from the polity. |
| Historical countries (`P31/P279* Q3024240`) with `P625` inside the France bbox | 158 items. 141 have both `P571` and `P576`. fr label 155, en label 157, frwiki 147, enwiki 127, `P36` 111, `P1448` official name **14**, `P35`/`P6` **13**. |
| Gallic peoples (`P279 Gauls Q273854`) | 124 items, frwiki 120, but `P625` only 17, dated **1**, `P36` 3. Typed as "historical ethnic group" (e.g. Aedui Q677863: capital Bibracte, no dates, no coordinates). They are **not modelled as polities**. |
| Gaul (Q38060) | historical region / ancient civilization, one point coordinate, no dates. |
| Communes of France (`P31 Q484170`) | 46,187 items. Only 2,010 have `P571`. Founding dates for cities are mostly missing. |
| Battles (`P31/P279* Q178561`) with `P625` + `P585`/`P580` in the bbox | 1,469 items. |

Quality notes:
- The `wdt:` truthy triples return only best-rank statements. Use `p:/ps:/pq:` to get qualifiers (`P580`/`P582` on `P36` and `P39`) and deprecated/alternative values.
- Class modelling is inconsistent (country vs. historical country vs. ethnic group vs. region). Select items by an explicit **seed list of QIDs**, not by class traversal alone.
- **No boundaries.** `P625` is a point. `P3896` geoshape exists only for a few modern entities. Territories have to come from another source (ticket on geometry).

## 2. Date model vs our day/month/year/century

From [Wikibase/DataModel § Time](https://www.mediawiki.org/wiki/Wikibase/DataModel#Dates_and_times):
- `precision`: 6 = millennium, **7 = century**, 8 = decade, **9 = year**, **10 = month**, **11 = day**. Wikidata accepts nothing finer than 11.
- Map: 11→day, 10→month, 9→year, 7→century. **8 (decade) and 6 (millennium) also occur** (2 Frankish reign starts at precision 8). They need a mapping: widen to century, or add a `decade` precision.
- `calendarmodel`: Q1985727 = proleptic Gregorian, Q1985786 = proleptic Julian. "Gregorian dates earlier than 15 October 1582 and Julian dates earlier than 1 March 4 CE are proleptic."
- `before`/`after` uncertainty fields exist, but in practice they are 0. Uncertainty is carried by `P1480` (sourcing circumstances, e.g. "circa"), `P1319`/`P1326` (earliest/latest date) qualifiers.
- Century boundaries: "the 18th century begins in the year 1701 and ends in the year 1800". Timestamps at precision 7 do not align with digits.

**Serialization trap (verified):**

| | JSON (API / JSON dump) | RDF (WDQS / RDF dump) |
|---|---|---|
| Clovis † (Q82339) | `+0511-11-27`, Julian | `0511-11-29`, calendar still Julian |
| Caesar † (Q1048) | `-0044-03-15`, Julian | `-0043-03-13` |

- **JSON** stores the date *as entered in its calendar* with historical year numbering (1 BCE = -0001). Unknown month/day = `00`.
- **RDF/WDQS** converts `timeValue` to **proleptic Gregorian XSD 1.1** (1 BCE = +0000, so all BCE years are shifted by 1). `wikibase:timeCalendarModel` keeps the original calendar ([RDF Dump Format § Time](https://www.mediawiki.org/wiki/Wikibase/Indexing/RDF_Dump_Format#Time)).
- This fits our model directly: keep the **source calendar + original value** (from JSON) and display Gregorian (WDQS already gives it, or convert ourselves). Pick one pipeline and normalise BCE year numbering explicitly. Mixing JSON and SPARQL values will cause off-by-one-year bugs for BCE dates.
- Calendar tagging is unreliable. Caesar has a Julian day-precision death date and a *Gregorian* year-precision one. 1 pre-1582 King of France start date is tagged Gregorian.

## 3. Build-time extraction

- WDQS limits ([User Manual § Query limits](https://www.mediawiki.org/wiki/Wikidata_Query_Service/User_Manual#Query_limits)): hard 60 s deadline per query; 60 s of processing per 60 s per client (UA+IP); 30 error queries/min; HTTP 429 + `Retry-After` when throttled, temporary ban if ignored. A descriptive **User-Agent is required** ([Data access](https://www.wikidata.org/wiki/Wikidata:Data_access)). In testing, a broad label query hit "upstream request timeout".
- For our scale (a few thousand items), the right approach is: SPARQL to collect QIDs (narrow, paginated queries) → `wbgetentities` (≤50 ids/request) or `Special:EntityData/Qxx.json` for full JSON (original calendar, ranks, qualifiers, sitelinks) → **commit a snapshot** to the repo so builds are reproducible and offline.
- Dumps: `latest-all.json.gz` = **157 GB**, `latest-truthy.nt.gz` = 72 GB (2026-10-27). That is overkill for the MVP. Data access docs recommend dumps only for very large result sets.

## 4. Licence

All structured data is **CC0** ([Data access](https://www.wikidata.org/wiki/Wikidata:Data_access)), so no attribution is required (being courteous, still credit it). Caveat: Wikipedia article text/extracts are CC BY-SA, and Commons images (`P18`, `P242`) have per-file licences. Link to them, don't copy them, unless attribution is handled.

## 5. Labels fr/en and Wikipedia links

- Labels/descriptions/aliases per language (`rdfs:label`, `schema:description`, `skos:altLabel`). The France-bbox polities have fr labels on 155/158 and en on 157/158. Fallback chain: fr→en→mul→QID (`SERVICE wikibase:label` supports `"fr,en,mul"`).
- `P1448` (official name, monolingual + time qualifiers) is rare (14/158). Do not rely on it for period names.
- Sitelinks: `schema:about` + `schema:isPartOf <https://fr.wikipedia.org/>` in SPARQL, or `sitelinks.frwiki/enwiki` in JSON. frwiki is better covered than enwiki for this pilot (147 vs 127).

## Sample queries used

```sparql
# Kings of France with start/predecessor
SELECT ?p ?start ?prev WHERE { ?p p:P39 ?s. ?s ps:P39 wd:Q18384454. OPTIONAL{?s pq:P580 ?start} OPTIONAL{?s pq:P1365 ?prev} }
# Precision/calendar distribution
SELECT ?prec ?cal (COUNT(*) AS ?n) WHERE { ?p p:P39 ?s. ?s ps:P39 wd:Q22923081; pqv:P580 ?v. ?v wikibase:timePrecision ?prec; wikibase:timeCalendarModel ?cal } GROUP BY ?prec ?cal
# Historical countries inside France bbox
SELECT ?i WHERE { ?i wdt:P31/wdt:P279* wd:Q3024240; wdt:P625 ?c. BIND(geof:longitude(?c) AS ?lon) BIND(geof:latitude(?c) AS ?lat) FILTER(?lon>-5.2 && ?lon<9.6 && ?lat>41.3 && ?lat<51.2) }
```
