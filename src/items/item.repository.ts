import { Item } from './item.entity';
import { Repository } from 'typeorm';
import { ClauseBuilder } from 'src/utils/clause-builder';
import { CustomRepository } from 'src/db/typeorm-ex.decorator';
import { GetItemByIdDto } from './dto/get-item-by-id.dto';
import { RequestGetItemsDto } from './dto/request-get-items.dto';
import { ResponseGetItemsDto } from './dto/response-get-items.dto';

@CustomRepository(Item)
export class ItemRepository extends Repository<Item> {
  async getItemById(id: number): Promise<GetItemByIdDto> {
    const item = await this.createQueryBuilder('item')
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

    const getItemByIdDto: GetItemByIdDto = {
      item: item,
    };

    return getItemByIdDto;
  }

  async getItems(conditions: RequestGetItemsDto): Promise<ResponseGetItemsDto> {
    const { limit, offset, search, sort, category, size, color, gender } =
      conditions;

    const clauseBuilder = new ClauseBuilder(
      search,
      sort,
      category,
      size,
      color,
      gender,
    );

    const whereClause = clauseBuilder.buildWhereClause();
    const sortClause = clauseBuilder.buildSortClause();
    const orderClause = clauseBuilder.buildOrderClause();

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
        'image_subquery.urls AS images',
        'item_category_subquery.categories AS categories',
      ])
      .innerJoin('options', 'option', 'option.item_id = item.id')
      .innerJoin(
        (subQuery) =>
          subQuery
            .select([
              'images.item_id AS item_id',
              'JSON_ARRAYAGG(images.url) AS urls',
            ])
            .from('images', 'images')
            .groupBy('images.item_id'),
        'image_subquery',
        'image_subquery.item_id = item.id',
      )
      .innerJoin(
        (subQuery) =>
          subQuery
            .select([
              'item_categories.item_id AS item_id',
              'JSON_ARRAYAGG(categories.name) AS categories',
            ])
            .from('item_categories', 'item_categories')
            .innerJoin(
              'categories',
              'categories',
              'item_categories.category_id = categories.id',
            )
            .groupBy('item_categories.item_id'),
        'item_category_subquery',
        'item_category_subquery.item_id = item.id',
      )
      .where(whereClause)
      .groupBy('item.id')
      .orderBy(sortClause, orderClause)
      .limit(limit)
      .offset((offset - 1) * limit);

    const total = await query.getCount();
    const items: Item[] = await query.getRawMany();

    const responseGetItemsDto: ResponseGetItemsDto = {
      total: total,
      offset: offset,
      items: items,
    };

    return responseGetItemsDto;
  }
}
