export function buildQuery(
  params: Record<string, string | number | (string | number)[] | undefined>
) {
  const sp = new URLSearchParams();

  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;

    if (Array.isArray(v)) {
      v.forEach((item) => sp.append(k, String(item)));
    } else {
      sp.append(k, String(v));
    }
  });

  return sp.toString();
}
