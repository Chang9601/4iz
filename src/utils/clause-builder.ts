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
    private category: string,
    private size: string[],
    private color: string[],
    private gender: string[],
  ) {}

  buildSearchClause() {
    const searchTypesCount = this.searchTypes.length;
    const clauseArray: string[] = [];
    let clauseString = '';

    for (
      let searchTypeIndex = 0;
      searchTypeIndex < searchTypesCount;
      searchTypeIndex++
    ) {
      clauseArray.push(
        this.searchTypes[searchTypeIndex] + ` LIKE "%${this.search}%"`,
      );
    }

    if (clauseArray.length !== 0) {
      clauseString = `${clauseArray.join(` OR `)}`;
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
    const searchClause = this.buildSearchClause();

    const builderSet = {
      genderBuilder: (value: string[]) =>
        `item.gender IN (${value.map((item) => `"${item}"`).join(',')})`,
      sizeBuilder: (value: string[]) => `option.size IN (${value.join(',')})`,
      colorBuilder: (value: string[]) =>
        `option.color IN (${value.map((item) => `"${item}"`).join(',')})`,
      categoryBuilder: (value: string) => `categories LIKE "%${value}%"`,
    };

    const { category, size, color, gender } = this;

    let conditionClause = '';
    const conditionClauseArray = [
      category && builderSet['categoryBuilder'](category),
      size &&
        (Array.isArray(size)
          ? builderSet['sizeBuilder'](size)
          : builderSet['sizeBuilder']([size])),
      color &&
        (Array.isArray(color)
          ? builderSet['colorBuilder'](color)
          : builderSet['colorBuilder']([color])),
      gender &&
        (Array.isArray(gender)
          ? builderSet['genderBuilder'](gender)
          : builderSet['genderBuilder']([gender])),
    ].filter(Boolean);

    if (conditionClauseArray.length !== 0) {
      conditionClause = `${conditionClauseArray.join(' AND ')}`;

      if (searchClause.length !== 0) {
        conditionClause = ` AND (${conditionClause})`;
      }
    }
    const completeClause = searchClause + conditionClause;

    return completeClause;
  }

  buildSortClause() {
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

  buildOrderClause() {
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
