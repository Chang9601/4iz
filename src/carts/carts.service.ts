import { Injectable } from '@nestjs/common';
import { CartRepository } from './cart.repository';
import { CreateCartDto } from './dto/create-cart.dto';
import { Cart } from './cart.entity';

@Injectable()
export class CartsService {
  constructor(private readonly cartRepository: CartRepository) {}

  async createCart(createCartDto: CreateCartDto): Promise<Cart[]> {
    return this.cartRepository.createCart(createCartDto);
  }
}
