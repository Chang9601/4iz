export class ClauseBuilder {
  private searchTypes = [
    `item.name`,
    `item.description`,
    `option.color`,
    `option.size`,
    `categories`,
    `item.gender`,
  ];

  constructor(
    private search: string,
    private sort: string,
    private filters: Record<string, any>,
  ) {}

  buildSearchClause() {
    const searchTypesLength = this.searchTypes.length;
    const clauseStringArray: string[] = [];
    let clauseString = '';

    for (
      let searchTypeIndex = 0;
      searchTypeIndex < searchTypesLength;
      searchTypeIndex++
    ) {
      clauseStringArray.push(
        this.searchTypes[searchTypeIndex] + ` LIKE "%${this.search}%"`,
      );
    }

    if (clauseStringArray.length !== 0) {
      clauseString = `${clauseStringArray.join(` OR `)}`;
    }

    return this.search === `` ? `` : `(${clauseString})`;
  }

  buildGenderClause(gender: string) {
    return `item.gender IN (${gender})`;
  }

  buildSizeClause(size: string) {
    return `option.size IN (${size})`;
  }

  buildColorClause(color: string) {
    return `option.color IN (${color})`;
  }

  buildCategoryClause(category: string) {
    return `categories LIKE "%${category}%"`;
  }

  buildWhereClause() {
    const builderSet = {
      genderBuilder: this.buildGenderClause,
      sizeBuilder: this.buildSizeClause,
      colorBuilder: this.buildColorClause,
      categoryBuilder: this.buildCategoryClause,
    };

    const searchClause = this.buildSearchClause();

    let filterClause = '';
    const filterClauseStringArray = Object.entries(this.filters).map(
      ([key, value]) => {
        switch (key) {
          case 'gender':
            return builderSet['genderBuilder'](value);
          case 'size':
            return builderSet['sizeBuilder'](value);
          case 'color':
            return builderSet['colorBuilder'](value);
          case 'category':
            return builderSet['categoryBuilder'](value);
          default:
            return '';
        }
      },
    );

    if (filterClauseStringArray.length !== 0) {
      filterClause = `${filterClauseStringArray.join(' AND ')}`;

      if (searchClause.length !== 0) {
        filterClause = ` AND (${filterClause})`;
      }
    }

    const completeClause = searchClause + filterClause;

    return completeClause;
  }

  buildGroupByClause() {
    switch (this.sort) {
      case 'date':
        return 'item.release_date';
      case 'high':
        return 'item.price';
      case 'low':
        return 'item.price';
      default:
        return 'item.release_date';
    }
  }

  buildSortingOrderClause() {
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
