// Shared Appwrite REST helpers for all api/ endpoints. Raw fetch keeps cold
// starts small and matches the TablesDB routes this Cloud version serves.
export function awEnv() {
  const E = process.env.VITE_APPWRITE_ENDPOINT;
  const P = process.env.VITE_APPWRITE_PROJECT_ID;
  const D = process.env.VITE_APPWRITE_DATABASE_ID;
  const B = process.env.VITE_APPWRITE_BUCKET_ID;
  const K = process.env.APPWRITE_API_KEY;
  if (!E || !P || !D || !K) throw httpError(500, 'Server is not configured (missing Appwrite env)');
  return { E, P, D, B, K };
}

export function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

export async function aw(method, path, body) {
  const { E, P, K } = awEnv();
  const headers = { 'X-Appwrite-Project': P, 'X-Appwrite-Key': K, 'Content-Type': 'application/json' };
  const payload = body === undefined ? undefined : JSON.stringify(body);

  // Appwrite Cloud's edge occasionally drops connections at connect time. One
  // retry on GETs keeps public reads from failing; connect failures never
  // reached Appwrite, so the retry cannot double-apply anything.
  for (let attempt = 0; ; attempt++) {
    let r;
    try {
      r = await fetch(E + path, {
        method,
        headers,
        body: payload,
        // Never let a stalled upstream hang the request indefinitely.
        signal: AbortSignal.timeout(20000),
      });
    } catch (err) {
      if (method === 'GET' && attempt === 0) continue;
      throw httpError(504, err && err.name === 'TimeoutError' ? 'Upstream request timed out' : 'fetch failed');
    }
    const text = await r.text();
    if (!text) return {}; // deletes answer 204 with an empty body
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      throw httpError(502, 'Appwrite returned a non-JSON response');
    }
    if (!r.ok) throw httpError(r.status === 401 || r.status === 403 ? 500 : r.status, json.message || 'Appwrite error');
    return json;
  }
}

export function rowsPath(table) {
  const { D } = awEnv();
  return `/tablesdb/${D}/tables/${table}/rows`;
}

export function rowQuery(queries, limit) {
  const params = new URLSearchParams();
  queries.forEach((q, i) => params.set(`queries[${i}]`, JSON.stringify(q)));
  if (limit) params.set(`queries[${queries.length}]`, JSON.stringify({ method: 'limit', values: [limit] }));
  const s = params.toString();
  return s ? `?${s}` : '';
}

export function listRows(table, queries = [], limit = 100) {
  return aw('GET', rowsPath(table) + rowQuery(queries, limit));
}

export function getRow(table, rowId) {
  return aw('GET', `${rowsPath(table)}/${encodeURIComponent(rowId)}`);
}

export function createRow(table, data, rowId) {
  return aw('POST', rowsPath(table), { rowId: rowId || 'unique()', data });
}

export function updateRow(table, rowId, data) {
  return aw('PATCH', `${rowsPath(table)}/${encodeURIComponent(rowId)}`, { data });
}

export function deleteRow(table, rowId) {
  return aw('DELETE', `${rowsPath(table)}/${encodeURIComponent(rowId)}`);
}

export async function userFromJWT(jwt) {
  const { E, P } = awEnv();
  try {
    const r = await fetch(`${E}/account`, {
      headers: { 'X-Appwrite-Project': P, 'X-Appwrite-JWT': jwt },
    });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}
