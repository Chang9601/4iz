export class QueryBuilder {
  constructor(private sort?: string) {}

  buildSortQuery() {
    switch (this.sort) {
      case 'date':
        return 'releaseDate';
      case 'high':
        return 'price';
      case 'low':
        return 'price';
      default:
        return 'releaseDate';
    }
  }

  buildOrderQuery() {
    switch (this.sort) {
      case 'date':
        return 'DESC';
      case 'high':
        return 'DESC';
      case 'low':
        return 'ASC';
      default:
        return 'DESC';
    }
  }
}
