interface FetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

export async function httpGet<T>(url: string): Promise<T> {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
  }
  
  return response.json() as Promise<T>;
}

export async function httpPost<T>(url: string, data: unknown): Promise<T> {
  const options: FetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
  }
  
  return response.json() as Promise<T>;
}

