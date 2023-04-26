import { CustomRepository } from 'src/db/typeorm-ex.decorator';
import { Cart } from './cart.entity';
import { Repository } from 'typeorm';
import { Item } from 'src/items/item.entity';
import { CreateCartDto } from './dto/create-cart.dto';
import { Option } from 'src/items/option.entity';

@CustomRepository(Cart)
export class CartRepository extends Repository<Cart> {
  async createCart(createCartDto: CreateCartDto) {
    const carts: Cart[] = [];

    await this.manager.transaction(async (manager) => {
      const { itemId, options } = createCartDto;
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

        const cart = await manager.create(Cart, {
          totalPrice: quantity * item.price,
          totalQuantity: quantity,
        });

        // User: Many-to-One
        cart.options = [option];

        carts.push(cart);
        await manager.save(cart);
      }
    });

    return carts;
  }
}
