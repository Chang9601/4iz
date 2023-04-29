import { Injectable, NotFoundException } from '@nestjs/common';
import { CartRepository } from './cart.repository';
import { CreateCartDto } from './dto/create-cart.dto';
import { Cart } from './cart.entity';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartsService {
  constructor(private readonly cartRepository: CartRepository) {}

  async getCartById(id: number): Promise<Cart> {
    const cart = await this.cartRepository.findOneBy({ id: id });

    if (!cart) {
      throw new NotFoundException(`Cart with id ${id} not found`);
    }

    return cart;
  }

  async createCart(createCartDto: CreateCartDto): Promise<Cart[]> {
    return this.cartRepository.createCart(createCartDto);
  }

  async deleteCart(id: number): Promise<void> {
    const result = await this.cartRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Cart with id ${id} not found`);
    }
  }

  async updateCart(id: number, updateCartDto: UpdateCartDto): Promise<Cart> {
    const cart = await this.getCartById(id);

    const price = cart.totalPrice / cart.totalQuantity;
    cart.totalQuantity = updateCartDto.quantity;
    cart.totalPrice = price * cart.totalQuantity;
    await this.cartRepository.save(cart);

    return cart;
  }
}
