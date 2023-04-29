import { Injectable, NotFoundException } from '@nestjs/common';
import { CartRepository } from './cart.repository';
import { CreateCartDto } from './dto/create-cart.dto';
import { Cart } from './cart.entity';

@Injectable()
export class CartsService {
  constructor(private readonly cartRepository: CartRepository) {}

  async createCart(createCartDto: CreateCartDto): Promise<Cart[]> {
    return this.cartRepository.createCart(createCartDto);
  }

  async deleteCart(id: number): Promise<void> {
    const result = await this.cartRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Cart with id ${id} not found`);
    }
  }
}
