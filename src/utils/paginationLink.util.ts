export function createPaginationLinks(
  page: number,
  limit: number,
  total: number,
  route: string,
) {
  const totalPages = Math.ceil(total / limit);
  return {
    first: `/${route}?page=1&limit=${limit}`,
    prev: page > 1 ? `/${route}?page=${page - 1}&limit=${limit}` : null,
    next:
      page < totalPages ? `/${route}?page=${page + 1}&limit=${limit}` : null,
    last: `/${route}?page=${totalPages}&limit=${limit}`,
  };
}
