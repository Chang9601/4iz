import { CustomRepository } from '../repository/typeorm-ex.decorator';
import { Cart } from './cart.entity';
import { Repository } from 'typeorm';
import { Item } from '../items/item.entity';
import { RequestCreateCartDto } from './dto/request.create-cart.dto';
import { Option } from '../items/option.entity';
import { User } from '../auth/user.entity';
import { GetCartsDto } from './dto/get-carts.dto';
import { ResponseCreateCartDto } from './dto/response.create-cart.dto';
import { NotFoundException } from '@nestjs/common';

@CustomRepository(Cart)
export class CartsRepository extends Repository<Cart> {
  async createCart(
    requestCreateCartDto: RequestCreateCartDto,
    user: User,
  ): Promise<ResponseCreateCartDto[]> {
    const carts: Cart[] = [];
    const responseCreateCartDto: ResponseCreateCartDto[] = [];

    await this.manager.transaction(async (manager) => {
      const { itemId, options } = requestCreateCartDto;
      const [item] = await manager.find(Item, { where: { id: itemId } });

      for (let optionIndex = 0; optionIndex < options.length; optionIndex++) {
        const optionToArray = options[optionIndex].split('/');
        const color = optionToArray[0];
        const size = optionToArray[1];
        const quantity = +optionToArray[2];

        const [option] = await manager.find(Option, {
          where: {
            item: { id: item.id },
            color: color,
            size: size,
          },
        });

        if (option.stock <= 0) {
          throw new NotFoundException('Out of stock');
        }

        const cart = manager.create(Cart, {
          totalPrice: quantity * item.price,
          totalQuantity: quantity,
          user: user,
          options: [option],
        });

        responseCreateCartDto.push({
          totalPrice: cart.totalPrice,
          totalQuantity: cart.totalQuantity,
          option: option,
        });

        carts.push(cart);
      }

      await manager.save(Cart, carts);
    });

    return responseCreateCartDto;
  }

  async getCarts(
    limit: number,
    offset: number,
    user: User,
  ): Promise<GetCartsDto> {
    const query = this.createQueryBuilder('cart')
      .select([
        'cart.id AS cart_id',
        'item_subquery.item_id',
        'cart_option_subquery.size',
        'cart_option_subquery.color',
        'cart_option_subquery.stock',
        'item_subquery.name',
        'item_subquery.price',
        'IF(item_subquery.discount_rate > 0, cart.total_price * (1 - item_subquery.discount_rate / 100), cart.total_price) AS discounted_total_price',
        'cart.total_price AS total_price',
        'cart.total_quantity AS total_quantity',
        'image_subquery.urls AS images',
      ])
      .innerJoin('users', 'user', 'user.id = cart.user_id')
      .innerJoin(
        (subQuery) =>
          subQuery
            .select([
              'cart_options.cart_id AS cart_id',
              'cart_options.option_id AS option_id',
              'options.size AS size',
              'options.color AS color',
              'options.stock AS stock',
            ])
            .from('cart_options', 'cart_options')
            .innerJoin(
              'options',
              'options',
              'cart_options.option_id = options.id',
            ),
        'cart_option_subquery',
        'cart_option_subquery.cart_id = cart.id',
      )
      .innerJoin(
        (subQuery) =>
          subQuery
            .select([
              'items.id AS item_id',
              'items.name AS name',
              'items.price AS price',
              'items.discount_rate AS discount_rate',
              'options.id AS option_id',
            ])
            .from('options', 'options')
            .innerJoin('items', 'items', 'items.id = options.item_id'),
        'item_subquery',
        'item_subquery.option_id = cart_option_subquery.option_id',
      )
      .innerJoin(
        (subQuery) =>
          subQuery
            .select([
              'items.id AS item_id',
              'JSON_ARRAYAGG(images.url) AS urls',
            ])
            .from('images', 'images')
            .innerJoin('items', 'items', 'items.id = images.item_id')
            .groupBy('images.item_id'),
        'image_subquery',
        'image_subquery.item_id = item_subquery.item_id',
      )

      .where('user.id = :id', { id: user.id })
      .limit(limit)
      .offset((offset - 1) * limit);

    const total = await query.getCount();
    const carts: Cart[] = await query.getRawMany();

    const getCartsDto: GetCartsDto = {
      total: total,
      offset: offset,
      carts: carts,
    };

    return getCartsDto;
  }
}
