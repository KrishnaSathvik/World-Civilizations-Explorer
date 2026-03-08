const WIKIDATA_SPARQL = "https://query.wikidata.org/sparql";

export interface WikidataEntity {
  id: string;
  label: string;
  description?: string;
  birthDate?: string;
  deathDate?: string;
  birthPlace?: string;
  image?: string;
  coords?: { lat: number; lng: number };
  occupation?: string;
  wikipedia?: string;
}

async function sparqlQuery<T>(query: string): Promise<T[]> {
  const url = `${WIKIDATA_SPARQL}?query=${encodeURIComponent(query)}&format=json`;
  const res = await fetch(url, {
    headers: { Accept: "application/sparql-results+json" },
  });
  if (!res.ok) throw new Error(`Wikidata SPARQL error: ${res.status}`);
  const data = await res.json();
  return data.results?.bindings || [];
}

/**
 * Fetch structured data for a historical figure by Wikipedia title.
 */
export async function fetchFigureFromWikidata(
  wikipediaTitle: string
): Promise<WikidataEntity | null> {
  const query = `
    SELECT ?item ?itemLabel ?itemDescription ?birth ?death ?birthPlaceLabel ?image ?occupationLabel WHERE {
      ?article schema:about ?item ;
               schema:isPartOf <https://en.wikipedia.org/> ;
               schema:name "${wikipediaTitle.replace(/_/g, " ")}"@en .
      OPTIONAL { ?item wdt:P569 ?birth . }
      OPTIONAL { ?item wdt:P570 ?death . }
      OPTIONAL { ?item wdt:P19 ?birthPlace . }
      OPTIONAL { ?item wdt:P18 ?image . }
      OPTIONAL { ?item wdt:P106 ?occupation . }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
    }
    LIMIT 1
  `;

  const results = await sparqlQuery<Record<string, any>>(query);
  if (results.length === 0) return null;

  const r = results[0];
  return {
    id: r.item?.value?.split("/").pop() || "",
    label: r.itemLabel?.value || wikipediaTitle.replace(/_/g, " "),
    description: r.itemDescription?.value,
    birthDate: r.birth?.value?.split("T")[0],
    deathDate: r.death?.value?.split("T")[0],
    birthPlace: r.birthPlaceLabel?.value,
    image: r.image?.value,
    occupation: r.occupationLabel?.value,
  };
}

/**
 * Fetch structured data for a topic/concept by Wikipedia title.
 */
export async function fetchTopicFromWikidata(
  wikipediaTitle: string
): Promise<WikidataEntity | null> {
  const query = `
    SELECT ?item ?itemLabel ?itemDescription ?image ?coords WHERE {
      ?article schema:about ?item ;
               schema:isPartOf <https://en.wikipedia.org/> ;
               schema:name "${wikipediaTitle.replace(/_/g, " ")}"@en .
      OPTIONAL { ?item wdt:P18 ?image . }
      OPTIONAL { ?item wdt:P625 ?coords . }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
    }
    LIMIT 1
  `;

  const results = await sparqlQuery<Record<string, any>>(query);
  if (results.length === 0) return null;

  const r = results[0];
  let coords: { lat: number; lng: number } | undefined;
  if (r.coords?.value) {
    const match = r.coords.value.match(/Point\(([^ ]+) ([^ ]+)\)/);
    if (match) coords = { lat: parseFloat(match[2]), lng: parseFloat(match[1]) };
  }

  return {
    id: r.item?.value?.split("/").pop() || "",
    label: r.itemLabel?.value || wikipediaTitle.replace(/_/g, " "),
    description: r.itemDescription?.value,
    image: r.image?.value,
    coords,
  };
}

/**
 * Fetch key figures for a civilization from Wikidata by civilization entity name.
 */
export async function fetchCivFigures(
  civilizationName: string
): Promise<WikidataEntity[]> {
  const query = `
    SELECT DISTINCT ?person ?personLabel ?personDescription ?birth ?death ?image WHERE {
      ?person wdt:P31 wd:Q5 .
      ?person ?relation ?civ .
      ?civ rdfs:label "${civilizationName}"@en .
      OPTIONAL { ?person wdt:P569 ?birth . }
      OPTIONAL { ?person wdt:P570 ?death . }
      OPTIONAL { ?person wdt:P18 ?image . }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
    }
    ORDER BY ?birth
    LIMIT 20
  `;

  try {
    const results = await sparqlQuery<Record<string, any>>(query);
    return results.map((r) => ({
      id: r.person?.value?.split("/").pop() || "",
      label: r.personLabel?.value || "",
      description: r.personDescription?.value,
      birthDate: r.birth?.value?.split("T")[0],
      deathDate: r.death?.value?.split("T")[0],
      image: r.image?.value,
    }));
  } catch {
    return [];
  }
}
