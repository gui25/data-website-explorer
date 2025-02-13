export function formatJSON(json: string): string {
  try {
    const obj = JSON.parse(json)
    return JSON.stringify(obj, null, 2)
  } catch (e) {
    return json // Return original string if it's not valid JSON
  }
}

