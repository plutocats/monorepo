const DEFAULT_URL = process.env.NEXT_PUBLIC_PONDER || "http://localhost:42069"

const DEFAULT_OPTS = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  next: {
    revalidate: 30,
  }
};

export const query = (query, variables, opts = {}, url = DEFAULT_URL) => {
  const body = JSON.stringify({ query, variables });
  return fetch(url, Object.assign({}, DEFAULT_OPTS, opts, { body })).then((res) =>
    res.json()
  );
};
