import { CustomRepository } from 'src/db/typeorm-ex.decorator';
import { Item } from './item.entity';
import { Repository } from 'typeorm';
import { ClauseBuilder } from 'src/utils/clauseBuilder';

@CustomRepository(Item)
export class ItemRepository extends Repository<Item> {
  async getItemById(id: number) {
    return this.createQueryBuilder('item')
      .select([
        'item.id AS id',
        'item.name AS name',
        'item.gender AS gender',
        'IF(item.is_new = 1, "신상O", "신상X") AS new',
        'item.price AS price',
        'item.discount_rate AS discount_rate',
        'IF(item.discount_rate > 0, item.price * (1 - item.discount_rate / 100), item.price) AS discounted_price',
        'item.description AS description',
        'DATE_FORMAT(item.release_date, "%Y-%m-%d") AS release_date',
        'image_subquery.urls AS images',
        'item_category_subquery.categories AS categories',
        'option_subquery.options AS options',
      ])
      .innerJoin(
        (subQuery) =>
          subQuery
            .select('options.item_id')
            .addSelect(
              'JSON_ARRAYAGG(JSON_OBJECT("color", options.color, "size", options.size))',
              'options',
            )
            .from('options', 'options')
            .groupBy('options.item_id'),
        'option_subquery',
        'option_subquery.item_id = item.id',
      )
      .innerJoin(
        (subQuery) =>
          subQuery
            .select('images.item_id')
            .addSelect('JSON_ARRAYAGG(images.url)', 'urls')
            .from('images', 'images')
            .groupBy('images.item_id'),
        'image_subquery',
        'image_subquery.item_id = item.id',
      )
      .innerJoin(
        (subQuery) =>
          subQuery
            .select('item_categories.item_id')
            .addSelect('JSON_ARRAYAGG(categories.name)', 'categories')
            .from('item_categories', 'item_categories')
            .innerJoin(
              'categories',
              'categories',
              'item_categories.category_id = categories.id',
            )
            .groupBy('item_categories.item_id'),
        'item_category_subquery',
        'item_category_subquery.item_categories_item_id = item.id',
      )
      .where('item.id = :id', { id: id })
      .groupBy('item.id')
      .getRawOne();
  }

  async getItems(
    limit: number,
    offset: number,
    search: string,
    sort: string,
    filters: Record<string, any>,
  ) {
    const clauseBuilder = new ClauseBuilder(search, sort, filters);

    const whereClause = clauseBuilder.buildWhereClause();
    const groupByClause = clauseBuilder.buildGroupByClause();
    const sortOrderClause = clauseBuilder.buildSortingOrderClause();

    const query = this.createQueryBuilder('item')
      .select([
        'item.id AS id',
        'item.name AS name',
        'item.gender AS gender',
        'IF(item.is_new = 1, "신상O", "신상X") AS new',
        'item.price AS price',
        'item.discount_rate AS discount_rate',
        'IF(item.discount_rate > 0, item.price * (1 - item.discount_rate / 100), item.price) AS discounted_price',
        'DATE_FORMAT(item.release_date, "%Y-%m-%d") AS release_date',
        'COUNT(DISTINCT(option.color)) AS color_count',
        'ij.urls AS images',
        'icj.categories AS categories',
      ])
      .innerJoin('options', 'option', 'option.item_id = item.id')
      .innerJoin(
        (subQuery) =>
          subQuery
            .select('i.item_id')
            .addSelect('JSON_ARRAYAGG(i.url)', 'urls')
            .from('images', 'i')
            .groupBy('i.item_id'),
        'ij',
        'ij.item_id = item.id',
      )
      .innerJoin(
        (subQuery) =>
          subQuery
            .select('ic.item_id')
            .addSelect('JSON_ARRAYAGG(c.name)', 'categories')
            .from('item_categories', 'ic')
            .innerJoin('categories', 'c', 'ic.category_id = c.id')
            .groupBy('ic.item_id'),
        'icj',
        'icj.ic_item_id = item.id',
      )
      .where(whereClause)
      .groupBy('item.id')
      .orderBy(groupByClause, sortOrderClause)
      .limit(limit)
      .offset((offset - 1) * limit);

    const total = await query.getCount();
    const result = await query.getRawMany();

    return {
      total,
      offset,
      result,
    };
  }
}
