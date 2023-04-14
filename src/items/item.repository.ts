import { CustomRepository } from 'src/db/typeorm-ex.decorator';
import { Item } from './item.entity';
import { Repository } from 'typeorm';

@CustomRepository(Item)
export class ItemRepository extends Repository<Item> {
  async getItemById(id: number) {
    return this.createQueryBuilder('item')
      .groupBy('item.id')
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
        'ij.urls AS urls',
        'icj.categories AS categories',
        'oj.options AS options',
      ])
      .innerJoin(
        (subQuery) =>
          subQuery
            .select('o.item_id')
            .addSelect(
              'JSON_ARRAYAGG(JSON_OBJECT("color", o.color, "size", o.size))',
              'options',
            )
            .from('options', 'o')
            .groupBy('o.item_id'),
        'oj',
        'oj.item_id = item.id',
      )
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
      .where('item.id = :id', { id: id })
      .getRawOne();
  }
}
